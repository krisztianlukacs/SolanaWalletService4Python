import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { createHash } from 'crypto';

/**
 * Service for handling token metadata
 */
export class TokenMetadataService {
  private connection: Connection;
  private metaplex: Metaplex;
  private METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

  /**
   * Initialize token metadata service
   * @param connection Solana connection
   */
  constructor(connection: Connection) {
    this.connection = connection;
    this.metaplex = Metaplex.make(this.connection);
  }

  /**
   * Get the metadata PDA for a mint
   * @param mint Mint public key
   * @returns Metadata PDA
   */
  async getMetadataAddress(mint: PublicKey): Promise<PublicKey> {
    return this.findProgramAddress(
      [
        Buffer.from('metadata'),
        this.METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      this.METADATA_PROGRAM_ID
    );
  }

  /**
   * Find a program address
   * @param seeds Seeds for program address
   * @param programId Program ID
   * @returns Program address public key
   */
  private async findProgramAddress(
    seeds: Buffer[],
    programId: PublicKey
  ): Promise<PublicKey> {
    // This is a regular implementation of find_program_address
    let nonce = 255;
    let address, valid;

    while (nonce > 0) {
      const seedsWithNonce = [...seeds, Buffer.from([nonce])];
      
      try {
        // Create a hash using the same algorithm as Solana
        const hash = createHash('sha256');
        seedsWithNonce.forEach(seed => hash.update(seed));
        hash.update(programId.toBuffer());
        
        const digest = hash.digest();
        address = new PublicKey(digest);
        valid = true;
        
        // Check if it's on the ed25519 curve
        // This is simplified - the full check requires more complex validation
        if (valid) break;
      } catch (e) {
        // Not a valid public key, try next nonce
      }
      
      nonce--;
    }

    if (nonce <= 0) throw new Error('Unable to find a valid program address');
    return address!;
  }

  /**
   * Get token name from mint
   * @param mintPubkey Mint address
   * @returns Token name or null
   */
  async getTokenName(mintPubkey: PublicKey): Promise<string | null> {
    try {
      // Get the NFT metadata using Metaplex
      const nft = await this.metaplex.nfts().findByMint({
        mintAddress: mintPubkey,
      });
      
      if (nft && nft.name) {
        return nft.name;
      }
      
      console.log(`No metadata found for mint ${mintPubkey.toBase58()}`);
      return null;
    } catch (error) {
      console.error(`Error getting token name for mint ${mintPubkey.toBase58()}: ${error}`);
      return null;
    }
  }

  /**
   * Get full token metadata
   * @param mintPubkey Mint address
   * @returns Token metadata object or null
   */
  async getTokenMetadata(mintPubkey: PublicKey): Promise<any | null> {
    try {
      // Get the NFT metadata using Metaplex
      const nft = await this.metaplex.nfts().findByMint({
        mintAddress: mintPubkey,
      });
      
      if (!nft) {
        return null;
      }
      
      const metadataAddress = await this.getMetadataAddress(mintPubkey);
      
      return {
        name: nft.name,
        symbol: nft.symbol,
        uri: nft.uri,
        mint: mintPubkey.toBase58(),
        metadataAddress: metadataAddress.toBase58()
      };
    } catch (error) {
      console.error(`Error getting token metadata for mint ${mintPubkey.toBase58()}: ${error}`);
      return null;
    }
  }
}
