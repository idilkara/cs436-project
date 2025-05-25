# Vegan Eats - Cloud-Native E-Commerce Platform


<img src="images-ui/homepage.png" width="1000" alt="Homepage" />

<img src="images-ui/order.png" width="1000" alt="Order Completed" />


## Project Overview
Vegan Eats is an e-commerce application that we used for our CS436 Cloud Computing term project. Under the project, we deployed application on the google cloud demonstrating modern cloud architecture principles, utilizing containerization, and cloud-managed services.

## Application Architecture on the Cloud 

```mermaid
---
title: Cloud Architecture Diagram
---

flowchart TB


    %% Define colors
    classDef frontend fill:#e0f7fa,stroke:#00796b,stroke-width:2px;
    classDef backend fill:#fff9c4,stroke:#fbc02d,stroke-width:2px;
    classDef backend-muted fill:#fffde7,stroke:#ffe082,stroke-width:2px;
    classDef mongodb fill:#f8bbd0,stroke:#ad1457,stroke-width:2px;
    classDef serverless fill:#d1c4e9,stroke:#512da8,stroke-width:2px;
    classDef user fill:#c8e6c9,stroke:#388e3c,stroke-width:2px;
    classDef outer fill:#ffffff,stroke:#00796b,stroke-width:2px;

    subgraph "Kubernetes_Cluster"
        subgraph POD1["Frontend Deployment"]
            FE["Frontend Application Pod"]
        end
        FrontendService["Frontend Service"]
        FrontendService --> FE

        subgraph POD2["Backend Deployment"]

        
            BE1["Backend Application Pod"]
            BE["Backend Application Pod"]
            BE2["Backend Application Pod"]

        end

        BackendService["Backend Service 
            (load balancer)"]

        BackendService --> BE1
        BackendService --> BE
      
        BackendService --> BE2
    end

    subgraph "Virtual_Machine"
        MongoDB[("MongoDB Database")]
    end
    
    subgraph "Serverless"
        Payment["Serverless: payment
                    verification"]
    end

    User(("User"))
    User -- user sends HTTP request --> FrontendService
    FE -- make a request to backend 
            using 
            RESTful API --> BackendService
    
    BE -- manage database 
        via MongoDB Protocol --> MongoDB
    BE -- for payment checks 
        HTTPS/Webhook request --> Serverless

    %% Apply classes
    class FE frontend;
    class BE backend;
    class BE2,BE1 backend-muted;
    class MongoDB mongodb;
    class Payment serverless;
    class User user;

    class POD1,POD2,Kubernetes_Cluster,Virtual_Machine,Serverless outer
```


### Infrastructure Components
- **Kubernetes Orchestration**
  - Google Kubernetes Engine (GKE) for container orchestration
  - Horizontal Pod Autoscaling for dynamic scaling the backend pods
  - LoadBalancer service type for internal access
  - ConfigMaps and Secrets for configuration management

- **Container Registry**
  - Google Artifact Registry for container image management
  - Automated container builds and deployments
  - Version control and image tagging

- **Database Layer**
  - MongoDB deployment on VM
  - Persistent SSD for data persistence

- **Cloud Functions (Serverless Components)**
  - `paymentValidate`: Serverless payment processing [function code](./functions/paymentValidate/)

### Application Components

#### Frontend (React/Vite)
- https://github.com/nilsarisi/308_frontend.git
- Containerized React application [Dockerfile](./frontend/308_frontend/Dockerfile)
- Nginx-based reverse proxy
- Multiple specialized admin interfaces
- Deployed as Kubernetes pods with rolling updates

#### Backend (Node.js)
- https://github.com/cemrekkandemir/Vegan-Eats.git
- RESTful API containerized in Docker [Dockerfile](./backend/Vegan-Eats/Dockerfile)

- Horizontal scaling based on CPU/Memory metrics [HPA configuration](./k8s-configs/hpa.yaml)
- Health checks and readiness probes

#### Database (MongoDB)



## Deployment Infrastructure

### 1. Local Development Environment
- Docker Compose for local service orchestration [see docker-compose](./docker-compose.yaml)
- Minikube for local Kubernetes development
- Local MongoDB instance via Docker
- See [Local Setup Guide](./local-kubernetes.md)

### 2. Production Cloud Deployment
- **Google Cloud Platform (GCP)**
  - GKE cluster with node autoscaling, see [GKE Deployment Guide](./gke-setupt.md) and the [folder](./k8s-configs/)
  - Database on a vitrual machine with a linux server
  - You can create a VM and run the shell script [vm-db.sh] (./vm-db.sh)

## Performance and Reliability
- Testing with Locust (`./tests/locust-test.py`) while also changing the cloud architecture system parameters. (we talked about this in out presentation)
- Kubernetes liveness and readiness probes
- Automated scaling policicies
- Network policies for security

## Project Structure
```
project/
├── k8s-configs/           # Kubernetes manifests files
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── ...more yaml files
|
├── backend/              # Backend source code and Dockerfile to containerize it.
├── frontend/             # Frontend source code and Dockerfile to containerize it. 
├── functions/            # The source codes for the functions we deployed on Cloud Run Functions
├── tests/                # testing realated information, locust test script and the results.
├── setup-commands/       # the instructions to create deploy the applicaion on google cloud.
└── setup-commands/docker-compose.yml    # Local development setup for debugging
```

## Testing

Locust Testing details and results can be found under the [test folder](./tests/) 