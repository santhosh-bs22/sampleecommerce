// src/components/RecentlyViewed.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useRecentlyViewedStore } from '../store/useRecentlyViewedStore';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react'; // Example icon

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1, // Start staggering after a small delay
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const RecentlyViewed: React.FC = () => {
  const { items } = useRecentlyViewedStore();

  if (items.length === 0) {
    return null; // Don't render anything if there are no items
  }

  return (
    <section className="mt-16 pt-10 border-t">
      <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <Eye className="h-7 w-7 text-primary" />
        Recently Viewed
      </h2>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible" // Animate when section scrolls into view
        viewport={{ once: true, amount: 0.2 }} // Trigger animation once when 20% is visible
      >
        {items.map((product, index) => (
          <motion.div key={`${product.source}-${product.id}`} variants={itemVariants}>
            {/* Using ProductCard in grid mode */}
            <ProductCard
              product={product}
              viewMode="grid"
              className="h-full hover:shadow-lg" // Ensure card takes full height
              // index={index} // Pass index if ProductCard animation needs it
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default RecentlyViewed;