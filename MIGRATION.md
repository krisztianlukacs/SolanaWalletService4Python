# Migration and Setup Guide

This guide helps you set up the Solana Wallet Service for Python integration.

## Setup Steps

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/SolanaWalletService4Python.git
cd SolanaWalletService4Python
```

2. **Create configuration**

```bash
mkdir -p config
cp config/solanakeys.ini.example config/solanakeys.ini
nano config/solanakeys.ini  # Edit the configuration with your wallet details
```

3. **Install dependencies and build**

```bash
npm install
npm run build
```

4. **Start the service**

```bash
./scripts/start_service.sh
```

5. **Test the service**

```bash
python3 test_service.py
```

## Configuration Format

The `config/solanakeys.ini` file should follow this format:

```ini
[DEV]
wallet_private_key = [array of 64 numbers representing your private key]
wallet_address = YourWalletAddressHere
USDC_MINT = Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr
SOL_MINT = So11111111111111111111111111111111111111112
RPC_URL = https://api.devnet.solana.com

[LIVE]
wallet_private_key = [array of 64 numbers representing your private key]
wallet_address = YourWalletAddressHere
USDC_MINT = EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
SOL_MINT = So11111111111111111111111111111111111111112
RPC_URL = https://api.mainnet-beta.solana.com
```

## Security Best Practices

1. **Keep your private key secure**
   - Never commit it to version control
   - Use restricted permissions on the config file: `chmod 600 config/solanakeys.ini`

2. **Use a dedicated wallet**
   - Create a separate wallet for this service
   - Only fund it with the minimum amount needed

3. **Secure your RPC endpoint**
   - Use a paid/private RPC service for production
   - Consider rate-limiting options

## Using with Python

Import the provided client class:

```python
from solana_wallet_client import SolanaWalletClient

client = SolanaWalletClient()  # Defaults to http://localhost:3001
balance = client.get_wallet_balance()
print(f"Wallet balance: {balance} SOL")
```

## Running as a System Service

To set up as a systemd service:

1. Edit the service file template:
```bash
cp solana-wallet-service.service.example solana-wallet-service.service
nano solana-wallet-service.service  # Update paths and username
```

2. Install the service:
```bash
sudo cp solana-wallet-service.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable solana-wallet-service
sudo systemctl start solana-wallet-service
```
