# OpenSCG Deployment Script for Google Cloud Run
# Reliable Staging-based strategy

$ErrorActionPreference = "Stop"

# Safety Check: Ensure deploy-params.yaml exists
if (-not (Test-Path "deploy-params.yaml")) {
    Write-Host "ERROR: deploy-params.yaml not found!" -ForegroundColor Red
    Write-Host "Please copy deploy-params.yaml.template to deploy-params.yaml and fill in your GCP project details."
    exit 1
}

# Load parameters from YAML
$content = Get-Content "deploy-params.yaml" -Raw
$projectId = ($content | Select-String -Pattern 'project_id:\s*"([^"]+)"').Matches.Groups[1].Value
$region = ($content | Select-String -Pattern 'region:\s*"([^"]+)"').Matches.Groups[1].Value
$serviceName = ($content | Select-String -Pattern 'service_name:\s*"([^"]+)"').Matches.Groups[1].Value
$containerImage = ($content | Select-String -Pattern 'container_image:\s*"([^"]+)"').Matches.Groups[1].Value

Write-Host "--- Deploying OpenSCG App to GCP (Staging Mode) ---" -ForegroundColor Cyan
Write-Host "Project ID: $projectId"
Write-Host "Region:     $region"
Write-Host "Service:    $serviceName"

# 1. Create staging area
$stagingDir = "_staging_deploy"
if (Test-Path $stagingDir) { Remove-Item -Recurse -Force $stagingDir }
New-Item -ItemType Directory -Path $stagingDir | Out-Null

Write-Host "`n[1/4] Preparing staging area..." -ForegroundColor Yellow
# Copy openscg_app content to staging root
# We use -Recurse and -Force to ensure all files and subfolders (like public/) are copied.
Copy-Item -Path "openscg_app\*" -Destination $stagingDir -Recurse -Force

# Ensure .gcloudignore and .dockerignore are present in staging
if (Test-Path ".gcloudignore") {
    Copy-Item -Path ".gcloudignore" -Destination "$stagingDir\.gcloudignore" -Force
}
if (Test-Path ".dockerignore") {
    Copy-Item -Path ".dockerignore" -Destination "$stagingDir\.dockerignore" -Force
}

# IMPORTANT: Explicitly verify public/images folder exists in staging
$stagingPublicImages = Join-Path $stagingDir "public\images"
if (-not (Test-Path $stagingPublicImages)) {
    Write-Host "Re-creating public/images in staging..." -ForegroundColor Gray
    New-Item -ItemType Directory -Path $stagingPublicImages -Force | Out-Null
}
Copy-Item -Path "openscg_app\public\images\*" -Destination $stagingPublicImages -Force

# 2. Build in Cloud
Write-Host "[2/4] Submitting build to Google Cloud Build..." -ForegroundColor Yellow
gcloud config set project $projectId

# We run build from staging dir. Dockerfile is now in its root.
Set-Location $stagingDir
Write-Host "Triggering build..." -ForegroundColor Gray
gcloud builds submit --tag $containerImage .
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nBUILD FAILED with exit code $LASTEXITCODE. Aborting deployment." -ForegroundColor Red
    Set-Location ..
    exit $LASTEXITCODE
}
Write-Host "`nBUILD SUCCESSFUL" -ForegroundColor Green
Set-Location ..

# 3. Deploy to Cloud Run
Write-Host "`n[3/4] Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $serviceName `
    --image $containerImage `
    --region $region `
    --platform managed `
    --allow-unauthenticated `
    --port 3000 `
    --memory "1Gi" `
    --cpu 1 `
    --min-instances 1 `
    --max-instances 1 `
    --timeout 300

# 4. Cleanup
Write-Host "`n[4/4] Cleaning up..." -ForegroundColor Yellow
if (Test-Path $stagingDir) { Remove-Item -Recurse -Force $stagingDir }

Write-Host "`n--- Deployment Complete! ---" -ForegroundColor Green
$url = gcloud run services describe $serviceName --region $region --project $projectId --format='value(status.url)'
Write-Host "Service URL: $url" -ForegroundColor Cyan
