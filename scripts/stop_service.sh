#!/bin/bash

# Define paths
SERVICE_DIR="$(pwd)"
PID_FILE="$SERVICE_DIR/wallet_service.pid"
LOG_FILE="$SERVICE_DIR/wallet_service.log"

# Check if PID file exists
if [ ! -f "$PID_FILE" ]; then
    echo "No PID file found. Service may not be running."
    exit 0
fi

# Read PID
PID=$(cat "$PID_FILE")

# Check if process is running
if ! ps -p $PID > /dev/null; then
    echo "Process with PID $PID not found. Service may have crashed."
    echo "$(date) - Service may have crashed. Removing PID file." >> $LOG_FILE
    rm -f "$PID_FILE"
    exit 0
fi

# Kill the process
echo "Stopping service with PID $PID..."
kill $PID

# Wait for process to terminate
sleep 2

# Check if process is still running
if ps -p $PID > /dev/null; then
    echo "Service did not stop gracefully. Forcing termination..."
    kill -9 $PID
    sleep 1
fi

# Clean up PID file
rm -f "$PID_FILE"

echo "Service stopped successfully."
echo "$(date) - Service stopped" >> $LOG_FILE
