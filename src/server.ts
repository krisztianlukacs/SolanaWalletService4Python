import express from 'express';
import { WalletManager } from './wallet-manager';
import { TokenMetadataService } from './token-metadata';
import { PublicKey } from '@solana/web3.js';
import * as path from 'path';
import * as fs from 'fs';

// Initialize the Express app
const app = express();
app.use(express.json());

// Load configuration
const mode = process.env.WALLET_SERVICE_MODE || 'DEV';
const configPath = process.env.CONFIG_PATH || 
                  path.join(process.cwd(), 'config/solanakeys.ini');

// Initialize wallet manager
let walletManager: WalletManager;
try {
  console.log(`Attempting to initialize wallet manager with config from ${configPath} in mode ${mode}`);
  if (!fs.existsSync(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    process.exit(1);
  }
  walletManager = new WalletManager(configPath, mode);
  console.log(`Initialized wallet manager in ${mode} mode with config from ${configPath}`);
} catch (error) {
  console.error(`Failed to initialize wallet manager: ${error}`);
  process.exit(1);
}

// Initialize token metadata service
const tokenMetadataService = new TokenMetadataService(walletManager.getConnection());

// Define routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/wallet/address', (req, res) => {
  res.json({ address: walletManager.getUserPublicKey().toBase58() });
});

app.get('/wallet/balance', async (req, res) => {
  try {
    const balance = await walletManager.getWalletBalance();
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: `Failed to get wallet balance: ${error}` });
  }
});

app.get('/wallet/balance/usdc', async (req, res) => {
  try {
    const balance = await walletManager.getUSDCBalance();
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: `Failed to get USDC balance: ${error}` });
  }
});

app.get('/wallet/token-balance/:mint', async (req, res) => {
  try {
    const mintPubkey = new PublicKey(req.params.mint);
    const balance = await walletManager.getTokenBalance(mintPubkey);
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: `Failed to get token balance: ${error}` });
  }
});

app.get('/wallet/ata/list', async (req, res) => {
  try {
    const atas = await walletManager.getATAList();
    res.json({ atas });
  } catch (error) {
    res.status(500).json({ error: `Failed to get ATA list: ${error}` });
  }
});

app.get('/wallet/ata/:address/mint', async (req, res) => {
  try {
    const ataAddress = req.params.address;
    const mint = await walletManager.getTokenMint(ataAddress);
    if (mint) {
      res.json({ mint });
    } else {
      res.status(404).json({ error: 'Mint not found for this ATA' });
    }
  } catch (error) {
    res.status(500).json({ error: `Failed to get token mint: ${error}` });
  }
});

app.get('/token/metadata/:mint', async (req, res) => {
  try {
    const mintPubkey = new PublicKey(req.params.mint);
    const metadata = await tokenMetadataService.getTokenMetadata(mintPubkey);
    
    if (metadata) {
      res.json(metadata);
    } else {
      res.status(404).json({ error: 'Metadata not found' });
    }
  } catch (error) {
    res.status(500).json({ error: `Failed to get token metadata: ${error}` });
  }
});

app.get('/token/name/:mint', async (req, res) => {
  try {
    const mintPubkey = new PublicKey(req.params.mint);
    const name = await tokenMetadataService.getTokenName(mintPubkey);
    
    if (name) {
      res.json({ name });
    } else {
      res.status(404).json({ error: 'Token name not found' });
    }
  } catch (error) {
    res.status(500).json({ error: `Failed to get token name: ${error}` });
  }
});

// Start the server
const PORT = process.env.WALLET_SERVICE_PORT || 3001;

// Create a more robust error handler
process.on('uncaughtException', (error) => {
  console.error(`FATAL: Uncaught exception: ${error.message}`);
  console.error(error.stack);
});

console.log(`About to start server on port ${PORT}`);
try {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Wallet public key: ${walletManager.getUserPublicKey().toBase58()}`);
    
    // Print additional info
    walletManager.getWalletBalance().then(balance => {
      console.log(`SOL Balance: ${balance}`);
    }).catch(err => {
      console.error(`Error getting SOL balance: ${err}`);
    });
    
    walletManager.getUSDCBalance().then(balance => {
      console.log(`USDC Balance: ${balance}`);
    }).catch(err => {
      console.error(`Error getting USDC balance: ${err}`);
    });
  });
  
  server.on('error', (error) => {
    console.error(`Error starting server: ${error}`);
  });
} catch (error) {
  console.error(`FATAL: Error starting server: ${error}`);
}

export default app;
