import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
import Login from './pages/Login';
import Register from './pages/Register';
// Removed SocialProof and Chatbot imports
import './App.css';

// Component to handle smooth page transitions
const AnimatedRoutes = () => {
  const location = useLocation();

  const pageTransition = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper element={<Home />} pageTransition={pageTransition} />} />
        <Route path="/products" element={<PageWrapper element={<Home />} pageTransition={pageTransition} />} />
        <Route path="/product/:id" element={<PageWrapper element={<ProductDetails />} pageTransition={pageTransition} />} />
        <Route path="/cart" element={<PageWrapper element={<Cart />} pageTransition={pageTransition} />} />
        <Route path="/checkout" element={<PageWrapper element={<Checkout />} pageTransition={pageTransition} />} />
        <Route path="/wishlist" element={<PageWrapper element={<Wishlist />} pageTransition={pageTransition} />} />
        <Route path="/orders" element={<PageWrapper element={<Orders />} pageTransition={pageTransition} />} />
        <Route path="/login" element={<PageWrapper element={<Login />} pageTransition={pageTransition} />} />
        <Route path="/register" element={<PageWrapper element={<Register />} pageTransition={pageTransition} />} />
        <Route path="*" element={
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
            <a href="/" className="text-primary hover:underline">Return to Home</a>
          </div>
        } />
      </Routes>
    </AnimatePresence>
  );
};

// Wrapper component for motion integration
const PageWrapper = ({ element, pageTransition }: { element: JSX.Element, pageTransition: any }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageTransition}
    transition={{ duration: 0.3 }}
    className="min-h-screen" // Ensures it takes up space for smooth transition
  >
    {element}
  </motion.div>
);


function App() {
  const { isDark } = useThemeStore();

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Router basename="/sampleecommerce"> {/* Added basename */}
        <Header />
        <main>
          <AnimatedRoutes />
        </main>
        <Footer />
        <Toaster />
        {/* Removed SocialProof and Chatbot components */}
      </Router>
    </div>
  );
}

export default App;