import requests
import json

class SolanaWalletClient:
    def __init__(self, base_url="http://localhost:3001"):
        """
        Initialize the Solana Wallet Client
        
        Args:
            base_url (str): Base URL of the wallet service
        """
        self.base_url = base_url
        
    def get_user_public_key(self):
        """
        Get the public key of the wallet
        
        Returns:
            str: Wallet public key (base58 encoded)
        """
        response = requests.get(f"{self.base_url}/wallet/address")
        return response.json()["address"]
        
    def get_wallet_balance(self):
        """
        Get the SOL balance of the wallet
        
        Returns:
            float: SOL balance
        """
        response = requests.get(f"{self.base_url}/wallet/balance")
        return response.json()["balance"]
        
    def get_usdc_balance(self):
        """
        Get the USDC balance of the wallet
        
        Returns:
            float: USDC balance
        """
        response = requests.get(f"{self.base_url}/wallet/balance/usdc")
        return response.json()["balance"]
        
    def get_token_balance(self, mint_address):
        """
        Get the balance of a specific token
        
        Args:
            mint_address (str): Token mint address
            
        Returns:
            float: Token balance
        """
        response = requests.get(f"{self.base_url}/wallet/token-balance/{mint_address}")
        return response.json()["balance"]
        
    def get_ata_list(self):
        """
        Get a list of all Associated Token Accounts for the wallet
        
        Returns:
            list: List of ATA addresses
        """
        response = requests.get(f"{self.base_url}/wallet/ata/list")
        return response.json()["atas"]
        
    def get_token_mint(self, ata_address):
        """
        Get the mint address for a specific ATA
        
        Args:
            ata_address (str): ATA address
            
        Returns:
            str: Mint address or None if not found
        """
        try:
            response = requests.get(f"{self.base_url}/wallet/ata/{ata_address}/mint")
            return response.json().get("mint")
        except:
            return None
            
    def get_token_metadata(self, mint_address):
        """
        Get full metadata for a token
        
        Args:
            mint_address (str): Token mint address
            
        Returns:
            dict: Token metadata or None if not found
        """
        try:
            response = requests.get(f"{self.base_url}/token/metadata/{mint_address}")
            return response.json()
        except:
            return None
            
    def get_token_name(self, mint_address):
        """
        Get the name of a token
        
        Args:
            mint_address (str): Token mint address
            
        Returns:
            str: Token name or None if not found
        """
        try:
            response = requests.get(f"{self.base_url}/token/name/{mint_address}")
            return response.json().get("name")
        except:
            return None
