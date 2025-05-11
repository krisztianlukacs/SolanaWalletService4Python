#!/bin/bash

# Define paths
SERVICE_DIR="$(pwd)"
CONFIG_DIR="$SERVICE_DIR/config"
LOG_FILE="$SERVICE_DIR/wallet_service.log"
PID_FILE="$SERVICE_DIR/wallet_service.pid"

# Check if the service is already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null; then
        echo "Service is already running with PID $PID"
        exit 0
    else
        echo "Removing stale PID file"
        rm -f "$PID_FILE"
    fi
fi

# Create log file if it doesn't exist
touch $LOG_FILE

echo "Starting Solana Wallet Service..."
echo "$(date) - Starting service" >> $LOG_FILE

# Verify that config file exists
if [ ! -f "$CONFIG_DIR/solanakeys.ini" ]; then
    echo "Error: Configuration file not found at $CONFIG_DIR/solanakeys.ini"
    echo "$(date) - Error: Configuration file not found" >> $LOG_FILE
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "$SERVICE_DIR/node_modules" ]; then
    echo "Installing dependencies..."
    cd $SERVICE_DIR && npm install
    echo "$(date) - Installed dependencies" >> $LOG_FILE
fi

# Build the TypeScript code
echo "Building TypeScript code..."
cd $SERVICE_DIR && npm run build
if [ $? -ne 0 ]; then
    echo "Error: Build failed"
    echo "$(date) - Error: Build failed" >> $LOG_FILE
    exit 1
fi
echo "$(date) - Build completed successfully" >> $LOG_FILE

# Start the service with environment variables
echo "Starting service..."
cd $SERVICE_DIR
export CONFIG_PATH="$CONFIG_DIR/solanakeys.ini"
export MODE="DEV"
export PORT=3001
echo "Configuration: $CONFIG_PATH (MODE=$MODE)"

# Run the service in the background and save PID
echo "Running server on port 3001..."
nohup node dist/server.js > $LOG_FILE 2>&1 &
PID=$!
echo $PID > $PID_FILE
echo "Service started with PID $PID"
echo "$(date) - Service started with PID $PID" >> $LOG_FILE

# Check if the service is still running after 3 seconds
sleep 3
if ps -p $PID > /dev/null; then
    echo "Service is running successfully"
    # Check if service is responding
    if curl -s http://localhost:3001/health > /dev/null; then
        echo "API is responding correctly"
        echo "$(date) - API is responding correctly" >> $LOG_FILE
    else
        echo "Warning: API is not responding, but process is running"
        echo "$(date) - Warning: API is not responding, but process is running" >> $LOG_FILE
    fi
else
    echo "Error: Service failed to start"
    echo "$(date) - Error: Service failed to start" >> $LOG_FILE
    exit 1
fi
