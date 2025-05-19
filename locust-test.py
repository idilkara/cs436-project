import uuid
import random
from locust import HttpUser, SequentialTaskSet, task, between, events, StopUser

class FullUserFlow(SequentialTaskSet):
    def on_start(self):
        # 1) generate unique signup creds
        uid = uuid.uuid4().hex[:8]
        self.email    = f"user_{uid}@loadtest.local"
        self.password = f"Pwd!{uid}"

        # 2) SIGN UP
        signup = self.client.post(
            "/api/users/signup",
            json={
                "name":    f"LoadTester{uid}",
                "email":   self.email,
                "password": self.password,
                "address": "123 Load St"
            },
            name="Signup",
            catch_response=True
        )
        if signup.status_code not in (200,201):
            signup.failure(f"Signup failed: {signup.status_code}")
            events.quitting.fire(reason="Signup failed")
            return

        # 3) LOGIN
        login = self.client.post(
            "/api/users/login",
            json={ "email": self.email, "password": self.password },
            name="Login",
            catch_response=True
        )
        if login.status_code != 200:
            login.failure(f"Login failed: {login.status_code}")
            events.quitting.fire(reason="Login failed")
            return
        token = login.json().get("accessToken")
        if not token:
            login.failure("Login succeeded but no accessToken")
            events.quitting.fire(reason="Login no token")
            return

        # attach JWT header
        self.client.headers.update({ "Authorization": f"Bearer {token}" })

        # 4) preload products
        resp = self.client.get("/api/products", name="List Products", catch_response=True)
        if resp.status_code != 200:
            resp.failure(f"List products failed: {resp.status_code}")
            self.products = []
        else:
            self.products = resp.json()

    @task
    def view_random_product(self):
        if not self.products:
            return
        p = random.choice(self.products)
        with self.client.get(f"/api/products/{p['_id']}",
                             name="Get Product", catch_response=True) as r:
            if r.status_code != 200:
                r.failure(f"Get product failed: {r.status_code}")

    @task
    def add_to_cart(self):
        if not self.products:
            return
        p = random.choice(self.products)
        with self.client.post("/api/cart/add",
                              json={"productId": p["_id"], "quantity": 1},
                              name="Add To Cart", catch_response=True) as r:
            if r.status_code != 200:
                r.failure(f"Add to cart failed: {r.status_code}")

    @task
    def view_cart(self):
        with self.client.get("/api/cart/view",
                             name="View Cart", catch_response=True) as r:
            if r.status_code != 200:
                r.failure(f"View cart failed: {r.status_code}")

    @task
    def mock_payment(self):
        payment_payload = {
            "nameOnCard":    "Load Tester",
            "cardNumber":    "4111111111111111",
            "expiry":        "12/30",
            "cvv":           "123",
            "amount":        1099
        }
        self.client.post(
            "/api/payment/mock-payment",
            json=payment_payload,
            name="Mock Payment"
        )

    @task
    def place_order(self):
        shipping = {
            "name":       "Load Test",
            "address":    "123 Test Lane",
            "city":       "Testville",
            "postalCode": "00000",
            "country":    "Testland"
        }
        with self.client.post("/api/orders/place",
                              json={"shippingInfo": shipping},
                              name="Place Order",
                              catch_response=True) as r:
            if r.status_code not in (200, 201):
                r.failure(f"Place order failed: {r.status_code}")

        # now stop this user
        raise StopUser()

class WebsiteUser(HttpUser):
    host = "http://34.122.214.213"
    tasks = [FullUserFlow]
    wait_time = between(1, 3)
