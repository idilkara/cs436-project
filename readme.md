# Vegan Eats - Cloud-Native E-Commerce Platform

## Project Overview
Vegan Eats is a cloud-native e-commerce platform built for CS436 Cloud Computing. The application demonstrates modern cloud architecture principles, utilizing microservices, containerization, and cloud-managed services.

## Cloud Architecture

### Infrastructure Components
- **Kubernetes Orchestration**
  - Google Kubernetes Engine (GKE) for container orchestration
  - Horizontal Pod Autoscaling for dynamic scaling
  - LoadBalancer service type for external access
  - ConfigMaps and Secrets for configuration management

- **Container Registry**
  - Google Artifact Registry for container image management
  - Automated container builds and deployments
  - Version control and image tagging

- **Database Layer**
  - MongoDB deployment on VM
  - Persistent SSD for data persistence
  - Database replication for high availability

- **Cloud Functions (Serverless Components)**
  - `invoiceSender`: Event-driven invoice generation
  - `paymentValidate`: Serverless payment processing
  - Pub/Sub integration for asynchronous communication

### Application Components

#### Frontend (React/Vite)
- https://github.com/nilsarisi/308_frontend.git
- Containerized React application
- Nginx-based reverse proxy
- Multiple specialized admin interfaces
- Deployed as Kubernetes pods with rolling updates

#### Backend (Node.js)
- https://github.com/cemrekkandemir/Vegan-Eats.git
- Microservices architecture
- RESTful API containerized in Docker
- Horizontal scaling based on CPU/Memory metrics
- Health checks and readiness probes

## Deployment Infrastructure

### 1. Local Development Environment
- Docker Compose for local service orchestration
- Minikube for local Kubernetes development
- Local MongoDB instance via Docker
- See [Local Setup Guide](./local-kubernetes.md)

### 2. Production Cloud Deployment
- **Google Cloud Platform (GCP)**
  - GKE cluster with node autoscaling
  - See [GKE Deployment Guide](./gke-setupt.md)

  - Database on a vitrual machine with a linux server
  - You can create a VM and run the shell script [vm-db.sh] (./vm-db.sh)

## Performance and Reliability
- Load testing with Locust (`locust-test.py`)
- Kubernetes liveness and readiness probes
- Automated scaling policies
- Network policies for security

## Project Structure
```
project/
├── k8s-configs/           # Kubernetes manifests
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── mongo-deployment.yaml
├── backend/               # Containerized backend service
├── frontend/             # Containerized frontend 
├── functions/            # Cloud Functions
└── docker-compose.yml    # Local development setup
```

