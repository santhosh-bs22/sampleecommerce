import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, Variants } from 'framer-motion'; // Keep using Framer Motion
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
      // Use numeric cubic-bezier arrays for typing instead of string names
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20, // Exit upwards
    scale: 0.98, // Shrink slightly on exit
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    // Use AnimatePresence for exit animations
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Wrap each Route's element in PageWrapper */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/products" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
        <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
        <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
        <Route path="/orders" element={<PageWrapper><Orders /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="*" element={
          <PageWrapper>
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
              <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
              <a href="/" className="text-primary hover:underline">Return to Home</a>
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
    className="min-h-[calc(100vh-theme(space.16)-theme(space.1))] overflow-x-hidden" // Adjust min-height if header/footer size changes
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
    <div className="min-h-screen bg-background text-foreground font-sans"> {/* Added font-sans */}
      <Router basename="/sampleecommerce">
        <Header />
        <main className="pt-4 pb-16"> {/* Add some padding */}
          <AnimatedRoutes />
        </main>
        <Footer />
        <Toaster />
      </Router>
    </div>
  );
}

export default App;