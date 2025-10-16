import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Search, Filter, Grid3X3, List, SlidersHorizontal, X, Scale, Minus } from 'lucide-react';
import { categories } from '../mockData'; 
import { Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner'; 
import { fetchProducts } from '../api/productApi'; 
import { cn } from '../lib/utils';
import { useComparisonStore } from '../store/useComparisonStore'; // 👈 Imported


// Define state for paginated products
interface ProductsState {
  products: Product[];
  currentPage: number;
  totalProducts: number;
  hasMore: boolean;
  isLoading: boolean;
}

const Home: React.FC = () => {
  const MAX_PRICE = 300000;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'rating' | 'popular'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [showFilters, setShowFilters] = useState(false);
  
  const { products: productsToCompare, removeProduct, clearComparison } = useComparisonStore(); // 👈 New Comparison State
  
  const [productsState, setProductsState] = useState<ProductsState>({
    products: [],
    currentPage: 0,
    totalProducts: 0,
    hasMore: true,
    isLoading: false,
  });

  const { products, currentPage, totalProducts, hasMore, isLoading } = productsState;
  
  const debouncedSearchTerm = useMemo(() => searchTerm, [searchTerm]);

  const fetchProductsData = useCallback(async (isInitialLoad: boolean = false) => {
    if (!hasMore && !isInitialLoad) return;
    if (isLoading) return; 

    setProductsState(prev => ({ ...prev, isLoading: true }));
    
    const pageToFetch = isInitialLoad ? 0 : currentPage;
    
    try {
      const data = await fetchProducts(pageToFetch, 8, { 
        searchTerm: debouncedSearchTerm,
        category: selectedCategory,
        priceRange: priceRange,
        sortBy: sortBy,
      });

      setProductsState(prev => ({
        products: isInitialLoad ? data.products : [...prev.products, ...data.products],
        currentPage: pageToFetch + 1,
        totalProducts: data.total,
        hasMore: data.hasMore,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProductsState(prev => ({ ...prev, isLoading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory, sortBy, priceRange, hasMore, isLoading]);

  useEffect(() => {
    setProductsState(prev => ({ ...prev, currentPage: 0, hasMore: true, products: [] }));
    fetchProductsData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedCategory, sortBy, JSON.stringify(priceRange)]);
  
  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchProductsData(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, MAX_PRICE]);
    setSortBy('popular');
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== 'all',
    priceRange[0] > 0 || priceRange[1] < MAX_PRICE
  ].filter(Boolean).length;

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
            Welcome to <span className="text-primary">EcomX</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Discover amazing products at unbeatable prices. 
            <span className="block">Shop with confidence and enjoy fast delivery.</span>
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for products, brands, and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg border-2 focus:border-primary shadow-lg"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Categories & Filters */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
        
        {/* Responsive Category Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2 text-sm font-semibold transition-all hover:scale-105"
            onClick={() => setSelectedCategory('all')}
          >
            🏠 All Products
          </Badge>
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2 text-sm font-semibold capitalize transition-all hover:scale-105"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'smartphones' && '📱 '}
              {category === 'laptops' && '💻 '}
              {category === 'audio' && '🎧 '}
              {category === 'footwear' && '👟 '}
              {category === 'cameras' && '📷 '}
              {category === 'home-decor' && '🏠 '}
              {category.replace('-', ' ')}
            </Badge>
          ))}
        </div>

        {/* Advanced Filters (Responsive grid) */}
        {showFilters && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={MAX_PRICE}
                      step="1000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max={MAX_PRICE}
                      step="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="popular">Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                {/* Quick Actions */}
                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={() => setShowFilters(false)}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Results Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory.replace('-', ' ')}
          </h2>
          <p className="text-muted-foreground">
            {totalProducts > 0 ? `${totalProducts} products found` : (isLoading ? 'Searching...' : '0 products found')}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-9 w-9"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-9 w-9"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <section>
        {products.length > 0 ? (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-6'
            }>
              {products.map(product => (
                <ProductCard 
                  key={`${product.source}-${product.id}`} 
                  product={product} 
                  viewMode={viewMode}
                />
              ))}
            </div>
            
            {/* Infinite Load Button */}
            <div className="mt-8 text-center">
              {isLoading && products.length === 0 ? (
                <LoadingSpinner size="lg" className="h-32" />
              ) : hasMore ? (
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  size="lg"
                  className="w-full max-w-sm"
                >
                  {isLoading ? <LoadingSpinner size="sm" className='mr-2' /> : null}
                  {isLoading ? 'Loading More...' : 'Load More Products'}
                </Button>
              ) : (
                <p className="text-muted-foreground">You've reached the end of the available products.</p>
              )}
            </div>
          </>
        ) : isLoading ? (
           <LoadingSpinner size="lg" className="h-64" />
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any products matching your criteria. 
                Try adjusting your filters or search terms.
              </p>
              <Button 
                onClick={clearFilters}
                size="lg"
              >
                Clear Filters & Show All
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Featured Brands */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Featured Brands</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {['Apple', 'Samsung', 'Sony', 'Nike', 'Canon', 'Dell'].map((brand) => (
            <Card key={brand} className="text-center p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-2">
                <div className="2xl mb-2">
                  {brand === 'Apple' && '🍎'}
                  {brand === 'Samsung' && '📱'}
                  {brand === 'Sony' && '🎧'}
                  {brand === 'Nike' && '👟'}
                  {brand === 'Canon' && '📷'}
                  {brand === 'Dell' && '💻'}
                </div>
                <p className="font-semibold text-sm">{brand}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
    
    {/* Comparison Bar (New Feature) */}
    {productsToCompare.length > 0 && (
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 bg-card border-t shadow-2xl transition-all duration-300",
          productsToCompare.length > 0 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
            <Scale className="h-6 w-6 text-primary" />
            <span className="font-semibold text-sm">
              {productsToCompare.length} {productsToCompare.length === 1 ? 'Item' : 'Items'} Selected for Comparison (Max 4)
            </span>
            <div className="flex space-x-2">
              {productsToCompare.map(product => (
                <Badge key={product.id} className="bg-primary/10 text-primary flex items-center gap-1">
                  {product.title.split(' ').slice(0, 2).join(' ')}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 p-0 text-primary hover:bg-primary/20"
                    onClick={() => removeProduct(product.id)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={clearComparison}>
              Clear
            </Button>
            <Button disabled={productsToCompare.length < 2} asChild>
              <Link to="/compare-products" onClick={() => clearComparison()}> {/* Mocked link/navigation */}
                Compare ({productsToCompare.length})
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Home;