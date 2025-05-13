
## to save the changes in the frontend before building new image

    npm run build

## to run the whole application, frontend-backend and mongodb run

    docker-compose up --build

    go to localhost:8080


## to run the kubernetes pods

    I used my own docker registry to build and push the images. 

    for frontend and backend, build images and push them to your registry. 

    for frontend: 

        cd frontend/308_frontend

        docker build -t vegan-eats-frontend .

        docker tag vegan-eats-frontend:latest <yourdockeraccountname>/vegan-eats-frontend:latest

    for backend: 

        cd backend/vegan-eats

        docker build -t vegan-eats-backend .

        docker tag vegan-eats-backend:latest eudyll/vegan-eats-backend:latest

    based on <yourdockeraccountname>, change the container image path in deployment.yaml

apply deployments and services:

    kubectl apply -f backend-configmap.yaml

    kubectl apply -f backend-secret.yaml

    kubectl apply -f backend-deploymnet.yaml

    kubectl apply -f frontend-deployment.yaml

    kubectl apply -f mongo-deployment.yaml

the frontend should be accessible at http://127.0.0.1:30000/
