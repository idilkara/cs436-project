from locust import HttpUser, TaskSet, task, between
import uuid, random

class FullUserFlow(TaskSet):
    def on_start(self):
        self.new_user()

    def new_user(self):
        uid = uuid.uuid4().hex[:8]
        self.email = f"user_{uid}@loadtest.local"
        self.password = f"Pwd!{uid}"
        # Signup
        signup = self.client.post("/api/users/signup", json={
            "name": f"LoadTester{uid}", "email": self.email,
            "password": self.password, "address": "123 Load St"
        })
        # Login
        login = self.client.post("/api/users/login", json={
            "email": self.email, "password": self.password
        })
        token = login.json().get("accessToken")
        self.client.headers.update({ "Authorization": f"Bearer {token}" })

        # Products
        resp = self.client.get("/api/products")
        self.products = resp.json() if resp.status_code == 200 else []

    @task
    def full_flow(self):
        if not self.products:
            return

        # View
        p = random.choice(self.products)
        self.client.get(f"/api/products/{p['_id']}", name="Get Product")
        # Add to Cart
        self.client.post("/api/cart/add", json={"productId": p["_id"], "quantity": 1}, name="Add To Cart")
        # View Cart
        self.client.get("/api/cart/view", name="View Cart")
        # Pay
        self.client.post("/api/payment/mock-payment", json={
            "nameOnCard": "Load Tester", "cardNumber": "4111111111111111",
            "expiry": "12/30", "cvv": "123", "amount": 1099
        }, name="Mock Payment")
        # Place Order
        self.client.post("/api/orders/place", json={
            "shippingInfo": {
                "name": "Load Test", "address": "123 Test Lane",
                "city": "Testville", "postalCode": "00000", "country": "Testland"
            }
        }, name="Place Order")

class WebsiteUser(HttpUser):
    tasks = [FullUserFlow]
    wait_time = between(1, 3)
    host = "http://35.188.187.80:5000"
