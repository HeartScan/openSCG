#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for ngrok
if ! command_exists ngrok; then
    echo "Error: ngrok is not installed. Please install it to continue."
    echo "Installation instructions: https://ngrok.com/download"
    exit 1
fi

# Check if ngrok is authenticated
if ! grep -q "authtoken" ~/.ngrok2/ngrok.yml; then
    echo "Error: ngrok is not authenticated. Please authenticate to continue."
    echo "Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "Then run: ngrok config add-authtoken <YOUR_AUTHTOKEN>"
    exit 1
fi

echo "Starting Docker containers..."
docker-compose up -d

echo "Starting ngrok tunnels..."

# Start ngrok for the backend and capture the URL
BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.proto == "https") | .public_url')
if [ -z "$BACKEND_URL" ]; then
    ngrok http 8000 --log=stdout > /dev/null &
    sleep 2
    BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.proto == "https") | .public_url')
fi
echo "Backend URL: $BACKEND_URL"

# Start ngrok for the frontend and capture the URL
FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.proto == "https") | .public_url')
if [ -z "$FRONTEND_URL" ]; then
    ngrok http 3000 --log=stdout > /dev/null &
    sleep 2
    FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.proto == "https") | .public_url')
fi
echo "Frontend URL: $FRONTEND_URL"


echo "Creating .env.local file for the client..."
echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" > client/.env.local

echo "Rebuilding and restarting the client container..."
docker-compose up -d --build client

echo "--------------------------------------------------"
echo "Development environment is ready!"
echo "Open the following URL on your mobile device:"
echo "$FRONTEND_URL"
echo "--------------------------------------------------"
