# Repository Contents

This repository includes:

- **Application Source Code:**  
    Source code for both backend and frontend components.
    backend source code is in `backend/` folder
    frontend source code is in `frontend/` folder

- **Deployment Scripts and Manifests:**  
    - Kubernetes YAML manifests for deploying services, configmaps, secrets, and autoscalers are in `k8s-configs/` folder
    - Also the setup scripts for setting up the VM and the commadns for  creating the kubernetes cluster are given in the same folder.

- **Load Testing Scripts:**  
    Locust scripts for performance and load testing, are in the tests folder.
    This folder also includes the results we collected and th terminal commands we used to run the experiments.

- **Documentation:**  
    - `README.md` with step-by-step deployment and setup instructions.
    - Additional setup guides and command references in the `setup-commands/` directory. 

All files required to replicate the deployment and testing environment are included in this repository.


# STEP BY STEP DEPLOYMENT PROCESS

## COMPONENT AND INFRASTRUCTURE MAPPING

- **DATABASE** → VM  
- **BACKEND** → Kubernetes GKE  
- **FRONTEND** → Kubernetes GKE  
- **PAYMENT VERIFICATION** → Google Cloud Run  

---

## STEP 1: DATABASE SETUP

**3.1 Virtual Machine:**

We started by creating a Virtual Machine (VM) instance for our database using GCP dashboard.  
- **Configuration:**  
  - Machine type: `e2-medium`
  - Disk: 10GB standard persistent disk
  - OS: Ubuntu 22.04 LTS  
  - See [usefulcommands.md](setup-commands/usefulcommands.md) for commands to list and describe VMs.
- **Firewall:**  
  - Enabled HTTP and HTTPS connections.
- **Setup:**  
  - SSH into the VM.
  - Run the custom setup script [`vm-db.sh`](setup-commands/vm-db.sh) to install MongoDB and configure it for remote access.
  - The script restores application data from a MongoDB Atlas backup, ensuring the database starts with the required data.

---

## STEP 2: SERVERLESS SETUP

**Serverless:**

We separated the payment verification logic into a serverless function. 
- **Development:**  
  - Created the source code for the serverless function (mock payment validation).
- **Deployment:**  
  - Selected region: `us-central1`
  - Runtime: `nodejs`
  - Allowed unauthenticated access.
  - Deployed the function to Google Cloud Run using GCP dashboard.
- **Integration:**  
  - Updated the function URL in the Kubernetes configmap `backend-configmap.yaml` .
  - If you have started the kubernetes before this step, you can restart the backend pod to ensure it uses the new serverless endpoint.

---

## STEP 3: KUBERNETES SETUP

**Kubernetes Cluster:**

We used Google Kubernetes Engine (GKE) for deploying the backend and frontend. 
- **Cluster Configuration:**  
    - We used `gcloud` SDK and Docker Desktop to create the cluster and apply the manifest files.
    - Cluster nodes: `e2-standard-4` machine type (see [usefulcommands.md](setup-commands/usefulcommands.md) for node pool info).
    - Autoscaling: min 1, max 3 nodes.
    - Region: `us-central1`

- **Setup Steps:**
    1. **Initial GCP Configuration**
            - Authenticate with Google Cloud:
                ```sh
                gcloud auth login
                ```
            - Set project and zone:
                ```sh
                gcloud config set project <your-project-id>
                gcloud config set compute/zone <your-preferred-zone>
                ```
    2. **Configure Artifact Registry Access**
            - Grant IAM roles:
                ```sh
                gcloud projects add-iam-policy-binding <project-id> \
                        --member=user:<your-email> \
                        --role=roles/artifactregistry.writer

                gcloud projects add-iam-policy-binding <project-id> \
                        --member=user:<your-email> \
                        --role=roles/artifactregistry.reader
                ```
            - Configure Docker authentication:
                ```sh
                gcloud auth configure-docker <region>-docker.pkg.dev
                ```
    3. **Build and Push Docker Images**
            - Tag images:
                ```sh
                # Frontend
                docker tag <your-frontend-image-name>:latest <region>-docker.pkg.dev/<project-id>/<registry-repo>/vegan-eats-frontend:latest
                # Backend
                docker tag <your-backend-image-name>:latest <region>-docker.pkg.dev/<project-id>/<registry-repo>/vegan-eats-backend:latest
    
                ```
            - Push images:
                ```sh
                docker push <region>-docker.pkg.dev/<project-id>/<registry-repo>/vegan-eats-frontend:latest
                docker push <region>-docker.pkg.dev/<project-id>/<registry-repo>/vegan-eats-backend:latest
                
                ```
            - See [local-kubernetes.md](setup-commands/local-kubernetes.md) for more build/push details.

            - Update `backend-deployment.yaml` and `frontend-deployment.yaml` files with your corresponding image paths.

    4. **Create and Configure GKE Cluster**

            - Create the cluster:

                ```sh
                gcloud container clusters create "my-app-cluster" \
                        --region us-central1 \
                        --num-nodes 1 \
                        --machine-type e2-standard-4 \
                        --enable-autoscaling \
                        --min-nodes 1 \
                        --max-nodes 3
                ```

            - Verify cluster:

                ```sh
                kubectl top nodes
                ```

            - Configure firewall:

                ```sh
                gcloud compute firewall-rules create allow-gke-traffic \
                        --allow=tcp:80,tcp:443 \
                        --description="Allow HTTP/HTTPS to GKE" \
                        --target-tags=gke-my-app-cluster
                ```

    5. **Deploy Application to GKE**
            - Apply Kubernetes manifests:

                ```sh
                kubectl apply -f backend-configmap.yaml
                kubectl apply -f backend-secret.yaml
                kubectl apply -f backend-deployment.yaml
                kubectl apply -f hpa.yaml
                kubectl apply -f frontend-deployment.yaml
                kubectl apply -f backend-locust-serve.yaml 
                ```

            - Verify deployment:
                ```sh
                kubectl get pods
                kubectl get services
                ```
            - Get frontend service external IP to access the ui:
                ```sh
                kubectl get service frontend
                ```

---

# REPRODUCIBILITY OF EXPERIMENTS

The details of our experiments are in the [`tests/`](./tests/) folder. Please refer to the [`tests/readme.md`](./tests/readme.md) file for more details.


---

This process ensures each component is deployed on the appropriate infrastructure, with clear separation and integration between database, serverless, and Kubernetes-managed services.
