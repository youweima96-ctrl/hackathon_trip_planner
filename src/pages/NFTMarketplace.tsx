import React, { useEffect, useState } from 'react';
import { Search, Filter, Grid, List, TrendingUp, Clock, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBlockchainStore, NFT } from '@/stores/blockchainStore';
import { NFTCard } from '@/components/NFTCard';
import { formatPrice } from '@/lib/utils';

export const NFTMarketplace: React.FC = () => {
  const {
    listedNFTs,
    featuredNFTs,
    isLoadingNFTs,
    nftsError,
    fetchListedNFTs,
    fetchFeaturedNFTs
  } = useBlockchainStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchListedNFTs();
    fetchFeaturedNFTs();
  }, [fetchListedNFTs, fetchFeaturedNFTs]);

  // Filter and sort NFTs
  const filteredNFTs = listedNFTs.filter(nft => {
    const matchesSearch = nft.antique?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.antique?.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.antique?.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = nft.list_price && 
                        nft.list_price >= priceRange[0] && 
                        nft.list_price <= priceRange[1];
    
    const matchesCategory = selectedCategory === 'all' || 
                           nft.antique?.category === selectedCategory;
    
    return matchesSearch && matchesPrice && matchesCategory;
  });

  // Sort NFTs
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.list_price || 0) - (b.list_price || 0);
      case 'price-desc':
        return (b.list_price || 0) - (a.list_price || 0);
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      default:
        return 0;
    }
  });

  const categories = Array.from(new Set(listedNFTs.map(nft => nft.antique?.category).filter(Boolean)));

  if (nftsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{nftsError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          NFT Marketplace
        </h1>
        <p className="text-muted-foreground">
          Discover and collect unique antique NFTs from verified sellers
        </p>
      </div>

      {/* Featured NFTs */}
      {featuredNFTs.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-orange-500" />
              Featured NFTs
            </h2>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Hot Items
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredNFTs.slice(0, 3).map((nft) => (
              <NFTCard key={nft.id} nft={nft} featured />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search NFTs by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-accent' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full p-2 border rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {sortedNFTs.length} of {listedNFTs.length} NFTs
          </span>
          <Badge variant="secondary">
            <Tag className="h-3 w-3 mr-1" />
            {sortedNFTs.length} items
          </Badge>
        </div>
      </div>

      {/* NFT Grid/List */}
      {isLoadingNFTs ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {Array.from({ length: 8 }).map((_, i) => (
            viewMode === 'grid' ? (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-3" />
                  <Skeleton className="h-6 w-1/4" />
                </CardContent>
              </Card>
            ) : (
              <Card key={i} className="overflow-hidden">
                <div className="flex">
                  <Skeleton className="h-32 w-32" />
                  <CardContent className="flex-1 p-4">
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-3/4 mb-3" />
                    <Skeleton className="h-6 w-1/4" />
                  </CardContent>
                </div>
              </Card>
            )
          ))}
        </div>
      ) : sortedNFTs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            No NFTs found matching your criteria
          </div>
          <Button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setPriceRange([0, 1000]);
          }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {sortedNFTs.map((nft) => (
            <NFTCard key={nft.id} nft={nft} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Market Stats */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Market Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {listedNFTs.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Listed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {sortedNFTs.length}
              </div>
              <div className="text-sm text-muted-foreground">Filtered Results</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {sortedNFTs.length > 0 
                  ? formatPrice(sortedNFTs.reduce((sum, nft) => sum + (nft.list_price || 0), 0) / sortedNFTs.length)
                  : '$0'
                }
              </div>
              <div className="text-sm text-muted-foreground">Average Price</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {sortedNFTs.length > 0 
                  ? formatPrice(Math.max(...sortedNFTs.map(nft => nft.list_price || 0)))
                  : '$0'
                }
              </div>
              <div className="text-sm text-muted-foreground">Highest Price</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};