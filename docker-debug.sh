#!/bin/bash
# Script to debug container startup issues

echo "Building Docker image..."
docker build -f Dockerfile.production -t navi-optimized:latest .

echo "Removing any existing navi-debug container..."
docker rm -f navi-debug 2>/dev/null || true

echo "Running container with logs..."
docker run --env-file .env -p 3000:3000 --name navi-debug navi-optimized:latest

echo "Container exited. Checking logs:"
docker logs navi-debug

echo "Extended information:"
echo "Exit code: $(docker inspect navi-debug --format='{{.State.ExitCode}}')"
echo "Error: $(docker inspect navi-debug --format='{{.State.Error}}')"
echo "Started at: $(docker inspect navi-debug --format='{{.State.StartedAt}}')"
echo "Finished at: $(docker inspect navi-debug --format='{{.State.FinishedAt}}')"
echo "OOM Killed: $(docker inspect navi-debug --format='{{.State.OOMKilled}}')"
