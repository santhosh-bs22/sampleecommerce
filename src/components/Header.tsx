// src/components/Header.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ShoppingCart, Heart, User, LogOut, Moon, Sun, Search, Package, X // X is no longer used for clear button
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useUserStore } from '../store/useUserStore';
import { useThemeStore } from '../store/useThemeStore';
import { fetchSearchSuggestions } from '../api/productApi';
import SearchSuggestions from './SearchSuggestions';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface Suggestion {
  id: string;
  title: string;
}

const Header: React.FC = () => {
  const { getTotalItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user, isAuthenticated, logout } = useUserStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySearchTerm = searchParams.get('q') || '';

  const [headerSearchTerm, setHeaderSearchTerm] = useState(querySearchTerm);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);


  const cartItemsCount = getTotalItems();
  const wishlistItemsCount = wishlistItems.length;

   useEffect(() => {
    if (querySearchTerm !== headerSearchTerm) {
        setHeaderSearchTerm(querySearchTerm);
    }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [querySearchTerm]);

  const debouncedFetchSuggestions = useCallback(
    debounce(async (term: string) => {
      const currentInput = document.activeElement;
      const inputHasFocus = currentInput === desktopInputRef.current || currentInput === mobileInputRef.current;

      if (term.trim().length < 2) {
        setSuggestions([]);
        setIsSuggestionsLoading(false);
        setShowSuggestions(inputHasFocus);
        return;
      }

      setIsSuggestionsLoading(true);
      if (!showSuggestions) setShowSuggestions(true);

      try {
        const results = await fetchSearchSuggestions(term);
        setSuggestions(results);
        setShowSuggestions(results.length > 0 || (inputHasFocus && term.trim().length >= 2)); // Adjusted logic
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSuggestionsLoading(false);
        // Re-check focus after async operation
        const stillHasFocus = document.activeElement === desktopInputRef.current || document.activeElement === mobileInputRef.current;
        if (suggestions.length === 0 && !stillHasFocus) {
             setShowSuggestions(false);
        }
      }
    }, 300),
    [showSuggestions, suggestions.length] // Keep limited dependencies
  );


  useEffect(() => {
    debouncedFetchSuggestions(headerSearchTerm);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerSearchTerm]);

   useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
       if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
         setShowSuggestions(false);
       }
     };
     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);


  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowSuggestions(false);
    const trimmedTerm = headerSearchTerm.trim();
    if (trimmedTerm) {
      navigate(`/?q=${encodeURIComponent(trimmedTerm)}`);
      desktopInputRef.current?.blur();
      mobileInputRef.current?.blur();
    } else {
      navigate('/');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newTerm = event.target.value;
      setHeaderSearchTerm(newTerm);
  };

  const handleSuggestionSelect = (title: string) => {
    setHeaderSearchTerm(title);
    setShowSuggestions(false);
    (desktopInputRef.current || mobileInputRef.current)?.focus();
  };

   const handleInputFocus = () => {
     if (headerSearchTerm.trim().length >= 2 && (suggestions.length > 0 || isSuggestionsLoading)) {
        setShowSuggestions(true);
     }
   }

   // No longer needed as the button is removed
   // const handleClearSearch = () => { ... }

  return (
    <header ref={searchContainerRef} className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold hidden sm:inline">EcomX</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary"> Home </Link>
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary"> All Products </Link>
          </nav>

          {/* Search Bar with Suggestions */}
          {/* Main Search for Larger Screens */}
          <div className="relative flex-1 max-w-xl mx-auto lg:mx-4 hidden lg:block">
            <form onSubmit={handleSearchSubmit} className="w-full" role="search">
              <div className="relative w-full">
                <label htmlFor="desktop-search" className="sr-only">Search Products</label>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <input
                  id="desktop-search"
                  ref={desktopInputRef}
                  type="search"
                  placeholder="Search products..."
                  value={headerSearchTerm}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  // Adjusted padding: removed pr-10, added standard pr-4
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-background focus:bg-background"
                  aria-label="Search products"
                  autoComplete="off"
                  aria-haspopup="listbox"
                  aria-expanded={showSuggestions}
                  aria-controls="search-suggestions-desktop"
                />
                 {/* --- X BUTTON REMOVED --- */}
                 {/* {headerSearchTerm && (
                  <Button type="button" variant="ghost" size="icon" onClick={handleClearSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground z-10" aria-label="Clear search"> <X className="h-4 w-4" /> </Button>
                 )} */}
              </div>
            </form>
            {/* Suggestions List for Desktop */}
            <div id="search-suggestions-desktop">
                {showSuggestions && (
                <SearchSuggestions
                    suggestions={suggestions}
                    isLoading={isSuggestionsLoading}
                    onSuggestionSelect={handleSuggestionSelect}
                />
                )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
             {/* Theme Toggle */}
             <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative flex-shrink-0" aria-label={isDark ? "Activate light mode" : "Activate dark mode"}>
                 <AnimatePresence mode="wait" initial={false}>
                     {isDark ? (
                         <motion.div key="sun" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }}> <Sun className="h-5 w-5" /> </motion.div>
                     ) : (
                         <motion.div key="moon" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }}> <Moon className="h-5 w-5" /> </motion.div>
                     )}
                 </AnimatePresence>
             </Button>
             {/* Wishlist */}
             <Button variant="ghost" size="icon" asChild className="relative flex-shrink-0"><Link to="/wishlist" aria-label={`Wishlist items: ${wishlistItemsCount}`}><Heart className="h-5 w-5" />{wishlistItemsCount > 0 && (<Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs" aria-hidden="true">{wishlistItemsCount}</Badge>)}</Link></Button>
             {/* Cart */}
             <Button variant="ghost" size="icon" asChild className="relative flex-shrink-0"><Link to="/cart" aria-label={`Cart items: ${cartItemsCount}`}><ShoppingCart className="h-5 w-5" />{cartItemsCount > 0 && (<Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs" aria-hidden="true">{cartItemsCount}</Badge>)}</Link></Button>
             {/* User Auth */}
             {isAuthenticated && user ? (<div className="flex items-center flex-shrink-0"><Link to="/profile" className="hidden sm:inline-flex"><Button variant="ghost" size="sm" className="px-2"><User className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden md:inline">Hi, {user.firstName}</span></Button></Link><span className="hidden sm:inline text-muted-foreground mx-1">|</span><Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="h-9 w-9"><LogOut className="h-4 w-4" /></Button></div>) : (<div className="hidden sm:flex items-center space-x-2 flex-shrink-0"><Link to="/login"><Button variant="ghost" size="sm"> Login </Button></Link><Link to="/register"><Button size="sm"> Sign Up </Button></Link></div>)}
          </div>
        </div>
        {/* Search Bar for smaller screens */}
        <div className="lg:hidden w-full pt-2 pb-3 relative"> {/* Removed ref here as outer header has it */}
             <form onSubmit={handleSearchSubmit} className="w-full" role="search">
                <div className="relative w-full">
                    <label htmlFor="mobile-search" className="sr-only">Search Products</label>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                    <input
                        id="mobile-search"
                        ref={mobileInputRef}
                        type="search"
                        placeholder="Search products..."
                        value={headerSearchTerm}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                         // Adjusted padding: removed pr-10, added standard pr-4
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-background focus:bg-background"
                        aria-label="Search products"
                        autoComplete="off"
                        aria-haspopup="listbox"
                        aria-expanded={showSuggestions}
                        aria-controls="search-suggestions-mobile"
                    />
                    {/* --- X BUTTON REMOVED --- */}
                    {/* {headerSearchTerm && (
                    <Button type="button" variant="ghost" size="icon" onClick={handleClearSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground z-10" aria-label="Clear search"> <X className="h-4 w-4" /> </Button>
                    )} */}
                </div>
             </form>
             {/* Suggestions List for Mobile */}
             <div id="search-suggestions-mobile">
                {showSuggestions && (
                    <SearchSuggestions
                        suggestions={suggestions}
                        isLoading={isSuggestionsLoading}
                        onSuggestionSelect={handleSuggestionSelect}
                        className="w-full left-0 right-0" // Use w-full for relative positioning
                    />
                )}
             </div>
         </div>
      </div>
    </header>
  );
};

// Simple debounce function (keep outside component)
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return function(this: ThisParameterType<F>, ...args: Parameters<F>) {
    const context = this;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

export default Header;