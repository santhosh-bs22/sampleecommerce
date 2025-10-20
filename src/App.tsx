// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Toaster } from './components/ui/toaster';
import { useThemeStore } from './store/useThemeStore';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
// Corrected: Ensure this file exists at src/pages/OrderDetails.tsx
import OrderDetails from './pages/OrderDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Compare from './pages/Compare';
import Profile from './pages/Profile';
// --- Admin Imports ---
// Corrected: Ensure this file exists at src/components/admin/AdminLayout.tsx
import AdminLayout from './components/admin/AdminLayout';
// Corrected: Ensure these files exist in src/pages/admin/
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
// --- End Admin Imports ---
import './App.css';

// Enhanced Page Transition Variants
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20, // Start slightly lower
    scale: 0.98, // Start slightly smaller
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4, // Slightly longer transition
      ease: [0.22, 1, 0.36, 1], // easeOutExpo
    },
  },
  exit: {
    opacity: 0,
    y: -20, // Exit upwards
    scale: 0.98, // Shrink slightly on exit
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1], // easeInQuad
    },
  },
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    // Use AnimatePresence for exit animations
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* --- Public Routes --- */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/products" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
        <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/compare" element={<PageWrapper><Compare /></PageWrapper>} />

        {/* --- Protected User Routes --- */}
        <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
        <Route path="/orders" element={<PageWrapper><Orders /></PageWrapper>} />
        <Route path="/order/:orderId" element={<PageWrapper><OrderDetails /></PageWrapper>} /> {/* OrderDetails route */}
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />

        {/* --- Admin Routes (Protected by AdminLayout) --- */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} /> {/* Default admin page */}
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          {/* Add future admin routes here */}
          {/* <Route path="users" element={<AdminUsers />} /> */}
          {/* <Route path="settings" element={<AdminSettings />} /> */}
        </Route>

        {/* --- Not Found Route --- */}
        <Route path="*" element={
          <PageWrapper>
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
              <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
              <Link to="/" className="text-primary hover:underline">Return to Home</Link>
            </div>
          </PageWrapper>
        } />
      </Routes>
    </AnimatePresence>
  );
};

// Wrapper component applies motion.div to children
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    className="min-h-[calc(100vh-theme(space.16)-theme(space.1))] overflow-x-hidden"
  >
    {children}
  </motion.div>
);


function App() {
  const { isDark } = useThemeStore();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Router basename="/sampleecommerce">
        <Header />
        <main className="pt-4 pb-16">
          <AnimatedRoutes />
        </main>
        <Footer />
        <Toaster />
      </Router>
    </div>
  );
}

export default App;