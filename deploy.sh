#!/bin/bash

# reads SL_SERVER_{USER,HOST,PATH} variables from .env, fails if no .env file present in root
# uploads index.html and assets folder to defined target via scp
# TODO images and zip folder are ignored, maybe introduce param to upload all data

ENV_FILE=".env"

# Check if the .env file exists
if [ -f "$ENV_FILE" ]; then
  # Load the .env file
  source "$ENV_FILE"
else
  echo "Error: .env file not found!"
  exit 1
fi

DEST="$SL_SERVER_USER@$SL_SERVER_HOST:$SL_SERVER_PATH"

if [ ! -d "dist" ]; then
  echo "Error: 'dist' folder not found!"
  exit 1
else
  scp -r ./dist/index.html $DEST
  scp -r ./dist/assets $DEST
fi
