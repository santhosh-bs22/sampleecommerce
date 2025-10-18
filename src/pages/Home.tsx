// src/pages/Home.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom'; // Import useSearchParams
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Search, Filter, Grid3X3, List, SlidersHorizontal, X, Scale, Minus, Zap, Award, Tag } from 'lucide-react';
import { categories } from '../mockData';
import { Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchProducts } from '../api/productApi';
import { cn } from '../lib/utils';
import { useComparisonStore } from '../store/useComparisonStore';
import { motion, AnimatePresence } from 'framer-motion';

// ... (keep ProductsState interface and containerVariants)
interface ProductsState {
  products: Product[];
  currentPage: number;
  totalProducts: number;
  hasMore: boolean;
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const Home: React.FC = () => {
  const MAX_PRICE = 300000;
  const [searchParams] = useSearchParams(); // <-- Get search params hook
  const querySearchTerm = searchParams.get('q') || ''; // <-- Get 'q' parameter

  // You might want to remove the local searchTerm state if the header is the only search input
  // Or, initialize it with the query parameter
  const [searchTerm, setSearchTerm] = useState(querySearchTerm); // Initialize with URL param
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'rating' | 'popular'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [showFilters, setShowFilters] = useState(false);

  const { products: productsToCompare, removeProduct, clearComparison } = useComparisonStore();

  const [productsState, setProductsState] = useState<ProductsState>({
    products: [],
    currentPage: 0,
    totalProducts: 0,
    hasMore: true,
    isLoading: false,
  });

  const { products, currentPage, totalProducts, hasMore, isLoading } = productsState;

  // Update local searchTerm if the URL query parameter changes
  useEffect(() => {
    setSearchTerm(querySearchTerm);
  }, [querySearchTerm]);

  // Debouncing is less critical here if search happens on navigation, but kept for consistency
   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
   useEffect(() => {
     const handler = setTimeout(() => {
       setDebouncedSearchTerm(searchTerm);
     }, 300);
     return () => clearTimeout(handler);
   }, [searchTerm]);


  const fetchProductsData = useCallback(async (isInitialLoad: boolean = false) => {
    if (!hasMore && !isInitialLoad) return;
    if (isLoading && !isInitialLoad) return;

    setProductsState(prev => ({ ...prev, isLoading: true }));

    const pageToFetch = isInitialLoad ? 0 : currentPage;

    try {
      // <-- Use debouncedSearchTerm (derived from URL param) in API call -->
      const data = await fetchProducts(pageToFetch, 12, {
        searchTerm: debouncedSearchTerm, // <-- Pass the search term here
        category: selectedCategory,
        priceRange: priceRange[0] === 0 && priceRange[1] === MAX_PRICE ? undefined : priceRange,
        sortBy: sortBy,
      });

      setProductsState(prev => ({
        products: isInitialLoad ? data.products : [...prev.products, ...data.products],
        currentPage: pageToFetch + 1,
        totalProducts: data.total,
        hasMore: data.products.length === 12 && (pageToFetch * 12 + data.products.length < data.total),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProductsState(prev => ({ ...prev, isLoading: false, hasMore: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchTerm, selectedCategory, sortBy, JSON.stringify(priceRange), hasMore, isLoading]); // debouncedSearchTerm is now the key trigger

  // Effect to trigger initial load or reset on filter/search changes
  useEffect(() => {
    setProductsState(prev => ({
        ...prev,
        products: [],
        currentPage: 0,
        hasMore: true,
        isLoading: false
     }));
    fetchProductsData(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedCategory, sortBy, JSON.stringify(priceRange)]); // debouncedSearchTerm now triggers reload


  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchProductsData(false);
    }
  };

  const clearFilters = () => {
    // Also clear search term in the URL by navigating
    // navigate('/'); // Uncomment if you have navigate available here, or handle clearing differently
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, MAX_PRICE]);
    setSortBy('popular');
    setShowFilters(false);
  };

   const activeFiltersCount = [
    debouncedSearchTerm,
    selectedCategory !== 'all',
    priceRange[0] > 0 || priceRange[1] < MAX_PRICE
  ].filter(Boolean).length;

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.section
        // ... (animations remain the same)
        className="text-center mb-16 bg-gradient-to-br from-primary/10 via-background to-background rounded-xl py-12 px-6 shadow-sm"
      >
        <div className="max-w-4xl mx-auto">
           {/* ... (h1 and p tags remain the same) */}
            <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent"
           >
             Explore <span className="text-primary">EcomX</span> Trends
           </motion.h1>
           <motion.p
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.4, duration: 0.5 }}
             className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto"
           >
            Find curated collections and the latest arrivals. High quality, great value, delivered fast.
           </motion.p>

          {/* Search Bar in Home - Consider removing or disabling if Header search is primary */}
           <motion.div
             // ... (animations remain the same)
             className="max-w-2xl mx-auto relative"
            >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            {/* If keeping this search bar, ensure it also updates the URL param on submit */}
            <Input
              type="text"
              placeholder="Search EcomX..."
              value={searchTerm} // Reflects URL param or local changes
              onChange={(e) => setSearchTerm(e.target.value)} // Update local state
              // readOnly // Or make it readOnly if Header is the only input
              className="pl-12 pr-10 py-3 text-base border-2 border-border focus:border-primary focus:ring-1 focus:ring-primary/50 shadow-sm rounded-full w-full"
            />
            {/* ... (X button remains the same) */}
              {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm('')} // Clear local state, maybe navigate('/') too
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
           </motion.div>
        </div>
      </motion.section>

       {/* Categories & Filters */}
       {/* ... (rest of the component remains largely the same) ... */}
         <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-10"
        >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Shop by Category</h2>
           <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-full shadow-sm"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            </motion.div>
        </div>

         {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
           {/* Add 'all' category first */}
           <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge
                  variant={selectedCategory === 'all' ? 'default' : 'secondary'}
                  className="cursor-pointer px-4 py-2 text-sm font-medium transition-all rounded-full shadow-sm border border-transparent hover:border-primary/50"
                  onClick={() => setSelectedCategory('all')}
              >
                 ✨ All
              </Badge>
            </motion.div>
           {categories.map(category => (
            <motion.div key={category} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
               <Badge
                 variant={selectedCategory === category ? 'default' : 'secondary'}
                 className="cursor-pointer px-4 py-2 text-sm font-medium capitalize transition-all rounded-full shadow-sm border border-transparent hover:border-primary/50"
                 onClick={() => setSelectedCategory(category)}
               >
                 {category.replace('-', ' ')}
               </Badge>
             </motion.div>
           ))}
        </div>

        {/* Filters Panel */}
         <AnimatePresence>
           {showFilters && (
             <motion.div
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               transition={{ duration: 0.3, ease: 'easeInOut' }}
               style={{ overflow: 'hidden' }}
              >
                <Card className="mt-4 border shadow-md">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {/* Price Range */}
                       <div>
                         <label className="text-sm font-medium mb-2 block text-foreground/80">
                           Price Range
                         </label>
                         <div className="flex justify-between text-sm text-muted-foreground mb-1">
                           <span>₹{priceRange[0].toLocaleString()}</span>
                           <span>₹{priceRange[1].toLocaleString()}</span>
                          </div>
                          <input
                           type="range"
                           min="0" max={MAX_PRICE} step="1000"
                           value={priceRange[1]}
                           onChange={(e) => {
                             const newMax = Number(e.target.value);
                             if (newMax >= priceRange[0]) setPriceRange([priceRange[0], newMax]);
                           }}
                           className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                         />
                       </div>

                      {/* Sort By Dropdown */}
                       <div>
                         <label htmlFor="sort-select" className="text-sm font-medium mb-2 block text-foreground/80">Sort By</label>
                         <select
                            id="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                         >
                           <option value="popular">Most Popular</option>
                           <option value="price-low">Price: Low to High</option>
                           <option value="price-high">Price: High to Low</option>
                           <option value="rating">Highest Rating</option>
                           <option value="name">Name (A-Z)</option>
                         </select>
                       </div>

                       {/* Action Buttons */}
                       <div className="flex items-end gap-3 justify-end md:justify-start">
                         <Button
                            variant="ghost"
                            onClick={clearFilters}
                            className="text-muted-foreground hover:text-foreground"
                         >
                           Clear All
                         </Button>
                         <Button onClick={() => setShowFilters(false)}>
                           Apply Filters
                         </Button>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
           )}
          </AnimatePresence>
      </motion.section>

       {/* Results Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-semibold capitalize">
             {selectedCategory === 'all' ? 'Discover Products' : selectedCategory.replace('-', ' ')}
           </h2>
           <p className="text-sm text-muted-foreground">
            {isLoading && products.length === 0 ? 'Loading...' : `${totalProducts} results`}
            {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
           </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg shadow-sm">
           <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="h-8 w-8"> <Grid3X3 className="h-4 w-4" /> </Button>
           <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="h-8 w-8"> <List className="h-4 w-4" /> </Button>
        </div>
      </div>

       {/* Products Grid/List */}
       <section>
        <AnimatePresence>
          {products.length > 0 && (
             <motion.div
               key={selectedCategory + sortBy + JSON.stringify(priceRange) + debouncedSearchTerm} // Add debouncedSearchTerm to key
               variants={containerVariants}
               initial="hidden"
               animate="visible"
               className={viewMode === 'grid'
                 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                 : 'space-y-4'
               }
             >
               {products.map((product, i) => (
                 <ProductCard
                   key={`${product.source}-${product.id}-${i}`}
                   product={product}
                   viewMode={viewMode}
                   index={i}
                 />
               ))}
              </motion.div>
          )}
          </AnimatePresence>

         {/* Loading / No Results / Load More */}
         <div className="mt-12 text-center">
            {isLoading && products.length === 0 && <LoadingSpinner size="lg" className="h-32" />}
            {!isLoading && products.length === 0 && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16">
                 <div className="text-6xl mb-4">😔</div>
                 <h3 className="text-xl font-semibold mb-2">No Matches Found</h3>
                 <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Try adjusting your search or filters. We're always adding new items!
                 </p>
                 <Button onClick={clearFilters} variant="outline" size="lg"> Clear Filters </Button>
               </motion.div>
            )}
             {products.length > 0 && hasMore && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    size="lg"
                    variant="outline"
                    className="w-full max-w-sm rounded-full shadow hover:shadow-md transition-shadow"
                  >
                   {isLoading ? <LoadingSpinner size="sm" className='mr-2' /> : 'Load More'}
                  </Button>
                </motion.div>
             )}
             {products.length > 0 && !hasMore && !isLoading && (
                <p className="text-muted-foreground mt-8">✨ You've seen it all! ✨</p>
             )}
          </div>
        </section>

       {/* Why Shop Section */}
        <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="mt-20 pt-10 border-t"
       >
        <h2 className="text-3xl font-bold mb-8 text-center">Why Shop EcomX?</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 bg-gradient-to-br from-accent/50 to-background shadow hover:shadow-lg transition-shadow">
               <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
               <h3 className="text-lg font-semibold mb-2">Fast Shipping</h3>
               <p className="text-sm text-muted-foreground">Get your orders delivered quickly and reliably.</p>
            </Card>
           <Card className="text-center p-6 bg-gradient-to-br from-accent/50 to-background shadow hover:shadow-lg transition-shadow">
               <Award className="h-10 w-10 text-primary mx-auto mb-4" />
               <h3 className="text-lg font-semibold mb-2">Quality Guarantee</h3>
               <p className="text-sm text-muted-foreground">Only the best products, curated for you.</p>
            </Card>
           <Card className="text-center p-6 bg-gradient-to-br from-accent/50 to-background shadow hover:shadow-lg transition-shadow">
              <Tag className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Amazing Deals</h3>
              <p className="text-sm text-muted-foreground">Find great value and discounts every day.</p>
           </Card>
         </div>
       </motion.section>
    </div>

    {/* Comparison Bar */}
    {/* ... (Comparison bar code remains the same) */}
       <AnimatePresence>
        {productsToCompare.length > 0 && (
          <motion.div
             initial={{ y: "100%", opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: "100%", opacity: 0 }}
             transition={{ type: "spring", stiffness: 200, damping: 25 }}
             className={cn(
               "fixed bottom-0 left-0 right-0 z-40 bg-card border-t shadow-2xl"
              )}
           >
               <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide flex-1 min-w-0">
                     <Scale className="h-5 w-5 text-primary flex-shrink-0" />
                     <span className="font-semibold text-sm flex-shrink-0">
                      Compare ({productsToCompare.length}/4)
                     </span>
                     <div className="flex space-x-2">
                       {productsToCompare.map(product => (
                         <Badge key={product.id} className="bg-primary/10 text-primary flex items-center gap-1 py-1 px-2 rounded-full">
                           <span className="text-xs truncate max-w-[80px]">{product.title}</span>
                           <button
                              onClick={() => removeProduct(product.id)}
                              className="ml-1 p-0.5 rounded-full hover:bg-primary/20 focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                             <X className="h-3 w-3" />
                           </button>
                          </Badge>
                       ))}
                      </div>
                  </div>
                 <div className="flex items-center gap-2 flex-shrink-0">
                     <Button variant="ghost" size="sm" onClick={clearComparison}> Clear </Button>
                     <Link to={`/compare?ids=${productsToCompare.map(p=>`${p.source}-${p.id}`).join(',')}`}>
                       <Button size="sm" disabled={productsToCompare.length < 2}>
                          Compare Now
                       </Button>
                      </Link>
                  </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Home;