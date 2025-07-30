#!/bin/bash
# /tmp/amun.pl/build.sh

set -e

# Read the GIT_BRANCH environment variable, defaulting to 'main' if it's not set
BRANCH_TO_BUILD=${GIT_BRANCH:-main}

APP_SOURCE_DIR="/tmp/amun.pl/source"
GIT_REPO_URL="ssh://git@git.amun.pl:2662/hiero/personal_website.git"
IMAGE_NAME="localhost/amun.pl:latest"

echo "Targeting branch: $BRANCH_TO_BUILD"

if [ -d "$APP_SOURCE_DIR" ]; then
  echo "Source directory found. Fetching and checking out latest code..."
  cd "$APP_SOURCE_DIR"
  git fetch origin
  git checkout "$BRANCH_TO_BUILD"
  git pull origin "$BRANCH_TO_BUILD"
else
  echo "Source directory not found. Cloning specific branch..."
  # Use the -b flag to clone a specific branch
  git clone -b "$BRANCH_TO_BUILD" "$GIT_REPO_URL" "$APP_SOURCE_DIR"
  cd "$APP_SOURCE_DIR"
fi

echo "Building new container image from branch '$BRANCH_TO_BUILD'..."
podman build -t "$IMAGE_NAME" .
echo "Build complete."