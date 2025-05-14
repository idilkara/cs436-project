from locust import HttpUser, task, between
import logging
class WebsiteUser(HttpUser):

    host = "http://34.41.190.189:5000" 

    wait_time = between(1, 5)  # wait between 1-5 seconds between tasks
    
    @task
    def view_products(self):
        with self.client.get("/api/products", catch_response=True) as response:
            # Log the response status and body
            logging.info(f"Response status: {response.status_code}")
            logging.info(f"Response body: {response.text}")
            
            # Validate response (optional)
            if response.status_code != 200:
                response.failure("Got wrong response code")
            elif "products" not in response.text:
                response.failure("Missing 'products' in response")
