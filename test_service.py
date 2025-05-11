#!/usr/bin/env python3

import requests
import json
import sys
import os

SERVICE_URL = "http://localhost:3001"

def test_wallet_service():
    print(f"Testing Solana Wallet Service at {SERVICE_URL}")
    
    # Test health endpoint
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{SERVICE_URL}/health", timeout=5)
        print(f"✓ Health check successful: {response.text}")
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False
    
    # Test wallet address
    print("\n2. Testing wallet address endpoint...")
    try:
        response = requests.get(f"{SERVICE_URL}/wallet/address", timeout=5)
        address = response.json().get('address')
        print(f"✓ Got wallet address: {address}")
    except Exception as e:
        print(f"✗ Failed to get wallet address: {e}")
        return False
    
    # Test wallet balance
    print("\n3. Testing wallet balance endpoint...")
    try:
        response = requests.get(f"{SERVICE_URL}/wallet/balance", timeout=5)
        balance = response.json().get('balance', 0)
        print(f"✓ Wallet balance: {balance} SOL")
    except Exception as e:
        print(f"✗ Failed to get wallet balance: {e}")
        return False
    
    # Test ATA list
    print("\n4. Testing ATA list endpoint...")
    try:
        response = requests.get(f"{SERVICE_URL}/wallet/ata/list", timeout=5)
        atas = response.json().get('atas', [])
        print(f"✓ Found {len(atas)} Associated Token Accounts")
        if atas:
            print(f"  First ATA: {atas[0]}")
    except Exception as e:
        print(f"✗ Failed to get ATA list: {e}")
        return False
    
    print("\n✓ All tests passed successfully!")
    return True

if __name__ == "__main__":
    sys.exit(0 if test_wallet_service() else 1)
