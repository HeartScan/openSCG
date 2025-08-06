# Azure Deployment Guide for OpenSCG Backend

This document provides a complete, step-by-step guide for deploying the OpenSCG backend to Azure using the automated CI/CD pipeline defined in this repository.

## Overview

The deployment strategy consists of three main parts:
1.  **Azure Resources:** The necessary infrastructure on Azure to host our application.
2.  **GitHub Configuration:** The secrets and variables required for the CI/CD workflow to authenticate and operate.
3.  **CI/CD Workflow:** The automated process powered by GitHub Actions that builds and deploys the application.

---

### Step 1: Create Azure Resources

You only need to perform these actions once.

1.  **Log in to the Azure Portal.**
2.  **Create a Resource Group:** This will act as a container for all our project's resources.
    *   **Name:** `openscg-rg` (or your preferred name).
3.  **Create an Azure Container Registry (ACR):** This will store our Docker images.
    *   Navigate to "Container registries" and create a new one.
    *   **Resource group:** Select the `openscg-rg` you just created.
    *   **Registry name:** Choose a unique name, for example, `openscgregistry`.
    *   **SKU:** `Basic` is sufficient.
4.  **Create a Container Apps Environment:** This is the environment where our application will run.
    *   Navigate to "Container Apps Environment" and create a new one.
    *   **Resource group:** Select `openscg-rg`.
    *   **Environment name:** Choose a name, for example, `openscg-env`.

---

### Step 2: Configure GitHub Secrets and Variables

This step connects your GitHub repository to your Azure account, allowing the CI/CD pipeline to deploy on your behalf.

1.  **Navigate to your GitHub Repository Settings:** Go to `Settings` > `Secrets and variables` > `Actions`.

2.  **Create the `AZURE_CREDENTIALS` Secret:**
    *   Go to the **"Secrets"** tab.
    *   Click **"New repository secret"**.
    *   **Name:** `AZURE_CREDENTIALS`
    *   **Value:** To get the value, open the **Azure Cloud Shell** (the `>_` icon in the Azure Portal) and run the following command, replacing `{subscription-id}` with your actual Azure Subscription ID:
        ```bash
        az ad sp create-for-rbac --name "OpenSCGWorkflow" --role "Contributor" --scopes /subscriptions/{subscription-id}/resourceGroups/openscg-rg --sdk-auth
        ```
    *   Copy the entire JSON output from this command and paste it into the secret's value field.

3.  **Create the Repository Variables:**
    *   Go to the **"Variables"** tab.
    *   Create the following three variables:
        *   **Name:** `AZURE_CONTAINER_REGISTRY`
          **Value:** The name of your ACR (e.g., `openscgregistry`).
        *   **Name:** `AZURE_RESOURCE_GROUP`
          **Value:** The name of your resource group (e.g., `openscg-rg`).
        *   **Name:** `CONTAINER_APP_NAME`
          **Value:** The desired name for your application (e.g., `openscg-server`).
        *   **Name:** `CONTAINER_APP_ENVIRONMENT`
          **Value:** The name of the Container Apps Environment you created (e.g., `openscg-env`).

---

### Step 3: Trigger the Deployment

The CI/CD pipeline is defined in `.github/workflows/deploy-backend.yml`. It is configured to run automatically on any push to the `main` branch.

Once the resources and secrets are configured, any push to the `main` branch will trigger the workflow, which will:
1.  Build the Docker image from the `server/` directory.
2.  Push the image to your Azure Container Registry.
3.  Deploy the new image to your Azure Container App. The workflow uses the official `azure/container-apps-deploy-action@v1` action, which will create the application on the first run and update it on subsequent runs.

The workflow is configured to deploy a container with `0.25` CPU cores and `0.5Gi` of memory, and it will scale to a maximum of one replica, with a minimum of zero replicas to save costs.

---

### Step 4: Connect the Frontend

1.  After the first successful deployment, go to your `openscg-server` Container App in the Azure Portal.
2.  On the "Overview" page, find and copy the **Application Url**.
3.  Go to your frontend project settings on Vercel.
4.  Set the `NEXT_PUBLIC_API_URL` environment variable to the Application Url you just copied.
5.  Redeploy the frontend on Vercel to apply the new variable.
