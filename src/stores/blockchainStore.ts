import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { blockchainService, NFTMetadata, NetworkConfig, NETWORKS } from '@/lib/blockchain';

export interface NFT {
  id: string;
  antique_id: string;
  owner_id: string;
  contract_address: string;
  token_id: string;
  token_standard: string;
  blockchain_network: string;
  royalty_percentage: number;
  metadata_uri: string;
  ipfs_hash?: string;
  is_listed: boolean;
  list_price?: number;
  minted_at: string;
  created_at: string;
  updated_at: string;
  antique?: {
    name: string;
    description: string;
    price: number;
    category: string;
    era: string;
    material: string;
    dimensions: string;
    images: Array<{
      image_url: string;
      is_primary: boolean;
    }>;
  };
}

export interface Transaction {
  id: string;
  nft_id: string;
  seller_id: string;
  buyer_id: string;
  transaction_hash: string;
  transaction_type: string;
  price: number;
  royalty_paid: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

export interface BlockchainState {
  // Wallet state
  isWalletConnected: boolean;
  walletAddress: string | null;
  walletBalance: string;
  currentNetwork: string;
  isConnecting: boolean;
  connectionError: string | null;

  // NFT state
  nfts: NFT[];
  myNFTs: NFT[];
  listedNFTs: NFT[];
  featuredNFTs: NFT[];
  isLoadingNFTs: boolean;
  nftsError: string | null;

  // Transaction state
  transactions: Transaction[];
  myTransactions: Transaction[];
  isLoadingTransactions: boolean;
  transactionsError: string | null;

  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (network: string) => Promise<void>;
  
  // NFT actions
  fetchNFTs: () => Promise<void>;
  fetchMyNFTs: () => Promise<void>;
  fetchListedNFTs: () => Promise<void>;
  fetchFeaturedNFTs: () => Promise<void>;
  mintNFT: (antiqueId: string, metadata: NFTMetadata) => Promise<string>;
  listNFT: (tokenId: string, price: string) => Promise<string>;
  buyNFT: (tokenId: string, price: string) => Promise<string>;
  transferNFT: (tokenId: string, toAddress: string) => Promise<string>;
  
  // Transaction actions
  fetchTransactions: () => Promise<void>;
  fetchMyTransactions: () => Promise<void>;
  
  // Utility actions
  refreshWalletBalance: () => Promise<void>;
  clearErrors: () => void;
}

export const useBlockchainStore = create<BlockchainState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isWalletConnected: false,
        walletAddress: null,
        walletBalance: '0',
        currentNetwork: 'polygon',
        isConnecting: false,
        connectionError: null,

        nfts: [],
        myNFTs: [],
        listedNFTs: [],
        featuredNFTs: [],
        isLoadingNFTs: false,
        nftsError: null,

        transactions: [],
        myTransactions: [],
        isLoadingTransactions: false,
        transactionsError: null,

        // Wallet actions
        connectWallet: async () => {
          set({ isConnecting: true, connectionError: null });
          try {
            const address = await blockchainService.connectWallet();
            const balance = await blockchainService.getWalletBalance();
            
            set({
              isWalletConnected: true,
              walletAddress: address,
              walletBalance: balance,
              isConnecting: false
            });
          } catch (error) {
            set({
              isWalletConnected: false,
              walletAddress: null,
              walletBalance: '0',
              isConnecting: false,
              connectionError: error instanceof Error ? error.message : 'Failed to connect wallet'
            });
            throw error;
          }
        },

        disconnectWallet: async () => {
          try {
            await blockchainService.disconnectWallet();
            set({
              isWalletConnected: false,
              walletAddress: null,
              walletBalance: '0'
            });
          } catch (error) {
            console.error('Failed to disconnect wallet:', error);
            throw error;
          }
        },

        switchNetwork: async (network: string) => {
          try {
            blockchainService.setNetwork(network);
            set({ currentNetwork: network });
            
            // Refresh data for new network
            await get().fetchNFTs();
            if (get().isWalletConnected) {
              await get().refreshWalletBalance();
            }
          } catch (error) {
            set({
              connectionError: error instanceof Error ? error.message : 'Failed to switch network'
            });
            throw error;
          }
        },

        // NFT actions
        fetchNFTs: async () => {
          set({ isLoadingNFTs: true, nftsError: null });
          try {
            const { data, error } = await supabase
              .from('nfts')
              .select(`
                *,
                antique:antiques(
                  name,
                  description,
                  price,
                  category,
                  era,
                  material,
                  dimensions,
                  images:antique_images(
                    image_url,
                    is_primary
                  )
                )
              `)
              .order('created_at', { ascending: false });

            if (error) throw error;
            
            set({ nfts: data || [], isLoadingNFTs: false });
          } catch (error) {
            set({
              nfts: [],
              isLoadingNFTs: false,
              nftsError: error instanceof Error ? error.message : 'Failed to fetch NFTs'
            });
          }
        },

        fetchMyNFTs: async () => {
          set({ isLoadingNFTs: true, nftsError: null });
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
              .from('nfts')
              .select(`
                *,
                antique:antiques(
                  name,
                  description,
                  price,
                  category,
                  era,
                  material,
                  dimensions,
                  images:antique_images(
                    image_url,
                    is_primary
                  )
                )
              `)
              .eq('owner_id', user.id)
              .order('created_at', { ascending: false });

            if (error) throw error;
            
            set({ myNFTs: data || [], isLoadingNFTs: false });
          } catch (error) {
            set({
              myNFTs: [],
              isLoadingNFTs: false,
              nftsError: error instanceof Error ? error.message : 'Failed to fetch my NFTs'
            });
          }
        },

        fetchListedNFTs: async () => {
          set({ isLoadingNFTs: true, nftsError: null });
          try {
            const { data, error } = await supabase
              .from('nfts')
              .select(`
                *,
                antique:antiques(
                  name,
                  description,
                  price,
                  category,
                  era,
                  material,
                  dimensions,
                  images:antique_images(
                    image_url,
                    is_primary
                  )
                )
              `)
              .eq('is_listed', true)
              .order('list_price', { ascending: true });

            if (error) throw error;
            
            set({ listedNFTs: data || [], isLoadingNFTs: false });
          } catch (error) {
            set({
              listedNFTs: [],
              isLoadingNFTs: false,
              nftsError: error instanceof Error ? error.message : 'Failed to fetch listed NFTs'
            });
          }
        },

        fetchFeaturedNFTs: async () => {
          set({ isLoadingNFTs: true, nftsError: null });
          try {
            // Get featured NFTs based on price, rarity, or other criteria
            const { data, error } = await supabase
              .from('nfts')
              .select(`
                *,
                antique:antiques(
                  name,
                  description,
                  price,
                  category,
                  era,
                  material,
                  dimensions,
                  images:antique_images(
                    image_url,
                    is_primary
                  )
                )
              `)
              .eq('is_listed', true)
              .limit(6)
              .order('list_price', { ascending: false });

            if (error) throw error;
            
            set({ featuredNFTs: data || [], isLoadingNFTs: false });
          } catch (error) {
            set({
              featuredNFTs: [],
              isLoadingNFTs: false,
              nftsError: error instanceof Error ? error.message : 'Failed to fetch featured NFTs'
            });
          }
        },

        mintNFT: async (antiqueId: string, metadata: NFTMetadata) => {
          try {
            if (!get().isWalletConnected) {
              throw new Error('Wallet not connected');
            }

            const { tokenId, transactionHash } = await blockchainService.mintNFT(
              get().walletAddress!,
              metadata,
              antiqueId
            );

            // Refresh NFT data
            await get().fetchMyNFTs();
            
            return transactionHash;
          } catch (error) {
            set({
              nftsError: error instanceof Error ? error.message : 'Failed to mint NFT'
            });
            throw error;
          }
        },

        listNFT: async (tokenId: string, price: string) => {
          try {
            if (!get().isWalletConnected) {
              throw new Error('Wallet not connected');
            }

            const transactionHash = await blockchainService.listNFT(tokenId, price);
            
            // Refresh NFT data
            await get().fetchMyNFTs();
            await get().fetchListedNFTs();
            
            return transactionHash;
          } catch (error) {
            set({
              nftsError: error instanceof Error ? error.message : 'Failed to list NFT'
            });
            throw error;
          }
        },

        buyNFT: async (tokenId: string, price: string) => {
          try {
            if (!get().isWalletConnected) {
              throw new Error('Wallet not connected');
            }

            const transactionHash = await blockchainService.buyNFT(tokenId, price);
            
            // Refresh NFT data
            await get().fetchNFTs();
            await get().fetchMyNFTs();
            await get().fetchListedNFTs();
            
            return transactionHash;
          } catch (error) {
            set({
              nftsError: error instanceof Error ? error.message : 'Failed to buy NFT'
            });
            throw error;
          }
        },

        transferNFT: async (tokenId: string, toAddress: string) => {
          try {
            if (!get().isWalletConnected) {
              throw new Error('Wallet not connected');
            }

            const transactionHash = await blockchainService.transferNFT(
              get().walletAddress!,
              toAddress,
              tokenId
            );
            
            // Refresh NFT data
            await get().fetchMyNFTs();
            
            return transactionHash;
          } catch (error) {
            set({
              nftsError: error instanceof Error ? error.message : 'Failed to transfer NFT'
            });
            throw error;
          }
        },

        // Transaction actions
        fetchTransactions: async () => {
          set({ isLoadingTransactions: true, transactionsError: null });
          try {
            const { data, error } = await supabase
              .from('transactions')
              .select(`
                *,
                nft:nfts(
                  token_id,
                  antique:antiques(
                    name,
                    images:antique_images(
                      image_url,
                      is_primary
                    )
                  )
                ),
                seller:users!transactions_seller_id_fkey(
                  nickname,
                  wallet_address
                ),
                buyer:users!transactions_buyer_id_fkey(
                  nickname,
                  wallet_address
                )
              `)
              .order('created_at', { ascending: false })
              .limit(50);

            if (error) throw error;
            
            set({ transactions: data || [], isLoadingTransactions: false });
          } catch (error) {
            set({
              transactions: [],
              isLoadingTransactions: false,
              transactionsError: error instanceof Error ? error.message : 'Failed to fetch transactions'
            });
          }
        },

        fetchMyTransactions: async () => {
          set({ isLoadingTransactions: true, transactionsError: null });
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
              .from('transactions')
              .select(`
                *,
                nft:nfts(
                  token_id,
                  antique:antiques(
                    name,
                    images:antique_images(
                      image_url,
                      is_primary
                    )
                  )
                ),
                seller:users!transactions_seller_id_fkey(
                  nickname,
                  wallet_address
                ),
                buyer:users!transactions_buyer_id_fkey(
                  nickname,
                  wallet_address
                )
              `)
              .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
              .order('created_at', { ascending: false });

            if (error) throw error;
            
            set({ myTransactions: data || [], isLoadingTransactions: false });
          } catch (error) {
            set({
              myTransactions: [],
              isLoadingTransactions: false,
              transactionsError: error instanceof Error ? error.message : 'Failed to fetch my transactions'
            });
          }
        },

        // Utility actions
        refreshWalletBalance: async () => {
          try {
            if (!get().isWalletConnected) return;
            
            const balance = await blockchainService.getWalletBalance();
            set({ walletBalance: balance });
          } catch (error) {
            console.error('Failed to refresh wallet balance:', error);
          }
        },

        clearErrors: () => {
          set({
            connectionError: null,
            nftsError: null,
            transactionsError: null
          });
        }
      }),
      {
        name: 'blockchain-storage',
        partialize: (state) => ({
          isWalletConnected: state.isWalletConnected,
          walletAddress: state.walletAddress,
          currentNetwork: state.currentNetwork
        })
      }
    ),
    {
      name: 'blockchain-store'
    }
  )
);

// Import supabase at the top
import { supabase } from '@/lib/supabase';