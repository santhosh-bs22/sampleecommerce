// src/pages/Home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Scale,
  Minus,
  Truck,
  ShieldCheck,
  BadgeDollarSign,
  MessageSquare,
  X,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchProducts } from '../api/productApi';
import { categories } from '../mockData';
import { cn } from '../lib/utils';
import { useComparisonStore } from '../store/useComparisonStore';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import RecentlyViewed from '../components/RecentlyViewed';

// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Shared animation variants with proper typing
const sectionFadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: "easeOut" } as Transition
};

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

const ASSET_BASE_PATH = '/EcomX-website/'; // Your configured base path
const getAssetPath = (path: string) => {
    let url = ASSET_BASE_PATH;
    if (path.startsWith('/')) {
        url += path.substring(1);
    } else {
        url += path;
    }
    return url;
};

// Hero Slide Data
const heroSlides = [
  { id: 1, bgImageUrl: getAssetPath("images/hero/hero-bg-1.jpg"), altText: "Hero Background 1" },
  { id: 2, bgImageUrl: getAssetPath("images/hero/hero-bg-2.jpg"), altText: "Hero Background 2" },
  { id: 3, bgImageUrl: getAssetPath("images/hero/hero-bg-3.jpg"), altText: "Hero Background 3" },
  { id: 4, bgImageUrl: getAssetPath("images/hero/hero-bg-4.jpg"), altText: "Hero Background 4" },
  { id: 5, bgImageUrl: getAssetPath("images/hero/hero-bg-5.jpg"), altText: "Hero Background 5" }
];

// Category data
const featuredCategories = [
  { name: "Mobile", img: getAssetPath("images/categories/Mobile.jpg"), link: "/?category=smartphones" },
  { name: "home appliances", img: getAssetPath("images/categories/home appliances.jpg"), link: "/?category=home-appliances" },
  { name: "Women's Wear", img: getAssetPath("images/categories/women.png"), link: "/?category=womens-clothing" },
  { name: "Men's Wear", img: getAssetPath("images/categories/men.jpg"), link: "/?category=mens-clothing" },
  { name: "Accessories", img: getAssetPath("images/categories/Accessories.jpg"), link: "/?category=accessories" },
  { name: "Laptops", img: getAssetPath("images/categories/laptop.jpg"), link: "/?category=laptops" },
];

const Home: React.FC = () => {
  const { products: productsToCompare, removeProduct, clearComparison } = useComparisonStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const selectedCategory = searchParams.get('category') || 'all';
  const currentViewMode = isMobile ? viewMode : 'grid'; // Desktop always grid

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadProducts = useCallback(async (pageNum: number, category: string) => {
    if (pageNum === 0) setIsLoading(true);
    else setIsLoadingMore(true);
    
    if (category === 'home-appliances') {
      setProducts([]);
      setHasMore(false);
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    try {
      const filters = {
        category: category === 'all' ? undefined : category,
        sortBy: 'popular' as const
      };
      
      const limit = isMobile ? 12 : 20;
      const data = await fetchProducts(pageNum, limit, filters); 
      
      if (pageNum === 0) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }
      setHasMore(data.hasMore && isMobile); 

    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [isMobile]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPage(0);
    loadProducts(0, selectedCategory);
  }, [selectedCategory, loadProducts]);

  useEffect(() => {
    if (page > 0) {
      loadProducts(page, selectedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); 
  
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSearchParams(params => {
      params.set('category', category);
      params.delete('q'); // Clear search term when changing category
      return params;
    });
  };
  
  const fallbackAssetPath = getAssetPath("images/hero/hero-bg-1");
  const fallbackAssetPath2 = getAssetPath("images/hero/hero-bg-2");
  const fallbackAssetPath3 = getAssetPath("images/hero/hero-bg-3");
  const fallbackAssetPath4 = getAssetPath("images/hero/hero-bg-4");

  return (
    <>
      {/* Hero Banner */}
      <section className="relative w-full overflow-hidden group">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          pagination={{ 
            clickable: true, 
            el: '.swiper-pagination-custom-simple',
            dynamicBullets: true 
          }}
          speed={1000}
          className="w-full"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full min-h-[250px] sm:min-h-[350px] md:min-h-[450px] lg:min-h-[550px]">
                <img
                  src={slide.bgImageUrl}
                  alt={slide.altText}
                  className="absolute inset-0 z-0 w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = fallbackAssetPath;
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="swiper-pagination-custom-simple absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2"></div>
      </section>

      {/* Service Highlights Bar */}
      <section className="border-b border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 text-center md:text-left">
          {[
            { icon: Truck, title: "Free Shipping", subtitle: "On All Orders Over $99" },
            { icon: ShieldCheck, title: "Secure Payment", subtitle: "We ensure secure payment" },
            { icon: BadgeDollarSign, title: "Money Back", subtitle: "30 Days Return Policy" },
            { icon: MessageSquare, title: "Online Support", subtitle: "24/7 Dedicated Support" }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-2 sm:space-y-0 sm:space-x-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 * (index + 1) } as Transition}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Category Promo Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-auto"> 
          <motion.div
            className="md:col-span-1 lg:col-span-1 md:row-span-2 relative group overflow-hidden rounded-xl shadow-lg flex items-end p-6 bg-gray-200 dark:bg-gray-800 h-[500px] md:h-full"
            {...sectionFadeIn}
            transition={{ ...sectionFadeIn.transition, delay: 0.1 } as Transition}
          >
            <img
              src={getAssetPath("images/promos/women.png ")}
              alt="Women's Style"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackAssetPath;
              }}
            />
            <div className="relative z-10 text-white bg-black/10 p-6 rounded-xl  group-hover:bg-black/50 transition-all duration-300 w-full">
              <Badge className="mb-2 bg-white/20 text-white border-none">New Arrivals</Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Women's Style</h3>
              <p className="text-lg mb-4 font-semibold">Up To 70% OFF</p>
              <Link to="/?category=womens-clothing">
                <Button variant="secondary" size="sm" className="h-10 px-6 font-semibold">Shop Now</Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="relative group overflow-hidden rounded-xl shadow-lg flex items-end p-6 bg-gray-300 dark:bg-gray-700 h-[280px]"
            {...sectionFadeIn}
            transition={{ ...sectionFadeIn.transition, delay: 0.2 } as Transition}
          >
            <img
              src={getAssetPath("images/promos/handbags.jpg")}
              alt="Handbag"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackAssetPath2;
              }}
            />
            <div className="relative z-10 text-white p-4 rounded-xl bg-black/10 group-hover:bg-black/10 transition-all duration-300 w-full">
              <Badge className="mb-2 bg-red-500/80 text-white border-none">25% OFF</Badge>
              <h3 className="text-xl font-bold mb-2">Handbag</h3>
              <Link to="/?category=accessories">
                <Button variant="secondary" size="sm" className="h-8 text-xs px-3">Shop Now</Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="relative group overflow-hidden rounded-xl shadow-lg flex items-end p-6 bg-gray-300 dark:bg-gray-700 h-[280px]"
            {...sectionFadeIn}
            transition={{ ...sectionFadeIn.transition, delay: 0.3 } as Transition}
          >
            <img
              src={getAssetPath("images/promos/watch.jpg")}
              alt="Watch"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackAssetPath3;
              }}
            />
            <div className="relative z-10 text-white  p-4 rounded-xl bg-black/10 group-hover:bg-black/10 transition-all duration-300 w-full">
              <Badge className="mb-2 bg-green-500/80 text-white border-none">45% OFF</Badge>
              <h3 className="text-xl font-bold mb-2">Watch</h3>
              <Link to="/?category=accessories">
                <Button variant="secondary" size="sm" className="h-8 text-xs px-3">Shop Now</Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="md:col-span-1 relative group overflow-hidden rounded-xl shadow-lg flex items-end p-6 bg-gray-400 dark:bg-gray-600 h-[280px]"
            {...sectionFadeIn}
            transition={{ ...sectionFadeIn.transition, delay: 0.4 } as Transition}
          >
            <img
              src={getAssetPath("images/promos/laptop.jpg")} 
              alt="Laptop"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackAssetPath3;
              }}
            />
            <div className="relative z-10 text-white p-4 rounded-xl bg-black/10 group-hover:bg-black/10 transition-all duration-300 w-full">
              <Badge className="mb-2 bg-indigo-500/80 text-white border-none">Big Savings</Badge>
              <h3 className="text-xl font-bold mb-1">Laptop</h3>
              <p className="text-sm mb-3">Up to 30% OFF on all models</p>
              <Link to="/?category=laptops">
                <Button variant="secondary" size="sm" className="h-8 text-xs px-3">Shop Now</Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="relative group overflow-hidden rounded-xl shadow-lg flex items-end p-6 bg-gray-300 dark:bg-gray-700 h-[280px]"
            {...sectionFadeIn}
            transition={{ ...sectionFadeIn.transition, delay: 0.5 } as Transition}
          >
            <img
              src={getAssetPath("images/promos/mobile.jpg")} 
              alt="Mobile Phone"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackAssetPath4;
              }}
            />
            <div className="relative z-10 text-white  p-4 rounded-xl bg-black/10 group-hover:bg-black/10 transition-all duration-300 w-full">
              <Badge className="mb-2 bg-cyan-500/80 text-white border-none">35% OFF</Badge> 
              <h3 className="text-xl font-bold mb-2">Mobile</h3> 
              <Link to="/?category=smartphones">
                <Button variant="secondary" size="sm" className="h-8 text-xs px-3">Shop Now</Button>
              </Link>
            </div>
          </motion.div>   
        </div>
      </section>

      {/* --- Category Filter Section --- */}
      <motion.section
        className="container mx-auto px-4 py-8"
        {...sectionFadeIn}
        transition={{ ...sectionFadeIn.transition, delay: 0.1 } as Transition}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Products</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse our collection by category or see what's new.
          </p>
        </div>
        
        {/* Category Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => handleCategoryClick('all')}
            className="rounded-full font-semibold"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => handleCategoryClick(category)}
              className="rounded-full capitalize font-semibold"
            >
              {category.replace('-', ' ')}
            </Button>
          ))}
        </div>
        
        {/* --- View Mode Switcher (Mobile Only) --- */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {selectedCategory === 'all' 
                ? 'All Products' 
                : `Products in ${selectedCategory.replace('-', ' ')}`
            }
          </h3>
          {/* This block will only render if isMobile is true */}
          {isMobile && (
            <div className="flex items-center gap-2">
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
        
      </motion.section>

      {/* --- MODIFIED: Products Section --- */}
      <motion.section
        className="container mx-auto px-4 py-8 md:pt-0 md:pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 } as Transition}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory + currentViewMode} // Use currentViewMode in key
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
            ) : products.length > 0 ? (
              <>
                <motion.div 
                  className={cn(
                    "grid gap-4", // Base gap
                    currentViewMode === 'list'
                      ? "grid-cols-1" // List view (mobile only)
                      : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6" // Grid view
                  )}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {products.map((product, i) => (
                    <ProductCard 
                      key={`${product.source}-${product.id}-${i}`} 
                      product={product} 
                      viewMode={currentViewMode} // Pass the dynamic currentViewMode
                      index={i} 
                    />
                  ))}
                </motion.div>

                {/* --- Load More Button (Only on mobile) --- */}
                {isMobile && (
                  <div className="mt-12 text-center">
                    {!isLoadingMore && hasMore && (
                      <Button onClick={handleLoadMore} size="lg" variant="outline" className="w-full sm:w-auto">
                        Load More Products
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
              // No products found message
              <div className="text-center text-muted-foreground pt-16 text-lg">
                {selectedCategory === 'home-appliances' ? (
                    <div className="flex flex-col items-center gap-4">
                      <span className="text-4xl">⏳</span>
                      <p className="text-xl font-semibold text-foreground">Coming Soon!</p>
                      <p>Our Home Appliances section is under construction. Check back soon!</p>
                    </div>
                  ) : (
                    `No products found in "${selectedCategory.replace('-', ' ')}".`
                  )
                }
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* Weekly Offers Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            className="relative group overflow-hidden rounded-xl shadow-lg min-h-[600px] flex items-center justify-start p-8 bg-gray-500 dark:bg-gray-800"
            {...sectionFadeIn}
            transition={{ ...sectionFadeIn.transition, delay: 0.1 } as Transition}
          >
            <img
              src={getAssetPath("images/offers/men.jpg")}
              alt="Men's Sale"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackAssetPath;
              }}
            />
            <div className="relative z-10 text-white">
              <Badge className="mb-2 bg-white/20 text-white border-none">Weekend Sale</Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Men's Fashion</h3>
              <p className="text-lg mb-4 font-semibold">Flat 70% OFF</p>
              <Link to="/?category=mens-clothing">
                <Button className='bg-yellow-400' size="lg">
                  Shop Now
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="relative group overflow-hidden rounded-xl shadow-lg min-h-[600px] flex items-center justify-start p-8 bg-pink-200 dark:bg-pink-900/50"
            {...sectionFadeIn}
            transition={{ ...sectionFadeIn.transition, delay: 0.2 } as Transition}
          >
            <img
              src={getAssetPath("images/offers/women.jpg")}
              alt="Women's Sale"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackAssetPath2;
              }}
            />
            <div className="relative z-10 text-gray-800 dark:text-white ">
              <Badge className="mb-2 bg-pink-600 text-white border-none">Fashion Style</Badge>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Women's Wear</h3>
              <p className="text-lg mb-4 font-semibold text-white">Min. 35–70% OFF</p>
              <Link to="/?category=womens-clothing">
                <Button variant="default" className="bg-pink-600 hover:bg-pink-700 text-white">
                  Shop Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories Section (Grid) */}
      <motion.section
        className="container mx-auto px-4 py-12 md:py-16"
        {...sectionFadeIn}
        transition={{ ...sectionFadeIn.transition, delay: 0.3 } as Transition}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Categories</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our wide range of product categories to find exactly what you're looking for
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {featuredCategories.map((cat, index) => (
            <Link key={cat.name} to={cat.link}>
              <motion.div
                className="text-center group"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 15,
                  delay: index * 0.1 
                } as Transition}
              >
                <div className="aspect-square bg-muted rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-lg transition-all duration-300 border">
                  <img 
                    src={cat.img} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = fallbackAssetPath;
                    }}
                  />
                </div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors capitalize">
                  {cat.name.replace('-', ' ')}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Recently Viewed Section */}
      <RecentlyViewed />

      {/* Comparison Bar */}
      <AnimatePresence>
        {productsToCompare.length > 0 && (
          <motion.div 
            initial={{ y: "100%", opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: "100%", opacity: 0 }} 
            transition={{ type: "spring", stiffness: 200, damping: 25 } as Transition} 
            className={cn("fixed bottom-0 left-0 right-0 z-40 bg-card border-t shadow-2xl")}
          >
            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide flex-1 min-w-0">
                <Scale className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-semibold text-sm flex-shrink-0">
                  Compare ({productsToCompare.length}/4)
                </span>
                <div className="flex space-x-2">
                  {productsToCompare.map((product: Product) => (
                    <Badge 
                      key={`${product.source}-${product.id}`} 
                      className="bg-primary/10 text-primary flex items-center gap-1 py-1 px-2 rounded-full"
                    >
                      <span className="text-xs truncate max-w-[80px]">
                        {product.title}
                      </span>
                      <button 
                        onClick={() => removeProduct(product.id)} 
                        className="ml-1 p-0.5 rounded-full hover:bg-primary/20 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={clearComparison}>
                  Clear All
                </Button>
                <Link to={`/compare?ids=${productsToCompare.map((p: Product) => `${p.source}-${p.id}`).join(',')}`}>
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