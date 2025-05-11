# Solana Wallet Service for Python

A TypeScript microservice designed to provide Solana wallet functionality to Python applications.

## Features

- Wallet balance retrieval (SOL and tokens)
- Associated Token Account (ATA) management
- Token metadata retrieval
- Token name lookup
- High performance and reliability
- Production-ready deployment options
- Easy integration with Python applications

## Installation

### Prerequisites

- Node.js 16+ and npm 7+
- Access to a Solana RPC endpoint
- A Solana wallet keypair 

### Setup

1. Clone this repository
```bash
git clone https://github.com/yourusername/SolanaWalletService4Python.git
cd SolanaWalletService4Python
```

2. Install dependencies
```bash
npm install
```

3. Set up configuration
```bash
cp config/solanakeys.ini.example config/solanakeys.ini
```

4. Edit the configuration file with your wallet information
```bash
nano config/solanakeys.ini
# Replace the placeholder values with your actual wallet private key and RPC URL
```

5. Build the TypeScript code
```bash
npm run build
```

6. Start the service
```bash
bash scripts/start_service.sh
```

## API Endpoints

### Wallet Operations

- `GET /health` - Service health check
- `GET /wallet/address` - Get wallet public key
- `GET /wallet/balance` - Get SOL balance
- `GET /wallet/balance/usdc` - Get USDC balance
- `GET /wallet/token-balance/:mint` - Get balance for a specific token

### ATA Operations

- `GET /wallet/ata/list` - Get all ATAs for the wallet
- `GET /wallet/ata/:address/mint` - Get mint address for a specific ATA

### Token Operations

- `GET /token/metadata/:mint` - Get full metadata for a token
- `GET /token/name/:mint` - Get token name

## Python Integration

### Example Python Client

```python
import requests
import json

class SolanaWalletClient:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        
    def get_user_public_key(self):
        response = requests.get(f"{self.base_url}/wallet/address")
        return response.json()["address"]
        
    def get_wallet_balance(self):
        response = requests.get(f"{self.base_url}/wallet/balance")
        return response.json()["balance"]
        
    def get_usdc_balance(self):
        response = requests.get(f"{self.base_url}/wallet/balance/usdc")
        return response.json()["balance"]
        
    def get_token_balance(self, mint_address):
        response = requests.get(f"{self.base_url}/wallet/token-balance/{mint_address}")
        return response.json()["balance"]
        
    def get_ata_list(self):
        response = requests.get(f"{self.base_url}/wallet/ata/list")
        return response.json()["atas"]
        
    def get_token_metadata(self, mint_address):
        response = requests.get(f"{self.base_url}/token/metadata/{mint_address}")
        return response.json()
```

### Usage Example

```python
from solana_wallet_client import SolanaWalletClient

# Initialize the client
wallet = SolanaWalletClient()

# Get wallet address
address = wallet.get_user_public_key()
print(f"Wallet address: {address}")

# Get SOL balance
sol_balance = wallet.get_wallet_balance()
print(f"SOL balance: {sol_balance}")

# Get USDC balance
usdc_balance = wallet.get_usdc_balance()
print(f"USDC balance: {usdc_balance}")

# Get token metadata
token_mint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"  # USDC on mainnet
metadata = wallet.get_token_metadata(token_mint)
print(f"Token metadata: {metadata}")
```

## Service Management

The service comes with several management scripts:

- `scripts/start_service.sh` - Start the service
- `scripts/stop_service.sh` - Stop the service
- `scripts/monitor_service.sh` - Check if service is running and restart if needed
- `scripts/install_service.sh` - Generate systemd service file

### Production Deployment

For production deployments, it's recommended to set up the service with systemd:

```bash
# Generate the systemd service file
bash scripts/install_service.sh

# Follow the instructions printed to install the service
```

Add the monitor script to crontab for automatic monitoring:

```bash
# Add to crontab to check every 5 minutes
crontab -e
# Add this line:
*/5 * * * * cd /path/to/SolanaWalletService4Python && ./scripts/monitor_service.sh
```

## Configuration Options

The service can be configured with the following environment variables:

- `MODE` - 'DEV' or 'LIVE' (default: 'DEV')
- `CONFIG_PATH` - Path to configuration file (default: './config/solanakeys.ini')
- `PORT` - Port to run the service on (default: 3001)

## Security Considerations

1. **Private Key Management**
   - Never commit your private keys to version control
   - Consider using environment variables or a secret management service
   
2. **Network Exposure**
   - By default, the service runs on localhost and should not be exposed to the internet
   - If network exposure is required, implement proper authentication

3. **RPC Provider**
   - Use a reliable RPC provider with sufficient rate limits for production applications

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
