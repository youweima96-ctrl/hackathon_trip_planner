import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  ShoppingCart,
  ExternalLink,
  Copy,
  Eye,
  Tag,
  Clock,
  Shield,
  Zap,
  Award
} from 'lucide-react';
import { NFT } from '@/stores/blockchainStore';
import { useBlockchainStore } from '@/stores/blockchainStore';
import { formatPrice, formatAddress, formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface NFTCardProps {
  nft: NFT;
  viewMode?: 'grid' | 'list';
  featured?: boolean;
  showActions?: boolean;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  viewMode = 'grid',
  featured = false,
  showActions = true
}) => {
  const navigate = useNavigate();
  const { isWalletConnected, walletAddress, buyNFT } = useBlockchainStore();
  
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const primaryImage = nft.antique?.images?.find(img => img.is_primary) || 
                       nft.antique?.images?.[0];

  const handleBuy = async () => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!nft.list_price) {
      toast.error('NFT is not for sale');
      return;
    }

    setShowBuyDialog(true);
  };

  const confirmBuy = async () => {
    if (!nft.list_price) return;

    setIsBuying(true);
    try {
      const transactionHash = await buyNFT(nft.token_id, nft.list_price.toString());
      toast.success('NFT purchased successfully!', {
        description: `Transaction: ${transactionHash.slice(0, 10)}...`
      });
      setShowBuyDialog(false);
    } catch (error) {
      toast.error('Failed to purchase NFT', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsBuying(false);
    }
  };

  const copyContractAddress = async () => {
    await navigator.clipboard.writeText(nft.contract_address);
    toast.success('Contract address copied to clipboard');
  };

  const viewOnExplorer = () => {
    const explorerUrl = `https://polygonscan.com/token/${nft.contract_address}?a=${nft.token_id}`;
    window.open(explorerUrl, '_blank');
  };

  const viewDetails = () => {
    navigate(`/nft/${nft.id}`);
  };

  if (viewMode === 'list') {
    return (
      <>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex">
            <div className="relative w-32 h-32 flex-shrink-0">
              <img
                src={primaryImage?.image_url || '/api/placeholder/128/128'}
                alt={nft.antique?.name}
                className="w-full h-full object-cover"
              />
              {featured && (
                <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                  <Award className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              <Badge className="absolute top-2 right-2 bg-blue-600 text-white text-xs">
                <Zap className="h-2 w-2 mr-1" />
                {nft.blockchain_network}
              </Badge>
            </div>
            
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{nft.antique?.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {nft.antique?.description}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-green-600">
                    {nft.list_price ? formatPrice(nft.list_price) : 'Not Listed'}
                  </div>
                  {nft.royalty_percentage > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Royalty: {nft.royalty_percentage}%
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    {nft.antique?.category}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(nft.created_at)}
                  </span>
                  <span className="flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    {nft.token_standard}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Token #{nft.token_id.slice(-6)}
                </Badge>
              </div>

              {showActions && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={viewDetails}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {nft.list_price && (
                    <Button
                      onClick={handleBuy}
                      disabled={isBuying}
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      {isBuying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        <AlertDialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to purchase this NFT for {nft.list_price ? formatPrice(nft.list_price) : ''}? 
                This action cannot be undone and will require blockchain confirmation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmBuy} disabled={isBuying}>
                {isBuying ? 'Processing...' : 'Confirm Purchase'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
        <div className="relative">
          <img
            src={primaryImage?.image_url || '/api/placeholder/400/300'}
            alt={nft.antique?.name}
            className="w-full h-64 object-cover"
          />
          
          {featured && (
            <Badge className="absolute top-3 left-3 bg-orange-500 text-white">
              <Award className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          
          <Badge className="absolute top-3 right-3 bg-blue-600 text-white text-xs">
            <Zap className="h-2 w-2 mr-1" />
            {nft.blockchain_network}
          </Badge>

          {nft.is_listed && nft.list_price && (
            <div className="absolute bottom-3 left-3 right-3">
              <Badge className="bg-green-600 text-white text-sm font-semibold">
                <ShoppingCart className="h-3 w-3 mr-1" />
                {formatPrice(nft.list_price)}
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{nft.antique?.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {nft.antique?.description}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <Badge variant="outline" className="text-xs">
                {nft.antique?.category}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Standard</span>
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-2 w-2 mr-1" />
                {nft.token_standard}
              </Badge>
            </div>
            
            {nft.royalty_percentage > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Royalty</span>
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                  {nft.royalty_percentage}%
                </Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Token ID</span>
              <span className="text-xs font-mono text-muted-foreground">
                #{nft.token_id.slice(-6)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex space-x-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={viewDetails}
              className="flex-1"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={copyContractAddress}
              className="px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={viewOnExplorer}
              className="px-2"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
            
            {nft.list_price && (
              <Button
                onClick={handleBuy}
                disabled={isBuying}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-sm"
              >
                {isBuying ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                ) : (
                  <>
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Buy
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to purchase "{nft.antique?.name}" for {nft.list_price ? formatPrice(nft.list_price) : ''}? 
              This action cannot be undone and will require blockchain confirmation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBuy} disabled={isBuying}>
              {isBuying ? 'Processing...' : 'Confirm Purchase'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};