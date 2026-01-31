import { ethers } from 'ethers';
import { supabase } from './supabase';

// NFT Contract ABI (simplified ERC721)
const NFT_CONTRACT_ABI = [
  "function mintNFT(address to, string memory tokenURI) public returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "function balanceOf(address owner) public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// NFT Marketplace Contract ABI
const MARKETPLACE_ABI = [
  "function listNFT(address nftContract, uint256 tokenId, uint256 price) public",
  "function buyNFT(address nftContract, uint256 tokenId) public payable",
  "function cancelListing(address nftContract, uint256 tokenId) public",
  "function getListing(address nftContract, uint256 tokenId) public view returns (address seller, uint256 price)",
  "event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price)",
  "event NFTSold(address indexed buyer, address indexed nftContract, uint256 indexed tokenId, uint256 price)"
];

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  external_url?: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  nftContract: string;
  marketplaceContract: string;
  blockExplorer: string;
}

// Network configurations
export const NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    nftContract: '0x...', // Will be set after contract deployment
    marketplaceContract: '0x...',
    blockExplorer: 'https://etherscan.io'
  },
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    nftContract: '0x...',
    marketplaceContract: '0x...',
    blockExplorer: 'https://polygonscan.com'
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    nftContract: '0x...',
    marketplaceContract: '0x...',
    blockExplorer: 'https://arbiscan.io'
  }
};

export class BlockchainService {
  private provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  private nftContract: ethers.Contract | null = null;
  private marketplaceContract: ethers.Contract | null = null;
  private currentNetwork: string = 'polygon';

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      // Try to connect to MetaMask
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        this.provider = new ethers.BrowserProvider((window as any).ethereum);
      } else {
        // Fallback to JSON-RPC provider
        const network = NETWORKS[this.currentNetwork];
        this.provider = new ethers.JsonRpcProvider(network.rpcUrl);
      }
    } catch (error) {
      console.error('Failed to initialize provider:', error);
    }
  }

  async connectWallet(): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      // Request account access
      const accounts = await (window as any).ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();

      // Update user wallet address in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('users').update({
          wallet_address: address,
          has_wallet_connected: true,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
      }

      // Initialize contracts
      await this.initializeContracts();

      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      this.signer = null;
      this.nftContract = null;
      this.marketplaceContract = null;

      // Update user wallet status in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('users').update({
          has_wallet_connected: false,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }

  private async initializeContracts(): Promise<void> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    const network = NETWORKS[this.currentNetwork];
    
    this.nftContract = new ethers.Contract(
      network.nftContract,
      NFT_CONTRACT_ABI,
      this.signer
    );

    this.marketplaceContract = new ethers.Contract(
      network.marketplaceContract,
      MARKETPLACE_ABI,
      this.signer
    );
  }

  async mintNFT(
    to: string, 
    metadata: NFTMetadata, 
    antiqueId: string
  ): Promise<{ tokenId: string; transactionHash: string }> {
    try {
      if (!this.nftContract || !this.signer) {
        throw new Error('Wallet not connected or contract not initialized');
      }

      // Upload metadata to IPFS (simplified - in production, use proper IPFS service)
      const metadataUri = await this.uploadToIPFS(metadata);

      // Mint NFT
      const tx = await this.nftContract.mintNFT(to, metadataUri);
      const receipt = await tx.wait();

      // Get token ID from event
      const transferEvent = receipt.logs.find(
        (log: any) => log.fragment && log.fragment.name === 'Transfer'
      );
      
      if (!transferEvent) {
        throw new Error('Transfer event not found');
      }

      const tokenId = transferEvent.args[2].toString();

      // Save NFT to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('nfts').insert({
          antique_id: antiqueId,
          owner_id: user.id,
          contract_address: NETWORKS[this.currentNetwork].nftContract,
          token_id: tokenId,
          token_standard: 'ERC721',
          blockchain_network: this.currentNetwork,
          royalty_percentage: 5.0, // 5% royalty
          metadata_uri: metadataUri,
          minted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      return {
        tokenId,
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      throw error;
    }
  }

  async transferNFT(
    from: string,
    to: string,
    tokenId: string
  ): Promise<string> {
    try {
      if (!this.nftContract || !this.signer) {
        throw new Error('Wallet not connected or contract not initialized');
      }

      const tx = await this.nftContract.transferFrom(from, to, tokenId);
      const receipt = await tx.wait();

      // Update NFT owner in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('nfts').update({
          owner_id: user.id,
          updated_at: new Date().toISOString()
        }).eq('token_id', tokenId);
      }

      return receipt.hash;
    } catch (error) {
      console.error('Failed to transfer NFT:', error);
      throw error;
    }
  }

  async listNFT(
    tokenId: string,
    price: string
  ): Promise<string> {
    try {
      if (!this.marketplaceContract || !this.nftContract) {
        throw new Error('Contracts not initialized');
      }

      const network = NETWORKS[this.currentNetwork];
      const tx = await this.marketplaceContract.listNFT(
        network.nftContract,
        tokenId,
        ethers.parseEther(price)
      );
      const receipt = await tx.wait();

      // Update NFT listing status in database
      await supabase.from('nfts').update({
        is_listed: true,
        list_price: parseFloat(price),
        updated_at: new Date().toISOString()
      }).eq('token_id', tokenId);

      return receipt.hash;
    } catch (error) {
      console.error('Failed to list NFT:', error);
      throw error;
    }
  }

  async buyNFT(tokenId: string, price: string): Promise<string> {
    try {
      if (!this.marketplaceContract) {
        throw new Error('Marketplace contract not initialized');
      }

      const network = NETWORKS[this.currentNetwork];
      const tx = await this.marketplaceContract.buyNFT(
        network.nftContract,
        tokenId,
        { value: ethers.parseEther(price) }
      );
      const receipt = await tx.wait();

      // Record transaction in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: nft } = await supabase
          .from('nfts')
          .select('*')
          .eq('token_id', tokenId)
          .single();

        if (nft) {
          await supabase.from('transactions').insert({
            nft_id: nft.id,
            seller_id: nft.owner_id,
            buyer_id: user.id,
            transaction_hash: receipt.hash,
            transaction_type: 'sale',
            price: parseFloat(price),
            status: 'completed',
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });

          // Update NFT owner
          await supabase.from('nfts').update({
            owner_id: user.id,
            is_listed: false,
            list_price: null,
            updated_at: new Date().toISOString()
          }).eq('token_id', tokenId);
        }
      }

      return receipt.hash;
    } catch (error) {
      console.error('Failed to buy NFT:', error);
      throw error;
    }
  }

  async getNFTMetadata(tokenId: string): Promise<NFTMetadata> {
    try {
      if (!this.nftContract) {
        throw new Error('NFT contract not initialized');
      }

      const metadataUri = await this.nftContract.tokenURI(tokenId);
      
      // Fetch metadata from IPFS or HTTP
      const response = await fetch(metadataUri);
      const metadata = await response.json();
      
      return metadata;
    } catch (error) {
      console.error('Failed to get NFT metadata:', error);
      throw error;
    }
  }

  async getNFTOwner(tokenId: string): Promise<string> {
    try {
      if (!this.nftContract) {
        throw new Error('NFT contract not initialized');
      }

      const owner = await this.nftContract.ownerOf(tokenId);
      return owner;
    } catch (error) {
      console.error('Failed to get NFT owner:', error);
      throw error;
    }
  }

  async getWalletBalance(): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const address = await this.signer.getAddress();
      const balance = await this.provider!.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      throw error;
    }
  }

  private async uploadToIPFS(metadata: NFTMetadata): Promise<string> {
    // Simplified IPFS upload - in production, use proper IPFS service
    // For now, return a mock IPFS URI
    const metadataJson = JSON.stringify(metadata);
    const ipfsHash = 'Qm' + Math.random().toString(36).substring(2, 15);
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  }

  getCurrentNetwork(): string {
    return this.currentNetwork;
  }

  setNetwork(network: string): void {
    if (NETWORKS[network]) {
      this.currentNetwork = network;
      this.initializeProvider();
    } else {
      throw new Error(`Unsupported network: ${network}`);
    }
  }

  isWalletConnected(): boolean {
    return this.signer !== null;
  }

  getSignerAddress(): string | null {
    if (!this.signer) return null;
    
    try {
      return this.signer.getAddress().toString();
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();