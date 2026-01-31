import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  LogOut, 
  Network, 
  DollarSign, 
  Copy, 
  ExternalLink,
  AlertCircle 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBlockchainStore, NETWORKS } from '@/stores/blockchainStore';
import { formatAddress } from '@/lib/utils';

export const WalletConnect: React.FC = () => {
  const {
    isWalletConnected,
    walletAddress,
    walletBalance,
    currentNetwork,
    isConnecting,
    connectionError,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshWalletBalance
  } = useBlockchainStore();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isWalletConnected && walletAddress) {
      refreshWalletBalance();
    }
  }, [isWalletConnected, walletAddress, refreshWalletBalance]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const handleNetworkSwitch = async (network: string) => {
    try {
      await switchNetwork(network);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
    }
  };

  const openInExplorer = () => {
    if (walletAddress) {
      const explorerUrl = `${NETWORKS[currentNetwork].blockExplorer}/address/${walletAddress}`;
      window.open(explorerUrl, '_blank');
    }
  };

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  if (!isWalletConnected) {
    return (
      <div className="flex items-center space-x-2">
        {connectionError && (
          <Alert variant="destructive" className="py-2 px-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {connectionError}
            </AlertDescription>
          </Alert>
        )}
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">{NETWORKS[currentNetwork].name}</span>
            <span className="sm:hidden">{currentNetwork}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Select Network</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(NETWORKS).map(([key, network]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => handleNetworkSwitch(key)}
              className={currentNetwork === key ? 'bg-accent' : ''}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{network.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="hidden sm:inline">
                {formatAddress(walletAddress!)}
              </span>
              <span className="sm:hidden">
                {formatAddress(walletAddress!, 4, 4)}
              </span>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              <DollarSign className="h-3 w-3 mr-1" />
              {parseFloat(walletBalance).toFixed(4)}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="px-2 py-2">
            <div className="text-sm font-medium mb-1">Connected Address</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted rounded px-2 py-1">
              <span>{walletAddress}</span>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={copyAddress}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={openInExplorer}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="px-2 py-2">
            <div className="text-sm font-medium mb-1">Balance</div>
            <div className="text-lg font-semibold">
              {parseFloat(walletBalance).toFixed(4)} ETH
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={refreshWalletBalance}>
            <DollarSign className="h-4 w-4 mr-2" />
            Refresh Balance
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};