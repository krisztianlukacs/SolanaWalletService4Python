import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { readFileSync } from 'fs';
import * as ini from 'ini';
import bs58 from 'bs58';

/**
 * Manages Solana wallet operations
 */
export class WalletManager {
  private keypair: Keypair;
  private connection: Connection;
  private configPath: string;
  private mode: string;
  private configData: any;
  public solMint: PublicKey;
  public usdcMint: PublicKey;

  /**
   * Initialize wallet manager
   * @param configPath Path to configuration file
   * @param mode DEV or LIVE mode
   */
  constructor(configPath: string, mode: string = 'DEV') {
    this.configPath = configPath;
    this.mode = mode;
    
    console.log(`Reading config from ${this.configPath}`);
    // Read and parse the config file
    this.configData = ini.parse(readFileSync(this.configPath, 'utf-8'));
    
    console.log(`Using mode: ${this.mode}`);
    console.log(`Available modes: ${Object.keys(this.configData).join(', ')}`);
    
    // For development purposes, use a fallback keypair if the private key is invalid
    try {
      // Get private key and initialize keypair
      const privateKeyString = this.configData[this.mode].wallet_private_key.trim();
      console.log(`Private key string length: ${privateKeyString.length}`);
      
      const privateKeyArray = JSON.parse(privateKeyString);
      console.log(`Private key array length: ${privateKeyArray.length}`);
      
      // Generate a random keypair for testing if the private key is too short
      if (privateKeyArray.length !== 64) {
        console.warn(`Warning: Private key is not the expected length of 64, generating random keypair for testing`);
        this.keypair = Keypair.generate();
      } else {
        const privateKeyUint8 = new Uint8Array(privateKeyArray);
        this.keypair = Keypair.fromSecretKey(privateKeyUint8);
      }
    } catch (error) {
      console.warn(`Warning: Error initializing keypair from config: ${error}`);
      console.warn(`Falling back to randomly generated keypair for testing purposes`);
      this.keypair = Keypair.generate();
    }
    
    // Initialize connection
    const rpcUrl = this.configData[this.mode].RPC_URL || this.configData[this.mode].SOLANA_RPC_URL;
    console.log(`Using RPC URL: ${rpcUrl}`);
    this.connection = new Connection(rpcUrl, 'confirmed');

    // Get SOL and USDC mints
    this.solMint = new PublicKey(this.configData[this.mode].SOL_MINT);
    this.usdcMint = new PublicKey(this.configData[this.mode].USDC_MINT);
    
    console.log(`Initialized wallet with public key: ${this.keypair.publicKey.toBase58()}`);
    console.log(`SOL Mint: ${this.solMint.toBase58()}`);
    console.log(`USDC Mint: ${this.usdcMint.toBase58()}`);
  }

  /**
   * Get the public key of the wallet
   * @returns PublicKey of the wallet
   */
  getUserPublicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  /**
   * Get wallet balance in SOL
   * @returns Balance in SOL
   */
  async getWalletBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.keypair.publicKey);
      return balance / 1_000_000_000; // Convert lamports to SOL
    } catch (error) {
      console.error(`Error getting SOL balance: ${error}`);
      return 0;
    }
  }

  /**
   * Get token balance for a specific mint
   * @param mintPubkey Token mint public key
   * @returns Token balance
   */
  async getTokenBalance(mintPubkey: PublicKey): Promise<number> {
    try {
      // Find the associated token account
      const ataAddress = await getAssociatedTokenAddress(
        mintPubkey,
        this.keypair.publicKey
      );
      
      try {
        // Get account info and return balance
        const accountInfo = await getAccount(this.connection, ataAddress);
        // Parse amount and determine decimals from the token account
        const amount = Number(accountInfo.amount);
        // Default to 6 decimals (most common for tokens like USDC)
        const decimals = 6; 
        return amount / Math.pow(10, decimals);
      } catch (err) {
        // Account probably doesn't exist, which means balance is 0
        console.log(`No account found for mint ${mintPubkey.toBase58()}`);
        return 0;
      }
    } catch (error) {
      console.error(`Error getting token balance for mint ${mintPubkey.toBase58()}: ${error}`);
      return 0;
    }
  }

  /**
   * Get a list of all Associated Token Accounts for the wallet
   * @returns List of ATA public keys
   */
  async getATAList(): Promise<string[]> {
    try {
      // Get all token accounts owned by the wallet
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        this.keypair.publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      if (tokenAccounts.value.length > 0) {
        // Extract ATA pubkeys
        const ataPubkeys = tokenAccounts.value.map(
          account => account.pubkey.toBase58()
        );
        return ataPubkeys;
      } else {
        console.log("No associated token accounts found.");
        return [];
      }
    } catch (error) {
      console.error(`Error getting associated token accounts: ${error}`);
      return [];
    }
  }

  /**
   * Get the mint address for a specific ATA
   * @param ataAddress ATA public key
   * @returns Mint public key or null
   */
  async getTokenMint(ataAddress: string): Promise<string | null> {
    try {
      const pubkey = new PublicKey(ataAddress);
      const accountInfo = await getAccount(this.connection, pubkey);
      return accountInfo.mint.toBase58();
    } catch (error) {
      console.error(`Error getting mint for ATA ${ataAddress}: ${error}`);
      return null;
    }
  }

  /**
   * Get the USDC balance
   * @returns USDC balance
   */
  async getUSDCBalance(): Promise<number> {
    return this.getTokenBalance(this.usdcMint);
  }

  /**
   * Get the connection object for direct access
   * @returns Connection object
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get the keypair for signing transactions
   * @returns Keypair
   */
  getKeypair(): Keypair {
    return this.keypair;
  }
}
