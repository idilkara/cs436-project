#  Kubernetes setup using Google Cloud CLI 

### Sign In and Set Configuration

    gcloud auth login

    gcloud config set project <project>

    gcloud config set compute/zone <zone>

### Grant Artifact Registry roles and access

    gcloud projects add-iam-policy-binding <project> --member=user:<useremail> --role=roles/artifactregistry.writer

    gcloud projects add-iam-policy-binding <project> --member=user:<useremail> --role=roles/artifactregistry.reader


### Authenticate Docker with Artifact Registry

    gcloud auth configure-docker <zone>-docker.pkg.dev

    tag the images and push them to google cloud artifact registry

### Tag and Push Docker Images

build the images for frontend and backend if you have not done that, then run the following

#### tag

    docker tag <dockerusername>/vegan-eats-frontend:latest us-central1-docker.pkg.dev/<project>/<registry_repository>/vegan-eats-frontend:latest

    docker tag <dockerusername>/vegan-eats-backend:latest us-central1-docker.pkg.dev/<project>/<registry_repository>/vegan-eats-backend:latest

#### push 

    docker push us-central1-docker.pkg.dev/<project>/<registry_repository>/vegan-eats-frontend:latest

    docker push us-central1-docker.pkg.dev/<project>/<registry_repository>/vegan-eats-backend:latest

### optionally put mongo db as part of the cluster - configure the urls based on this too. 

    docker pull mongo:latest

    tag mongo:latest us-central1-docker.pkg.dev/cs436termprojectgroup9/images436/mongo:latest

    docker push us-central1-docker.pkg.dev/cs436termprojectgroup9/images436/mongo:latest

### Create a GKE Cluster

    gcloud container clusters create "my-app-cluster"   --region us-central1  --num-nodes 1 --machine-type e2-standard-4 --enable-autoscaling --min-nodes 1 --max-nodes 3

#### verify

    kubectl top nodes

### configute firewall for http/https access

    gcloud compute firewall-rules create allow-gke-traffic --allow=tcp:80,tcp:443 --description="Allow HTTP/HTTPS to GKE" --target-tags=gke-my-app-cluster

### adjust the manifest files if required then run the following to run pods

    kubectl apply -f backend-configmap.yaml

    kubectl apply -f backend-secret.yaml

    kubectl apply -f backend-deploymnet.yaml

    kubectl apply -f frontend-deployment.yaml

    (optionally) kubectl apply -f mongo-deployment.yaml 

the frontend should then be accessible at the external-ip you see after executing this command

    kubectl get service frontend

