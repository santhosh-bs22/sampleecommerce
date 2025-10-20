// src/types/index.ts

// Keep existing interfaces like Product, CartItem, Order, ThemeState, etc.
export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    brand: string;
    category: string;
    thumbnail: string;
    images: string[];
    tags?: string[];
    features?: string[];
    sizes?: string[];
    specifications: {
      [key: string]: string | number | undefined;
    };
    source: 'dummyjson' | 'platzi' | 'mock';
  }

export interface CartItem {
  product: Product;
  quantity: number;
}

// Define Tracking Event structure
export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface Order {
  id: number;
  userId: number; // Added userId
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed'; // Added 'processing'
  createdAt: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  // --- New Tracking Fields ---
  trackingNumber?: string; // Optional tracking number
  estimatedDelivery?: string; // Optional estimated delivery date
  trackingHistory?: TrackingEvent[]; // Array of tracking events
}


export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: 'credit-card' | 'debit-card' | 'upi' | 'cod';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  upiId?: string;
}

export interface ComparisonState {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: number) => void;
  clearComparison: () => void;
  isInComparison: (productId: number) => boolean;
}

// NEW: Recently Viewed State Interface
export interface RecentlyViewedState {
  items: Product[];
  addItem: (product: Product) => void;
  clearItems: () => void;
}

// --- Add Admin Role ---
export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  image: string;
  role?: 'customer' | 'admin'; // Add role
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean; // Add isAdmin flag for quick checks
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}