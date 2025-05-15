# Google Kubernetes Engine (GKE) Deployment Guide

## Prerequisites
- Google Cloud Platform (GCP) account
- Google Cloud CLI (`gcloud`) installed
- Docker installed
- kubectl installed

## Setup Steps

### 1. Initial GCP Configuration

1. Authenticate with Google Cloud:
```bash
gcloud auth login
```

2. Configure project and zone:
```bash
gcloud config set project <your-project-id>
gcloud config set compute/zone <your-preferred-zone>
```

### 2. Configure Artifact Registry Access

1. Grant necessary IAM roles:
```bash
# Grant Artifact Registry Writer role
gcloud projects add-iam-policy-binding <project-id> \
    --member=user:<your-email> \
    --role=roles/artifactregistry.writer

# Grant Artifact Registry Reader role
gcloud projects add-iam-policy-binding <project-id> \
    --member=user:<your-email> \
    --role=roles/artifactregistry.reader
```

2. Configure Docker authentication:
```bash
gcloud auth configure-docker <region>-docker.pkg.dev
```

### 3. Push Docker Images to Artifact Registry

1. Tag your Docker images:
```bash
# Tag frontend image
docker tag <your-frontend-image>:latest \
    <region>-docker.pkg.dev/<project-id>/<registry-repo>/vegan-eats-frontend:latest

# Tag backend image
docker tag <your-backend-image>:latest \
    <region>-docker.pkg.dev/<project-id>/<registry-repo>/vegan-eats-backend:latest

# Optional: Tag MongoDB image
docker tag mongo:latest \
    <region>-docker.pkg.dev/<project-id>/<registry-repo>/mongo:latest
```

2. Push images to Artifact Registry:
```bash
# Push frontend
docker push <region>-docker.pkg.dev/<project-id>/<registry-repo>/vegan-eats-frontend:latest

# Push backend
docker push <region>-docker.pkg.dev/<project-id>/<registry-repo>/vegan-eats-backend:latest

# Optional: Push MongoDB
docker push <region>-docker.pkg.dev/<project-id>/<registry-repo>/mongo:latest
```

### 4. Create and Configure GKE Cluster

1. Create the cluster:
```bash
gcloud container clusters create "my-app-cluster" \
    --region us-central1 \
    --num-nodes 1 \
    --machine-type e2-standard-4 \
    --enable-autoscaling \
    --min-nodes 1 \
    --max-nodes 3
```

2. Verify cluster status:
```bash
kubectl top nodes
```

3. Configure firewall rules:
```bash
gcloud compute firewall-rules create allow-gke-traffic \
    --allow=tcp:80,tcp:443 \
    --description="Allow HTTP/HTTPS to GKE" \
    --target-tags=gke-my-app-cluster
```

### 5. Deploy Application to GKE

1. Apply Kubernetes configurations:
```bash
kubectl apply -f backend-configmap.yaml
kubectl apply -f backend-secret.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f mongo-deployment.yaml  # Optional if using managed MongoDB
```

2. Verify deployment:
```bash
kubectl get pods
kubectl get services
```

3. Get frontend service external IP, you can use this to access the frontend:
```bash
kubectl get service frontend
```
