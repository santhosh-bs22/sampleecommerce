// src/components/Header.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ShoppingCart, Heart, User, LogOut, Moon, Sun, Search, Package, X, Phone, Mail, Globe, DollarSign, ChevronDown, Menu
} from 'lucide-react'; // Keep icons, some might be unused now but okay

// 1. IMPORT THE LOGO IMAGE
// If you don't have a declaration for image modules, ignore TS error for this import
// @ts-ignore: Cannot find module '../assets/logo.png' or its corresponding type declarations.
import EcomxLogo from '../assets/logo.png'; 

import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import MiniCart from './MiniCart';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useUserStore } from '../store/useUserStore';
import { useThemeStore } from '../store/useThemeStore';
import { fetchSearchSuggestions } from '../api/productApi';
import SearchSuggestions from './SearchSuggestions';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Input } from './ui/input';

interface Suggestion {
  id: string;
  title: string;
}

// Debounce function
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
      const inputHasFocus = document.activeElement === searchInputRef.current;
      if (term.trim().length < 2) {
        setSuggestions([]);
        setIsSuggestionsLoading(false);
        setShowSuggestions(inputHasFocus);
        return;
      }
      setIsSuggestionsLoading(true);
      if (inputHasFocus) setShowSuggestions(true);
      try {
        const results = await fetchSearchSuggestions(term);
        const stillHasFocus = document.activeElement === searchInputRef.current;
        setSuggestions(results);
        setShowSuggestions(results.length > 0 || (stillHasFocus && term.trim().length >= 2));
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetchSuggestions(headerSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowSuggestions(false);
    setIsSearchOpen(false);
    const trimmedTerm = headerSearchTerm.trim();
    if (trimmedTerm) {
      navigate(`/?q=${encodeURIComponent(trimmedTerm)}`);
    } else {
      navigate('/');
    }
    searchInputRef.current?.blur();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = event.target.value;
    setHeaderSearchTerm(newTerm);
    if (newTerm.trim().length >= 2 && document.activeElement === searchInputRef.current) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (title: string) => {
    setHeaderSearchTerm(title);
    setShowSuggestions(false);
    setIsSearchOpen(false);
    navigate(`/?q=${encodeURIComponent(title)}`);
    searchInputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (headerSearchTerm.trim().length >= 2) {
      setShowSuggestions(true);
      debouncedFetchSuggestions(headerSearchTerm);
    }
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  return (
    <header ref={searchContainerRef} className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">

      {/* Top Bar Removed */}

      {/* Main Navbar */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
           <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            {/* 2. CUSTOM LOGO IMAGE REPLACEMENT */}
            <img src={EcomxLogo} alt="EcomX Logo" className="h-8 w-8" />
            <span className="text-xl font-bold hidden sm:inline">EcomX</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center hover:text-primary transition-colors focus-visible:ring-0 focus-visible:outline-none">Pages <ChevronDown className="h-4 w-4 ml-1" /></DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem asChild><Link to="/about">About Us</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/contact">Contact Us</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/faq">FAQ</Link></DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <Link to="/elements" className="hover:text-primary transition-colors">Elements</Link>
            <Link to="/buy" className="hover:text-primary transition-colors">Buy</Link>
          </nav>

          {/* Actions: Search, Wishlist, Cart, Theme, User, Mobile Menu */}
          <div className="flex items-center space-x-1 sm:space-x-2">
             <Button variant="ghost" size="icon" onClick={toggleSearch} className="relative flex-shrink-0 h-9 w-9" aria-label="Search"><Search className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" asChild className="relative flex-shrink-0 h-9 w-9"><Link to="/wishlist" aria-label={`Wishlist items: ${wishlistItemsCount}`}><Heart className="h-5 w-5" />{wishlistItemsCount > 0 && (<Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">{wishlistItemsCount}</Badge>)}</Link></Button>
            <Popover open={isMiniCartOpen} onOpenChange={setIsMiniCartOpen}>
              <PopoverTrigger asChild><Button variant="ghost" size="icon" className="relative flex-shrink-0 h-9 w-9" aria-label={`Cart items: ${cartItemsCount}`}><ShoppingCart className="h-5 w-5" />{cartItemsCount > 0 && (<Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">{cartItemsCount}</Badge>)}</Button></PopoverTrigger>
              <PopoverContent className="w-80 p-0 mr-4 mt-2" align="end"><MiniCart onClose={() => setIsMiniCartOpen(false)} /></PopoverContent>
            </Popover>
             <div className="hidden md:flex">
                 {isAuthenticated && user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="relative flex-shrink-0 h-9 w-9" aria-label="User Menu"><User className="h-5 w-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end"><DropdownMenuItem asChild><Link to="/profile">My Profile</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/orders">My Orders</Link></DropdownMenuItem><DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem></DropdownMenuContent>
                    </DropdownMenu>
                 ) : (<Link to="/login"><Button variant="ghost" size="icon" className="relative flex-shrink-0 h-9 w-9" aria-label="Login"><User className="h-5 w-5" /></Button></Link>)}
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative flex-shrink-0 h-9 w-9" aria-label={isDark ? "Activate light mode" : "Activate dark mode"}>
              <AnimatePresence mode="wait" initial={false}>{isDark ? (<motion.div key="sun" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }}> <Sun className="h-5 w-5" /> </motion.div>) : (<motion.div key="moon" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }}> <Moon className="h-5 w-5" /> </motion.div>)}</AnimatePresence>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="lg:hidden relative flex-shrink-0 h-9 w-9" aria-label="Toggle Menu"><Menu className="h-5 w-5" /></Button>
          </div>
        </div>
      </div>

       {/* Mobile Search Input Area */}
        <AnimatePresence>
            {isSearchOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="absolute top-full left-0 right-0 bg-background border-b shadow-md z-40 lg:hidden px-4 pb-3 pt-1" style={{ overflow: 'hidden' }}>
                    <form onSubmit={handleSearchSubmit} className="w-full" role="search">
                        <div className="relative w-full">
                            <label htmlFor="mobile-search" className="sr-only">Search Products</label>
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                            <Input id="mobile-search" ref={searchInputRef} type="search" placeholder="Search products..." value={headerSearchTerm} onChange={handleInputChange} onFocus={handleInputFocus} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-input focus:bg-background" aria-label="Search products" autoComplete="off" aria-haspopup="listbox" aria-expanded={showSuggestions} aria-controls="search-suggestions-mobile"/>
                        </div>
                    </form>
                    <div id="search-suggestions-mobile" className="relative">
                        {showSuggestions && (<SearchSuggestions suggestions={suggestions} isLoading={isSuggestionsLoading} onSuggestionSelect={handleSuggestionSelect} className="w-full left-0 right-0 max-h-48"/>)}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="lg:hidden absolute top-full left-0 right-0 bg-background border-b shadow-lg z-40">
            <nav className="flex flex-col space-y-2 p-4">
              <Link to="/" className="block py-2 hover:text-primary" onClick={toggleMobileMenu}>Home</Link>
              <Link to="/products" className="block py-2 hover:text-primary" onClick={toggleMobileMenu}>Shop</Link>
              <Link to="/blog" className="block py-2 hover:text-primary" onClick={toggleMobileMenu}>Blog</Link>
              <Link to="/about" className="block py-2 hover:text-primary" onClick={toggleMobileMenu}>About</Link>
              <Link to="/contact" className="block py-2 hover:text-primary" onClick={toggleMobileMenu}>Contact</Link>
              {/* Add more links based on your 'Pages', 'Elements', 'Buy' structure */}
              <hr className="my-2"/>
               {isAuthenticated && user ? (<><Link to="/profile" className="block py-2 hover:text-primary" onClick={toggleMobileMenu}>My Profile</Link><Link to="/orders" className="block py-2 hover:text-primary" onClick={toggleMobileMenu}>My Orders</Link><Button variant="ghost" onClick={() => { handleLogout(); toggleMobileMenu(); }} className="justify-start py-2 text-red-500 hover:text-red-600">Logout</Button></>) : (<><Link to="/login" className="block py-2 hover:text-primary" onClick={toggleMobileMenu}>Login</Link><Link to="/register" className="block py-2 hover:text-primary" onClick={toggleMobileMenu}>Register</Link></>)}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;