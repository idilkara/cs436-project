List GKE clusters

    gcloud container clusters list

Get configuration info of Node Pool

     gcloud container node-pools list --cluster <CLUSTERNAME> --zone <ZONE>

    output:
    NAME          MACHINE_TYPE   DISK_SIZE_GB  NODE_VERSION
    default-pool  e2-standard-4  100           1.32.2-gke.1297002

List VMs

    NAME                                           ZONE           MACHINE_TYPE   PREEMPTIBLE  INTERNAL_IP  EXTERNAL_IP    STATUS
instance-a                                     us-central1-a  e2-medium                   10.128.0.10  34.70.3.234    RUNNING
gke-my-app-cluster-default-pool-fd5a9ed8-gfcw  us-central1-b  e2-standard-4               10.128.0.7   35.222.47.170  RUNNING
gke-my-app-cluster-default-pool-e77e76d2-jdqs  us-central1-c  e2-standard-4               10.128.0.9   34.71.85.9     RUNNING
gke-my-app-cluster-default-pool-90783d3f-n0d0  us-central1-f  e2-standard-4               10.128.0.8   34.31.51.82    RUNNING

Get Detailed Information About a Specific VM

    gcloud compute instances describe INSTANCE_NAME --zone ZONE_NAME

To check machine type and disk size 

    gcloud compute instances describe instance-a \
        --zone us-central1-a \
        --format="value(machineType.basename(), disks[0].diskSizeGb)"
        e2-medium	10

 gcloud compute instances list \
  --filter="metadata.items.key['cluster-name']='my-app-cluster'" \
  --format="value(zone)" | sort | uniq -c
   1 us-central1-b
   1 us-central1-c
   1 us-central1-f


gcloud container node-pools list \
  --cluster my-app-cluster \
  --region us-central1 \
  --format="table(name, autoscaling.minNodeCount, autoscaling.maxNodeCount, autoscaling.enabled)"
NAME          MIN_NODE_COUNT  MAX_NODE_COUNT  ENABLED
default-pool  1               3               True