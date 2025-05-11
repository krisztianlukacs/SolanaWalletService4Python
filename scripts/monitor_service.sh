#!/bin/bash

# Define paths
SERVICE_DIR="$(pwd)"
PID_FILE="$SERVICE_DIR/wallet_service.pid"
LOG_FILE="$SERVICE_DIR/wallet_service.log"

# Log monitoring activity
echo "$(date) - Checking service status" >> $LOG_FILE

# Check if PID file exists
if [ ! -f "$PID_FILE" ]; then
    echo "No PID file found. Service is not running. Starting service..."
    echo "$(date) - No PID file found. Starting service..." >> $LOG_FILE
    $SERVICE_DIR/scripts/start_service.sh
    exit 0
fi

# Read PID
PID=$(cat "$PID_FILE")

# Check if process is running
if ! ps -p $PID > /dev/null; then
    echo "Process with PID $PID not found. Restarting service..."
    echo "$(date) - Process not found. Restarting service..." >> $LOG_FILE
    rm -f "$PID_FILE"
    $SERVICE_DIR/scripts/start_service.sh
    exit 0
fi

# Check API health
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "Health check failed. Restarting service..."
    echo "$(date) - Health check failed. Restarting service..." >> $LOG_FILE
    $SERVICE_DIR/scripts/stop_service.sh
    sleep 2
    $SERVICE_DIR/scripts/start_service.sh
    exit 0
fi

echo "Service is running correctly."
echo "$(date) - Service health check passed" >> $LOG_FILE
