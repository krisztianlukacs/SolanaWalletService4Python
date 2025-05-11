#!/bin/bash

# Define paths
SERVICE_DIR="$(pwd)"
SERVICE_USER=$(whoami)
SERVICE_FILE="$SERVICE_DIR/solana-wallet-service.service"

# Create systemd service file
cat > $SERVICE_FILE << EOL
[Unit]
Description=Solana Wallet Service
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$SERVICE_DIR
ExecStart=$SERVICE_DIR/scripts/start_service.sh
ExecStop=$SERVICE_DIR/scripts/stop_service.sh
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=solana-wallet-service
Environment=NODE_ENV=production
Environment=WALLET_SERVICE_PORT=3001
Environment=CONFIG_PATH=$SERVICE_DIR/config/solanakeys.ini
Environment=WALLET_SERVICE_MODE=DEV

[Install]
WantedBy=multi-user.target
EOL

echo "Created service file at $SERVICE_FILE"
echo "To install the service:"
echo "1. Copy the service file to systemd directory:"
echo "   sudo cp $SERVICE_FILE /etc/systemd/system/"
echo ""
echo "2. Reload systemd:"
echo "   sudo systemctl daemon-reload"
echo ""
echo "3. Enable the service to start on boot:"
echo "   sudo systemctl enable solana-wallet-service"
echo ""
echo "4. Start the service:"
echo "   sudo systemctl start solana-wallet-service"
echo ""
echo "5. Check status:"
echo "   sudo systemctl status solana-wallet-service"
