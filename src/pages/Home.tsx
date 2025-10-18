import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'; // Added CardHeader, CardTitle
import { Search, Filter, Grid3X3, List, SlidersHorizontal, X, Scale, Minus, Zap, Award, Tag } from 'lucide-react'; // Added Icons
import { categories } from '../mockData';
import { Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchProducts } from '../api/productApi';
import { cn } from '../lib/utils';
import { useComparisonStore } from '../store/useComparisonStore';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence

// Define state for paginated products
interface ProductsState {
  products: Product[];
  currentPage: number;
  totalProducts: number;
  hasMore: boolean;
  isLoading: boolean;
}

// Animation variants for the container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Stagger effect for children
    },
  },
};

const Home: React.FC = () => {
  const MAX_PRICE = 300000;

  // ... (keep existing state hooks: searchTerm, selectedCategory, sortBy, viewMode, priceRange, productsToCompare etc.)
  const [searchTerm, setSearchTerm] = useState('');
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

  // Debounce search term - Simple debounce simulation
   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
   useEffect(() => {
     const handler = setTimeout(() => {
       setDebouncedSearchTerm(searchTerm);
     }, 300); // 300ms debounce
     return () => clearTimeout(handler);
   }, [searchTerm]);

   // fetchProductsData remains largely the same, just ensure it resets correctly
  const fetchProductsData = useCallback(async (isInitialLoad: boolean = false) => {
    // ... (keep logic for hasMore, isLoading checks)
    if (!hasMore && !isInitialLoad) return;
    if (isLoading && !isInitialLoad) return; // Prevent multiple loads

    setProductsState(prev => ({ ...prev, isLoading: true }));

    const pageToFetch = isInitialLoad ? 0 : currentPage;

    try {
      const data = await fetchProducts(pageToFetch, 12, { // Fetch more items per page
        searchTerm: debouncedSearchTerm,
        category: selectedCategory,
        priceRange: priceRange[0] === 0 && priceRange[1] === MAX_PRICE ? undefined : priceRange, // Only pass if changed
        sortBy: sortBy,
      });

      setProductsState(prev => ({
        products: isInitialLoad ? data.products : [...prev.products, ...data.products],
        currentPage: pageToFetch + 1,
        totalProducts: data.total,
        // Ensure hasMore is correctly updated based on fetched items vs limit
        hasMore: data.products.length === 12 && (pageToFetch * 12 + data.products.length < data.total),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProductsState(prev => ({ ...prev, isLoading: false, hasMore: false })); // Stop loading on error
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchTerm, selectedCategory, sortBy, JSON.stringify(priceRange), hasMore, isLoading]); // Add debouncedSearchTerm dependency

  // Effect to trigger initial load or reset on filter changes
  useEffect(() => {
    // Reset state before fetching new filtered data
    setProductsState(prev => ({
        ...prev,
        products: [],
        currentPage: 0,
        hasMore: true,
        isLoading: false // Ensure isLoading is false before initial fetch
     }));
    fetchProductsData(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedCategory, sortBy, JSON.stringify(priceRange)]); // Dependencies trigger reload


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
    setShowFilters(false); // Close filters on clear
  };

   const activeFiltersCount = [
    debouncedSearchTerm, // Use debounced term for count
    selectedCategory !== 'all',
    priceRange[0] > 0 || priceRange[1] < MAX_PRICE
  ].filter(Boolean).length;

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section with Animation */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-16 bg-gradient-to-br from-primary/10 via-background to-background rounded-xl py-12 px-6 shadow-sm" // Added background gradient and padding
      >
        <div className="max-w-4xl mx-auto">
           <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent" // Updated gradient
           >
             Explore <span className="text-primary">EcomX</span> Trends
           </motion.h1>
           <motion.p
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.4, duration: 0.5 }}
             className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto" // Adjusted font size
           >
            Find curated collections and the latest arrivals. High quality, great value, delivered fast.
           </motion.p>

          {/* Search Bar - slightly restyled */}
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6, duration: 0.5 }}
             className="max-w-2xl mx-auto relative"
            >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search EcomX..." // Simplified placeholder
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-10 py-3 text-base border-2 border-border focus:border-primary focus:ring-1 focus:ring-primary/50 shadow-sm rounded-full w-full" // Rounded, different focus
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
           </motion.div>
        </div>
      </motion.section>

       {/* Categories & Filters - Animated */}
       <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-10"
        >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Shop by Category</h2> {/* Adjusted font weight */}
           <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-full shadow-sm" // Rounded button
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
                  variant={selectedCategory === 'all' ? 'default' : 'secondary'} // Use secondary for non-active
                  className="cursor-pointer px-4 py-2 text-sm font-medium transition-all rounded-full shadow-sm border border-transparent hover:border-primary/50" // Rounded pills
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

        {/* Filters Panel with Animation */}
         <AnimatePresence>
           {showFilters && (
             <motion.div
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               transition={{ duration: 0.3, ease: 'easeInOut' }}
               style={{ overflow: 'hidden' }} // Important for height animation
              >
                <Card className="mt-4 border shadow-md"> {/* Added shadow */}
                  <CardContent className="p-6"> {/* Increased padding */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Increased gap */}
                      {/* Price Range */}
                       <div>
                         <label className="text-sm font-medium mb-2 block text-foreground/80">
                           Price Range
                         </label>
                         <div className="flex justify-between text-sm text-muted-foreground mb-1">
                           <span>₹{priceRange[0].toLocaleString()}</span>
                           <span>₹{priceRange[1].toLocaleString()}</span>
                          </div>
                         {/* Style the range inputs (example - needs ::slider-thumb etc. for full styling) */}
                          <input
                           type="range"
                           min="0" max={MAX_PRICE} step="1000"
                           value={priceRange[1]} // Control max first for better UX potentially
                           onChange={(e) => {
                             const newMax = Number(e.target.value);
                             if (newMax >= priceRange[0]) setPriceRange([priceRange[0], newMax]);
                           }}
                           className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" // Style range
                         />
                       </div>

                      {/* Sort By Dropdown */}
                       <div>
                         <label htmlFor="sort-select" className="text-sm font-medium mb-2 block text-foreground/80">Sort By</label>
                         <select
                            id="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" // Improved styling
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
                            variant="ghost" // Use ghost for clear
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
           <p className="text-sm text-muted-foreground"> {/* Smaller text */}
            {isLoading && products.length === 0 ? 'Loading...' : `${totalProducts} results`}
            {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
           </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg shadow-sm"> {/* View Toggle */}
           <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="h-8 w-8"> <Grid3X3 className="h-4 w-4" /> </Button>
           <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="h-8 w-8"> <List className="h-4 w-4" /> </Button>
        </div>
      </div>

       {/* Products Grid/List with Stagger Animation */}
       <section>
        <AnimatePresence>
          {products.length > 0 && (
             <motion.div
               key={selectedCategory + sortBy + JSON.stringify(priceRange)} // Change key to force re-animation on filter change
               variants={containerVariants}
               initial="hidden"
               animate="visible"
               className={viewMode === 'grid'
                 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' // Keep grid layout
                 : 'space-y-4' // Reduce list spacing slightly
               }
             >
               {products.map((product, i) => (
                 <ProductCard
                   key={`${product.source}-${product.id}-${i}`} // Ensure unique key
                   product={product}
                   viewMode={viewMode}
                   index={i} // Pass index for stagger
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
                    variant="outline" // Changed variant
                    className="w-full max-w-sm rounded-full shadow hover:shadow-md transition-shadow" // Style load more
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

       {/* Placeholder for other sections like Featured Brands */}
       <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }} // Animate when scrolling into view
        viewport={{ once: true, amount: 0.3 }} // Trigger animation once, when 30% visible
        transition={{ duration: 0.5 }}
        className="mt-20 pt-10 border-t" // Add separator
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

    {/* Comparison Bar - Minor style tweaks */}
    {/* (Comparison bar code remains structurally similar, apply new color classes if needed) */}
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
              {/* ... rest of comparison bar JSX ... (ensure Button/Badge styles match new theme) */}
               <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide flex-1 min-w-0"> {/* Allow scroll on small screens */}
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
                      {/* Link to a future /compare page */}
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