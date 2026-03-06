# Deploying OpenSCG to Google Cloud Platform (GCP)

This guide describes the process of deploying the application to Google Cloud Run to enable accelerometer sensor access (which requires a secure HTTPS context).

## 1. GCP Project Preparation

1.  **Create a Project:** In the [GCP Console](https://console.cloud.google.com/), create a new project.
2.  **Link Billing:** Even for Free Tier usage, Google requires a Billing Account to be linked to the project. Cloud Run will not start without it.
3.  **Install Google Cloud SDK:** Ensure you have the `gcloud` CLI installed and are authenticated:
    ```powershell
    gcloud auth login
    ```

## 2. Access Control Setup (IAM)

To ensure successful build and deployment, run the following commands (replace `PROJECT_ID` and `USER_EMAIL` with your actual data):

```powershell
# Grant Owner role to your user
gcloud projects add-iam-policy-binding PROJECT_ID --member="user:USER_EMAIL" --role="roles/owner"

# Grant necessary roles to the Cloud Build service account for Cloud Run deployment
$projectNumber = gcloud projects describe PROJECT_ID --format="value(projectNumber)"
gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:$projectNumber@cloudbuild.gserviceaccount.com" --role="roles/run.admin"
gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:$projectNumber@cloudbuild.gserviceaccount.com" --role="roles/iam.serviceAccountUser"
```

## 3. Deployment Configuration

Deployment parameters are managed via a local YAML file.

1.  **Create Config:** Copy `deploy-params.yaml.template` to `deploy-params.yaml`.
2.  **Edit Values:** Fill in your specific GCP details:
    - `project_id`: Your GCP project ID.
    - `region`: The GCP region (e.g., `europe-west1`).
    - `service_name`: The name of your Cloud Run service.
    - `container_image`: The path to store the container in GCR.

*Note: `deploy-params.yaml` is excluded from Git via `.gitignore` to protect your project identifiers.*

## 4. Running the Deployment

A PowerShell script `deploy.ps1` is provided to automate the process.

**How the script works:**
1.  **Safety Check:** Verifies that `deploy-params.yaml` exists.
2.  **Staging Area:** It creates a temporary folder `_staging_deploy` and copies only the necessary application files.
3.  **Cloud Build:** It triggers the container build directly in the Google Cloud.
4.  **Cloud Run Deploy:** It deploys the built image as a service with a public HTTPS URL.

**To start deployment:**
```powershell
.\deploy.ps1
```

## 5. Technical Details (Dockerfile)

The `openscg_app/Dockerfile` is optimized for Cloud Run:
-   **Multi-stage build:** Minimizes the final image size.
-   **Port Binding:** Uses port 3000 as defined by Cloud Run requirements.

## 6. Verification

Once the script completes, you will receive a URL (e.g., `https://openscg-app-xxx.a.run.app`).
1.  Open this link **on a mobile phone**.
2.  The browser will detect the secure context (HTTPS) and correctly display the system prompt for accelerometer permissions.
