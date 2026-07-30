# ELEVÉ E-Commerce: DevOps & Deployment Guide

This guide provides step-by-step instructions for managing your Docker containers, Kubernetes clusters, and Jenkins CI/CD pipelines.

---

## 1. Docker Management

If you update your code locally and want to test it via Docker, or if you need to clean up old containers, use these commands.

### Starting Containers
To build and start all containers defined in your `docker-compose.yml` in the background:
```bash
docker-compose up -d --build
```

### Stopping Containers
To gracefully stop the running containers without deleting their data:
```bash
docker-compose stop
```

### Restarting Containers
If you made changes and just want to restart the existing containers:
```bash
docker-compose restart
```

### Deleting Containers & Rebuilding from Scratch
If you significantly updated the code (like changing `package.json`) and need a completely fresh start:
```bash
# 1. Stop and remove all containers, networks, and images
docker-compose down --rmi all -v

# 2. Rebuild and start everything fresh
docker-compose up -d --build
```

---

## 2. Kubernetes (K8s) Management

When deploying to a Kubernetes cluster (e.g., Minikube, EKS, GKE), you manage your pods and services using `kubectl`.

### Applying Updates
When you update your Kubernetes manifest files (`deployment.yaml`, `service.yaml`, etc.), apply the changes:
```bash
kubectl apply -f k8s/
```

### Restarting Pods (After a Code Update)
If you pushed a new Docker image with the same tag (e.g., `latest`) and want Kubernetes to pull it and restart the pods:
```bash
kubectl rollout restart deployment eleve-backend
kubectl rollout restart deployment eleve-frontend
```

### Stopping/Deleting Deployments
To completely tear down the application from the cluster:
```bash
kubectl delete -f k8s/
```
*(Alternatively, delete a specific deployment: `kubectl delete deployment eleve-backend`)*

### Checking Status
To see if your pods are running successfully:
```bash
# View all running pods
kubectl get pods

# Check logs of a specific pod if it is failing
kubectl logs <pod-name>
```

---

## 3. Jenkins Pipeline Management

Jenkins automates the process of building the Docker images and pushing them to Kubernetes.

### Triggering a Build After a Code Update
1. Commit and push your code to your Git repository (GitHub/GitLab).
2. If webhooks are configured, Jenkins will start building automatically.
3. If webhooks are NOT configured, go to the Jenkins Dashboard, open your Pipeline, and click **Build Now**.

### Stopping a Running Pipeline
If a Jenkins build is stuck or you pushed a mistake:
1. Go to the Jenkins Dashboard.
2. Click on the pipeline run that is currently in progress.
3. Click the red **X** (Stop) button next to the build progress bar to abort the job.

### Restarting a Failed Pipeline
If a build fails (e.g., due to a temporary network issue):
1. Open the failed build run in Jenkins.
2. Click **Replay** in the left sidebar to run it again with the exact same configuration.

---

## Summary Workflow: "I Updated My Code, What Now?"

**Option A: Local Docker Testing**
1. Write and save code.
2. Run `docker-compose down -v`
3. Run `docker-compose up -d --build`

**Option B: Production Kubernetes via Jenkins**
1. Write and save code.
2. `git add .`, `git commit -m "update"`, `git push`
3. Open Jenkins and click **Build Now**.
4. Jenkins will automatically build the new image, push it, and run `kubectl rollout restart deployment` for you!
