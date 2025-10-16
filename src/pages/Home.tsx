import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Search, Filter, Grid3X3, List, SlidersHorizontal, X } from 'lucide-react';
import { mockProducts, categories } from '../mockData';
import { Product } from '../types';

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'rating' | 'popular'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300000]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = mockProducts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'popular':
      default:
        // Sort by rating and discount (popular items)
        filtered = filtered.sort((a, b) => {
          const scoreA = a.rating * 20 + a.discountPercentage;
          const scoreB = b.rating * 20 + b.discountPercentage;
          return scoreB - scoreA;
        });
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategory, sortBy, priceRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, 300000]);
    setSortBy('popular');
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== 'all',
    priceRange[0] > 0 || priceRange[1] < 300000
  ].filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Welcome to <span className="text-primary">FlipStore</span>
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

      {/* Categories */}
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

        {/* Advanced Filters */}
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
                      max="300000"
                      step="1000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="300000"
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
            {filteredProducts.length} products found
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
        {filteredProducts.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-6'
          }>
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                viewMode={viewMode}
              />
            ))}
          </div>
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
                <div className="text-2xl mb-2">
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
  );
};

export default Home;