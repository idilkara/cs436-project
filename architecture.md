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
        HTTP request --> Serverless

    %% Apply classes
    class FE frontend;
    class BE backend;
    class BE2,BE1 backend-muted;
    class MongoDB mongodb;
    class Payment serverless;
    class User user;

    class POD1,POD2,Kubernetes_Cluster,Virtual_Machine,Serverless outer
```


---



| Software component         | GCP service used     | Scalability                |
|-------------------|--------------------------|----------------------------|
| Frontend Server    | K8s (GKE)   | We did't specify a changing replica numbers for this but it could be horizontally scalable. Vertical, node pool configuration can be manually changed.          |
| Backend Server      | K8s (GKE) | Horizontal, via horizontal pod autoscaler based on load. Vertical, node pool configuration can be manually changed. |
| MongoDB           | Virtual Machine          | Vertical (manually)           |
| Payment Verification Function  | Serverless (Cloud Functions) |  Handled by GCP (horizontal, vertical)        |


---

### Runtime Flow Diagram

```mermaid
flowchart TD
    User((User))
    FrontendService["Frontend Service"]
    FE["Frontend Pod"]
    BackendService["Backend Service 
        (Load Balancer)"]
    BE["Backend Pod"]
    MongoDB[("MongoDB VM")]
    Payment["Serverless Payment Verification"]

    User -- 1 HTTP Request --> FrontendService
    FrontendService -- 2 Forwards to --> FE
    FE -- 3 RESTful API Call --> BackendService
    BackendService -- 4 Load Balances to --> BE
    BE -- 5 DB Query --> MongoDB
    BE -- 6 Payment Webhook --> Payment
    Payment -- 7 Payment Result --> BE
    BE -- 8 Response --> FE
    FE -- 9 Response --> User
```

This diagram illustrates the flow of events between components during a typical user request, including frontend/backend routing, database access, and serverless payment verification.

---
