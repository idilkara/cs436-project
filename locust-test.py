# locust-test.py
from locust import HttpUser, SequentialTaskSet, task, between, events
from locust.exception import StopUser
import random

TEST_EMAIL    = "12312@123"
TEST_PASSWORD = "123"

class FullUserFlow(SequentialTaskSet):

    def on_start(self):
        # 1) Login and store JWT
        resp = self.client.post(
            "/api/users/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            name="Login"
        )
        if resp.status_code != 200:
            raise StopUser(f"Login failed ({resp.status_code})")
        data = resp.json()
        token = data.get("accessToken")
        if not token:
            raise StopUser("Login response missing accessToken")
        self.client.headers.update({"Authorization": f"Bearer {token}"})

        # 2) pre-fetch product list
        r = self.client.get("/api/products", name="List Products")
        self.products = r.json() if r.status_code == 200 else []

    @task
    def view_random_product(self):
        if not self.products:
            return
        p = random.choice(self.products)
        self.client.get(f"/api/products/{p['_id']}", name="Get Product")

    @task
    def add_to_cart(self):
        if not self.products:
            return
        p = random.choice(self.products)
        self.client.post(
            "/api/cart/add",
            json={"productId": p["_id"], "quantity": 1},
            name="Add To Cart"
        )

    @task
    def view_cart(self):
        self.client.get("/api/cart/view", name="View Cart")

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
        self.client.post(
            "/api/orders/place",
            json={"shippingInfo": shipping, "paymentMethodId": "pm_card_visa"},
            name="Place Order"
        )

class WebsiteUser(HttpUser):
    host = "http://34.122.214.213"
    tasks = [FullUserFlow]
    wait_time = between(1, 3)