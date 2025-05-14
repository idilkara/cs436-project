from locust import HttpUser, SequentialTaskSet, task, between, events
import random

# use one of your real test accounts
TEST_EMAIL    = "nil.sarisik@sabanciuniv.edu"
TEST_PASSWORD = "nil"

class FullUserFlow(SequentialTaskSet):

    def on_start(self):
        # 1) Login and grab accessToken
        resp = self.client.post(
            "/api/users/login",
            json={ "email": TEST_EMAIL, "password": TEST_PASSWORD },
            name="Login"
        )
        if resp.status_code != 200:
            events.quitting.fire(reason=f"Login failed ({resp.status_code})")
        data = resp.json()
        token = data.get("accessToken")
        if not token:
            events.quitting.fire(reason="Login response missing accessToken")

        # attach JWT to all future requests
        self.client.headers.update({ "Authorization": f"Bearer {token}" })

        # 2) fetch product list for later steps
        r = self.client.get("/api/products", name="List Products")
        if r.status_code == 200:
            self.products = r.json()
        else:
            self.products = []

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
            json={ "productId": p["_id"], "quantity": 1 },
            name="Add To Cart"
        )

    @task
    def view_cart(self):
        self.client.get("/api/cart/view", name="View Cart")

    @task
    def mock_payment(self):
        # needs full card details to pass your Joi schema  [oai_citation:0‡paymentController.js](file-service://file-VRsCgyVDM6A8bpvjb8eMvq)
        payment_payload = {
            "nameOnCard":    "Load Tester",
            "cardNumber":    "4111111111111111",   # a valid Visa test number
            "expiry":        "12/30",              # MM/YY format
            "cvv":           "123",                # exactly 3 digits
            "amount":        1099                  # positive number
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
            json={ "shippingInfo": shipping },
            name="Place Order"
        )

class WebsiteUser(HttpUser):
    # point Locust at your frontend/load-balancer which proxies /backend → your Express app
    host = "http://34.122.214.213/backend"
    tasks = [FullUserFlow]
    wait_time = between(1, 3)