# Integration Guide for SolanaWalletService4Python

This guide explains how to integrate the Solana Wallet Service with your existing Python codebase.

## Prerequisites

- Node.js 16+ and npm 7+
- Python 3.6+
- Git

## Step 1: Setting up the service

1. Clone the repository:
```bash
git clone https://github.com/yourusername/SolanaWalletService4Python.git
cd SolanaWalletService4Python
```

2. Create and configure your wallet:
```bash
mkdir -p config
cp config/solanakeys.ini.example config/solanakeys.ini
# Edit the config file with your wallet information
nano config/solanakeys.ini 
```

3. Install dependencies and build:
```bash
npm install
npm run build
```

4. Start the service:
```bash
bash scripts/start_service.sh
```

## Step 2: Using the Python Client

### Option 1: Direct import

Copy the `solana_wallet_client.py` file to your project and import it:

```python
from solana_wallet_client import SolanaWalletClient

# Create client
client = SolanaWalletClient(base_url="http://localhost:3001")

# Get wallet address
address = client.get_user_public_key()
print(f"Wallet address: {address}")
```

### Option 2: Integration with existing WalletManager

If you have an existing `WalletManager` class that needs to be updated to use the service:

1. Copy the `solana_wallet_client.py` file to your project's utils directory
2. Modify your WalletManager to use the client:

```python
from .solana_wallet_client import SolanaWalletClient

class WalletManager:
    def __init__(self, config_path=None, mode='DEV'):
        # Read your existing config
        self.config = self._read_config(config_path)
        
        # Create the client
        service_url = self.config.get('WALLET_SERVICE_URL', 'http://localhost:3001')
        self.wallet_client = SolanaWalletClient(base_url=service_url)
        
        # You can still keep other configuration
        self.USDC_MINT = self.config.get('USDC_MINT')
        
    def get_wallet_address(self):
        """Get the wallet address"""
        return self.wallet_client.get_user_public_key()
        
    def get_sol_balance(self):
        """Get SOL balance"""
        return self.wallet_client.get_wallet_balance()
    
    def get_usdc_balance(self):
        """Get USDC balance"""
        return self.wallet_client.get_usdc_balance()
        
    # Other methods...
```

## Step 3: Configure Ports

By default, the service runs on port 3001. If your existing code expects it on a different port (e.g., 3002), you have two options:

### Option 1: Update your Python code

Change the service URL in your Python code:

```python
client = SolanaWalletClient(base_url="http://localhost:3001")
```

### Option 2: Change the service port

Edit the `scripts/start_service.sh` file to use the desired port:

```bash
# Find this line
export PORT=3001

# Change it to match your existing code
export PORT=3002
```

## Step 4: Running as a Background Service

For production use, set up the service to run automatically:

```bash
# Configure the service
bash scripts/install_service.sh

# Follow the instructions to install as a systemd service
```

## Step 5: Validate Integration

Run the provided test script:

```bash
python test_service.py
```

## Common Issues

### 1. Connection refused

If you get "Connection refused" errors:
- Verify the service is running: `ps aux | grep node`
- Check the log file: `cat wallet_service.log`
- Verify the port matches what your client is using
- Check for firewall issues: `sudo ufw status`

### 2. Configuration issues

- Ensure `config/solanakeys.ini` exists and has the correct format
- Check that the wallet private key is valid
- Verify the RPC URL is accessible

### 3. Permissions issues

- Make scripts executable: `chmod +x scripts/*.sh`
- Check file permissions: `ls -la config/solanakeys.ini`

## For Production Deployment

- Set up monitoring with the provided scripts
- Use a reliable RPC provider
- Implement proper security measures
- Consider rate limiting for the API endpoints
