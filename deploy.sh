#!/bin/bash
# Exit script if any command fails
set -e 

echo "🚀 Starting Deployment Process..."

echo "📥 Pulling latest code from Git..."
# git pull origin main (Uncomment if using Git)

echo "🛑 Stopping old containers..."
docker-compose down

echo "🔨 Building new Docker images..."
docker-compose build

echo "✅ Starting new containers..."
docker-compose up -d

echo "🎉 Deployment Successful!"