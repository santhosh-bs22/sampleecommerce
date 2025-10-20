// src/components/Header.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ShoppingCart, Heart, User, LogOut, Moon, Sun, Search, Package, X // X is no longer used for clear button
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'; // <-- Import Popover components
import MiniCart from './MiniCart'; // <-- Import MiniCart
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
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false); // <-- State for Popover

  const cartItemsCount = getTotalItems();
  const wishlistItemsCount = wishlistItems.length;

   useEffect(() => {
    // Sync local state if URL param changes externally
    if (querySearchTerm !== headerSearchTerm) {
        setHeaderSearchTerm(querySearchTerm);
    }
   // Only run when querySearchTerm changes
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [querySearchTerm]);

  // Debounced fetch suggestions
  const debouncedFetchSuggestions = useCallback(
    debounce(async (term: string) => {
      const currentInput = document.activeElement;
      const inputHasFocus = currentInput === desktopInputRef.current || currentInput === mobileInputRef.current;

      if (term.trim().length < 2) {
        setSuggestions([]);
        setIsSuggestionsLoading(false);
        // Keep suggestions visible only if the input still has focus
        setShowSuggestions(inputHasFocus);
        return;
      }

      setIsSuggestionsLoading(true);
       // Show suggestions immediately if input has focus and meets length requirement
      if (inputHasFocus) setShowSuggestions(true);

      try {
        const results = await fetchSearchSuggestions(term);
         // Check focus *after* the async call completes
         const stillHasFocus = document.activeElement === desktopInputRef.current || document.activeElement === mobileInputRef.current;
        setSuggestions(results);
        // Show if results exist OR if input still focused and term is long enough
         setShowSuggestions(results.length > 0 || (stillHasFocus && term.trim().length >= 2));
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 300),
    [] // No dependency needed here, internal logic handles focus/term length
  );

  useEffect(() => {
    // Fetch suggestions when the search term changes (debounced)
    debouncedFetchSuggestions(headerSearchTerm);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerSearchTerm]); // Only trigger fetch on headerSearchTerm change

   useEffect(() => {
     // Click outside listener to close suggestions
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
    setShowSuggestions(false); // Close suggestions on submit
    const trimmedTerm = headerSearchTerm.trim();
    // Update URL which triggers Home page reload via useEffect
    if (trimmedTerm) {
      navigate(`/?q=${encodeURIComponent(trimmedTerm)}`);
    } else {
      navigate('/'); // Go to home if search is cleared
    }
    // Blur input after search
    desktopInputRef.current?.blur();
    mobileInputRef.current?.blur();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newTerm = event.target.value;
      setHeaderSearchTerm(newTerm); // Update local state immediately
      // Logic to show/hide suggestions based on focus and term length
      if (newTerm.trim().length >= 2 && (document.activeElement === desktopInputRef.current || document.activeElement === mobileInputRef.current)) {
          setShowSuggestions(true);
      } else {
          setShowSuggestions(false);
      }
  };

  const handleSuggestionSelect = (title: string) => {
    setHeaderSearchTerm(title); // Update input field
    setShowSuggestions(false); // Close suggestions
    // Submit search immediately after selecting suggestion by updating URL
    navigate(`/?q=${encodeURIComponent(title)}`);
    // Blur input after selection
    (desktopInputRef.current || mobileInputRef.current)?.blur();
  };

   const handleInputFocus = () => {
     // Show suggestions on focus only if there's already a term and suggestions might exist or are loading
     if (headerSearchTerm.trim().length >= 2) {
       setShowSuggestions(true);
       // Re-trigger fetch if needed to ensure freshness on focus
       debouncedFetchSuggestions(headerSearchTerm);
     }
   }

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
             {/* You can add more links here */}
          </nav>

          {/* Search Bar - Desktop */}
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
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-background focus:bg-background"
                  aria-label="Search products"
                  autoComplete="off"
                  aria-haspopup="listbox"
                  aria-expanded={showSuggestions}
                  aria-controls="search-suggestions-desktop"
                />
              </div>
            </form>
            {/* Suggestions List for Desktop */}
            <div id="search-suggestions-desktop" className="relative"> {/* Added relative for absolute positioning */}
              {showSuggestions && (
                <SearchSuggestions
                  suggestions={suggestions}
                  isLoading={isSuggestionsLoading}
                  onSuggestionSelect={handleSuggestionSelect}
                  // className="absolute" // Already positioned absolutely inside component
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
             {/* Theme Toggle */}
             <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative flex-shrink-0 h-9 w-9" aria-label={isDark ? "Activate light mode" : "Activate dark mode"}>
                <AnimatePresence mode="wait" initial={false}>
                     {isDark ? (
                         <motion.div key="sun" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }}> <Sun className="h-5 w-5" /> </motion.div>
                     ) : (
                         <motion.div key="moon" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }}> <Moon className="h-5 w-5" /> </motion.div>
                     )}
                 </AnimatePresence>
             </Button>
             {/* Wishlist */}
             <Button variant="ghost" size="icon" asChild className="relative flex-shrink-0 h-9 w-9"><Link to="/wishlist" aria-label={`Wishlist items: ${wishlistItemsCount}`}><Heart className="h-5 w-5" />{wishlistItemsCount > 0 && (<Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full" aria-hidden="true">{wishlistItemsCount}</Badge>)}</Link></Button>

             {/* --- Mini Cart Popover Trigger --- */}
             <Popover open={isMiniCartOpen} onOpenChange={setIsMiniCartOpen}>
               <PopoverTrigger asChild>
                 <Button variant="ghost" size="icon" className="relative flex-shrink-0 h-9 w-9" aria-label={`Cart items: ${cartItemsCount}`}>
                   <ShoppingCart className="h-5 w-5" />
                   {cartItemsCount > 0 && (
                     <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full" aria-hidden="true">
                       {cartItemsCount}
                     </Badge>
                   )}
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-80 p-0 mr-4" align="end"> {/* Added mr-4 for spacing, ensured p-0 */}
                 <MiniCart onClose={() => setIsMiniCartOpen(false)} />
               </PopoverContent>
             </Popover>
             {/* --- End Mini Cart Popover --- */}

             {/* User Auth */}
             {isAuthenticated && user ? (<div className="flex items-center flex-shrink-0"><Link to="/profile" className="hidden sm:inline-flex"><Button variant="ghost" size="sm" className="px-2 h-9"><User className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden md:inline">Hi, {user.firstName}</span></Button></Link><span className="hidden sm:inline text-muted-foreground mx-1">|</span><Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="h-9 w-9"><LogOut className="h-4 w-4" /></Button></div>) : (<div className="hidden sm:flex items-center space-x-2 flex-shrink-0"><Link to="/login"><Button variant="ghost" size="sm" className="h-9"> Login </Button></Link><Link to="/register"><Button size="sm" className="h-9"> Sign Up </Button></Link></div>)}
          </div>
        </div>
        {/* Search Bar - Mobile */}
        <div className="lg:hidden w-full pt-2 pb-3 relative">
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
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-background focus:bg-background"
                        aria-label="Search products"
                        autoComplete="off"
                        aria-haspopup="listbox"
                        aria-expanded={showSuggestions}
                        aria-controls="search-suggestions-mobile"
                    />
                </div>
             </form>
             {/* Suggestions List for Mobile */}
             <div id="search-suggestions-mobile" className="relative"> {/* Added relative for absolute positioning */}
                {showSuggestions && (
                    <SearchSuggestions
                        suggestions={suggestions}
                        isLoading={isSuggestionsLoading}
                        onSuggestionSelect={handleSuggestionSelect}
                        className="w-full left-0 right-0" // Use w-full for positioning relative to parent
                    />
                )}
             </div>
         </div>
      </div>
    </header>
  );
};

export default Header;