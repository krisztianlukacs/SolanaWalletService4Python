"""
Example of how to integrate the Solana Wallet Service into a new project.

This file shows how to set up and use the service in a Python project.
"""

import os
import sys
from solana_wallet_client import SolanaWalletClient

def main():
    """
    Main entry point for demonstrating the SolanaWalletClient.
    """
    # Create the client instance
    client = SolanaWalletClient(base_url="http://localhost:3001")
    
    try:
        # Get wallet address
        wallet_address = client.get_user_public_key()
        print(f"Wallet address: {wallet_address}")
        
        # Get SOL balance
        sol_balance = client.get_wallet_balance()
        print(f"SOL balance: {sol_balance}")
        
        # Get USDC balance
        usdc_balance = client.get_usdc_balance()
        print(f"USDC balance: {usdc_balance}")
        
        # Get list of Associated Token Accounts
        atas = client.get_ata_list()
        print(f"Found {len(atas)} Associated Token Accounts:")
        
        # For each ATA, try to get its mint and metadata
        for ata in atas:
            mint = client.get_token_mint(ata)
            if mint:
                metadata = client.get_token_metadata(mint)
                token_name = metadata.get("name", "Unknown") if metadata else "Unknown"
                print(f"  ATA: {ata}")
                print(f"    Mint: {mint}")
                print(f"    Name: {token_name}")

    except Exception as e:
        print(f"Error using Solana Wallet Service: {e}")
        return 1
        
    return 0

if __name__ == "__main__":
    sys.exit(main())
