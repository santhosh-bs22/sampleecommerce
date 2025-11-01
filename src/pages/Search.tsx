// src/pages/Search.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { LayoutGrid, List, SearchX } from 'lucide-react';
import { Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchProducts } from '../api/productApi';
import { cn } from '../lib/utils';
import { motion, AnimatePresence, Transition } from 'framer-motion';

// Container variants for staggering children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    } as Transition,
  },
};

const Search: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchParams] = useSearchParams();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const searchTerm = searchParams.get('q') || '';
  
  // Determine the current view mode based on device
  const currentViewMode = isMobile ? viewMode : 'grid';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadProducts = useCallback(async (pageNum: number, term: string) => {
    if (!term) {
      setIsLoading(false);
      setProducts([]);
      return;
    }

    if (pageNum === 0) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const filters = {
        searchTerm: term,
        sortBy: 'popular' as const
      };
      
      const limit = isMobile ? 12 : 20; // 12 for mobile "load more", 20 for desktop
      const data = await fetchProducts(pageNum, limit, filters); 
      
      if (pageNum === 0) {
        setProducts(data.products); // Reset products
      } else {
        setProducts(prev => [...prev, ...data.products]); // Append products
      }
      setHasMore(data.hasMore && isMobile); 

    } catch (error) {
      console.error("Failed to fetch search results:", error);
      setProducts([]); 
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [isMobile]);

  // Trigger search when searchTerm changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setPage(0); // Reset page
    loadProducts(0, searchTerm); // Fetch page 0
  }, [searchTerm, loadProducts]);

  // Trigger for "Load More"
  useEffect(() => {
    if (page > 0) {
      loadProducts(page, searchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); 
  
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* --- Search Header --- */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        {searchTerm ? (
          <h1 className="text-2xl md:text-3xl font-bold">
            Results for "<span className="text-primary">{searchTerm}</span>"
          </h1>
        ) : (
          <h1 className="text-2xl md:text-3xl font-bold">Search Products</h1>
        )}

        {/* View Mode Switcher - Only on mobile */}
        {isMobile && (
          <div className="flex items-center gap-2 self-end">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
              className="h-9 w-9"
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              aria-label="List View"
              className="h-9 w-9"
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* --- Products Section --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={searchTerm + currentViewMode}
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }} 
          transition={{ duration: 0.3 } as Transition} 
          className="min-h-[400px]" 
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <LoadingSpinner size="lg" />
            </div>
          ) : !searchTerm ? (
            <div className="text-center text-muted-foreground pt-16 text-lg flex flex-col items-center gap-4">
               <SearchX className="h-16 w-16 text-muted-foreground/50" />
               <p className="text-xl font-semibold text-foreground">Start Your Search</p>
               <p>Please enter a product name, category, or brand in the search bar above.</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <motion.div 
                className={cn(
                  "grid gap-4",
                  currentViewMode === 'list'
                    ? "grid-cols-1"
                    : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6"
                )}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {products.map((product, i) => (
                  <ProductCard 
                    key={`${product.source}-${product.id}-${i}`} 
                    product={product} 
                    viewMode={currentViewMode}
                    index={i} 
                  />
                ))}
              </motion.div>

              {/* Load More Button (Mobile Only) */}
              {isMobile && (
                <div className="mt-12 text-center">
                  {!isLoadingMore && hasMore && (
                    <Button onClick={handleLoadMore} size="lg" variant="outline" className="w-full sm:w-auto">
                      Load More Results
                    </Button>
                  )}
                  {isLoadingMore && (
                    <Button size="lg" disabled className="w-full sm:w-auto">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Loading...
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            // No results found
            <div className="text-center text-muted-foreground pt-16 text-lg flex flex-col items-center gap-4">
              <SearchX className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-xl font-semibold text-foreground">No Results Found</p>
              <p>We couldn't find any products matching "<span className="font-medium text-foreground">{searchTerm}</span>".</p>
              <p className="text-sm">Try checking your spelling or using a different term.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Search;