// src/pages/Home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom'; // Import useSearchParams and useNavigate

import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
// Removed Tabs imports
import {
  Scale,
  Minus,
  Truck,
  ShieldCheck,
  BadgeDollarSign,
  MessageSquare,
  PackagePlus,
  X,
  Star,
} from 'lucide-react';
import { Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchProducts } from '../api/productApi'; // Keep this
import { categories } from '../mockData'; // Import categories
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

// Removed TabProducts types

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

// ** FINAL FIX: Explicitly join base path with asset path **
// This uses the hardcoded base path '/ecommerce/' defined in your vite.config.ts
// for deployments that struggle with automatic asset resolution.
const ASSET_BASE_PATH = '/EcomX-website/'; // Your configured base path
const getAssetPath = (path: string) => {
    // 1. Start with the base path
    let url = ASSET_BASE_PATH;
    // 2. Add the asset path, ensuring no double slashes
    if (path.startsWith('/')) {
        url += path.substring(1);
    } else {
        url += path;
    }
    return url;
};

// Hero Slide Data using explicit base path utility
const heroSlides = [
  {
    id: 1,
    bgImageUrl: getAssetPath("images/hero/hero-bg-1.jpg"), 
    altText: "Hero Background 1"
  },
  {
    id: 2,
    bgImageUrl: getAssetPath("images/hero/hero-bg-2.jpg"), 
    altText: "Hero Background 2"
  },
  {
    id: 3,
    bgImageUrl: getAssetPath("images/hero/hero-bg-3.jpg"), 
    altText: "Hero Background 3"
  },
  {
    id: 4,
    bgImageUrl: getAssetPath("images/hero/hero-bg-4.jpg"), 
    altText: "Hero Background 4"
  },
  {
    id: 5,
    bgImageUrl: getAssetPath("images/hero/hero-bg-5.jpg"), 
    altText: "Hero Background 5"
  }
];

// Category data for featured categories section
const featuredCategories = [
  { name: "Mobile", img: getAssetPath("images/categories/Mobile.jpg"), link: "/?category=smartphones" },
  { name: "home appliances", img: getAssetPath("images/categories/home appliances.jpg"), link: "/?category=home-appliances" }, // Corrected link
  { name: "Women's Wear", img: getAssetPath("images/categories/women.jpg"), link: "/?category=womens-clothing" }, // Corrected link
  { name: "Men's Wear", img: getAssetPath("images/categories/men.jpg"), link: "/?category=mens-clothing" },
  { name: "Accessories", img: getAssetPath("images/categories/Accessories.jpg"), link: "/?category=accessories" },
  { name: "Laptops", img: getAssetPath("images/categories/laptop.jpg"), link: "/?category=laptops" },
];

const Home: React.FC = () => {
  // Comparison Bar State
  const { products: productsToCompare, removeProduct, clearComparison } = useComparisonStore();

  // --- NEW: State for main product list ---
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedCategory = searchParams.get('category') || 'all';
  const searchTerm = searchParams.get('q') || '';

  // --- NEW: Fetch products based on URL params ---
  const loadProducts = useCallback(async (category: string, term: string) => {
    setIsLoading(true);
    
    // --- SPECIAL CHECK FOR HOME APPLIANCES ---
    // If this category is selected, don't fetch, just set loading to false and products to empty.
    if (category === 'home-appliances' && !term) {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    // --- END SPECIAL CHECK ---

    try {
      const filters = {
        category: category === 'all' ? undefined : category,
        searchTerm: term || undefined,
        sortBy: 'popular' as const
      };
      // Fetch a larger list for the main page
      const data = await fetchProducts(0, 20, filters); 
      setProducts(data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]); // Clear products on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- NEW: useEffect to trigger fetch ---
  useEffect(() => {
    // Scroll to top when category or search changes
    window.scrollTo(0, 0);
    loadProducts(selectedCategory, searchTerm);
  }, [selectedCategory, searchTerm, loadProducts]);

  // --- NEW: Handler for category buttons ---
  const handleCategoryClick = (category: string) => {
    // Keep the existing search term when changing category
    setSearchParams(params => {
      params.set('category', category);
      if (searchTerm) {
        params.set('q', searchTerm);
      } else {
        params.delete('q');
      }
      return params;
    });
  };
  
  // Define fallback image paths using the utility
  const fallbackAssetPath = getAssetPath("images/hero/hero-bg-1");
  const fallbackAssetPath2 = getAssetPath("images/hero/hero-bg-2");
  const fallbackAssetPath3 = getAssetPath("images/hero/hero-bg-3");
  const fallbackAssetPath4 = getAssetPath("images/hero/hero-bg-4");


  return (
    <>
      {/* Enhanced Swiper Hero Banner (No changes) */}
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

      {/* Service Highlights Bar (No changes) */}
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

      {/* Category Promo Section (No changes) */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-auto"> 
          <motion.div
            className="md:col-span-1 lg:col-span-1 md:row-span-2 relative group overflow-hidden rounded-xl shadow-lg flex items-end p-6 bg-gray-200 dark:bg-gray-800 h-[500px] md:h-full"
            {...sectionFadeIn}
            transition={{ ...sectionFadeIn.transition, delay: 0.1 } as Transition}
          >
            <img
              src={getAssetPath("images/promos/women.jpg ")}
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

      {/* --- NEW: Category Filter Section --- */}
      <motion.section
        className="container mx-auto px-4 py-8"
        {...sectionFadeIn}
        transition={{ ...sectionFadeIn.transition, delay: 0.1 } as Transition}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Products</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {searchTerm 
              ? `Showing results for "${searchTerm}"`
              : 'Browse our collection by category or see what\'s new.'
            }
          </p>
        </div>
        
        {/* Category Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
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
      </motion.section>

      {/* --- MODIFIED: Products Section (Replaces Featured Products Tabs) --- */}
      <motion.section
        className="container mx-auto px-4 py-8 md:pt-0 md:pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 } as Transition}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory + searchTerm} // Re-animate when category or search changes
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.3 } as Transition} 
            className="min-h-[400px]" // Set a min-height to avoid layout jump
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-[400px]">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {products.map((product, i) => (
                  <ProductCard 
                    key={`${product.source}-${product.id}-${i}`} 
                    product={product} 
                    viewMode="grid" 
                    index={i} // Pass index for stagger animation
                  />
                ))}
              </motion.div>
            ) : (
              // --- THIS IS THE MODIFIED BLOCK ---
              <div className="text-center text-muted-foreground pt-16 text-lg">
                {(() => {
                  if (searchTerm) {
                    // Case 1: A search is active
                    return `No products found for "${searchTerm}"`;
                  
                  } else if (selectedCategory === 'home-appliances') {
                    // Case 2: "home-appliances" is selected, no search
                    return (
                      <div className="flex flex-col items-center gap-4">
                        <span className="text-4xl">⏳</span>
                        <p className="text-xl font-semibold text-foreground">Coming Soon!</p>
                        <p>Our Home Appliances section is under construction. Check back soon!</p>
                      </div>
                    );
                  
                  } else {
                    // Case 3: Any other category is selected, no search
                    return `No products found in "${selectedCategory.replace('-', ' ')}".`;
                  }
                })()}
              </div>
              // --- END MODIFIED BLOCK ---
            )}
          </motion.div>
        </AnimatePresence>
      </motion.section>


      {/* Weekly Offers Section (No changes) */}
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

      {/* Featured Categories Section (Grid) (No changes) */}
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

      {/* Recently Viewed Section (No changes) */}
      <RecentlyViewed />

      {/* Comparison Bar (No changes) */}
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