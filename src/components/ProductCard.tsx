// src/components/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useComparisonStore } from '../store/useComparisonStore';
import { formatCurrency, calculateDiscount } from '../utils/currency';
import { useToast } from '../hooks/use-toast';
import { cn } from '../lib/utils';
import { Scale, Heart, ShoppingCart } from 'lucide-react'; // Added Heart, ShoppingCart
import { motion, Variants } from 'framer-motion'; // Import motion

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  className?: string;
  index?: number; // Optional index for stagger animation
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ // Accept index 'i'
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05, // Stagger delay based on index
      duration: 0.3,
      ease: [0.33, 1, 0.68, 1], // cubic-bezier equivalent of easeOut
    },
  }),
};


const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = 'grid',
  className,
  index = 0 // Default index to 0
}) => {
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addProduct: addToCompare, removeProduct: removeFromCompare, isInComparison } = useComparisonStore();
  const { toast } = useToast();

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInComparison(product.id);
  const discountedPrice = calculateDiscount(product.price, product.discountPercentage);
  const savings = product.price - discountedPrice;
  const productLink = `/product/${product.source}-${product.id}`;

  // Simplified handlers using stopPropagation
   const handleInteraction = (e: React.MouseEvent, action: () => void, successTitle: string, successDesc: string) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    toast({ title: successTitle, description: successDesc });
  };

  const handleAddToCart = (e: React.MouseEvent) => handleInteraction(e, () => addItem(product), "🎉 Added to cart", `${product.title} added.`);
  const handleWishlistToggle = (e: React.MouseEvent) => {
    if (isWishlisted) {
      handleInteraction(e, () => removeFromWishlist(product.id), "❤️ Removed from wishlist", `${product.title} removed.`);
    } else {
      handleInteraction(e, () => addToWishlist(product), "💖 Added to wishlist", `${product.title} added.`);
    }
  };
  const handleCompareToggle = (e: React.MouseEvent) => {
     if (isCompared) {
      handleInteraction(e, () => removeFromCompare(product.id), "➖ Removed from comparison", `${product.title} removed.`);
    } else {
       handleInteraction(e, () => addToCompare(product), "➕ Added to comparison", `${product.title} added.`);
    }
  };

  // Common Card Content (for Grid View)
  const CardInnerContent = () => (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30 group-hover:bg-secondary/50 transition-colors rounded-t-lg"> {/* Aspect Ratio */}
        <motion.img
          src={product.thumbnail}
          alt={product.title}
          className="h-full w-full object-contain transition-transform duration-500" // Kept object-contain
           whileHover={{ scale: 1.05 }} // Image zoom on hover
        />

        {/* Top Badges */}
         <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <Badge variant="secondary" className="bg-green-600 text-white shadow">
              {product.rating.toFixed(1)} ★
            </Badge>
          {product.discountPercentage > 0 && (
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                <Badge variant="destructive" className="shadow">
                  -{Math.round(product.discountPercentage)}%
                </Badge>
              </motion.div>
          )}
        </div>
          {/* Quick Action Buttons - Appear on hover */}
         <div className="absolute bottom-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="secondary" // Changed style
                size="icon"
                onClick={handleWishlistToggle}
                className="h-9 w-9 rounded-full shadow-md backdrop-blur-sm"
              >
               <Heart className={cn("h-4 w-4 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-foreground/70")} />
              </Button>
           </motion.div>
           <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
             <Button
                variant="secondary"
                size="icon"
                onClick={handleCompareToggle}
                className="h-9 w-9 rounded-full shadow-md backdrop-blur-sm"
             >
                <Scale className={cn("h-4 w-4 transition-colors", isCompared ? "text-primary" : "text-foreground/70")} />
             </Button>
            </motion.div>
          </div>

        {/* Stock Info */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-t-lg">
             <Badge variant="destructive" className="text-base py-2 px-4 font-semibold">
               Out of Stock
             </Badge>
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
           <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
             <Badge variant="destructive" className="animate-pulse shadow">
               ⚡ Only {product.stock} left!
             </Badge>
           </div>
        )}
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
          <div className="mb-2"> {/* Reduced margin */}
            <Link to={productLink} className="group/link">
              <h3 className="font-semibold text-base mb-1 line-clamp-2 group-hover/link:text-primary transition-colors leading-tight"> {/* Adjusted font */}
                {product.title}
              </h3>
            </Link>
             <p className="text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed mb-2"> {/* Adjusted font */}
              {product.description}
            </p>
          </div>

          <div className="mt-auto space-y-1"> {/* Reduced spacing */}
             <div className="flex items-baseline gap-2"> {/* Use baseline alignment */}
               <span className="text-lg font-bold text-green-600"> {/* Adjusted font */}
                {formatCurrency(discountedPrice)}
              </span>
              {product.discountPercentage > 0 && (
                 <span className="text-xs text-muted-foreground line-through"> {/* Adjusted font */}
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            {product.discountPercentage > 0 && (
              <div className="flex items-center justify-between text-xs">
                <Badge variant="outline" className="text-green-600 border-green-600/50"> {/* Adjusted style */}
                  Save {formatCurrency(savings)}
                </Badge>
              </div>
            )}
           {/* Brand and Stock (optional based on viewMode) */}
             {viewMode === 'grid' && (
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span className="font-medium capitalize overflow-hidden whitespace-nowrap text-ellipsis max-w-[100px]">
                  {product.brand}
                </span>
                <span className={cn(product.stock === 0 && "text-destructive font-semibold")}>
                  {product.stock > 0 ? `${product.stock} left` : 'Out'}
                </span>
             </div>
             )}
          </div>
      </CardContent>

      {/* Footer differs slightly based on viewMode */}
       <CardFooter className={cn("p-3 pt-0", viewMode === 'list' && 'sm:pl-0 sm:pt-4 sm:border-l sm:ml-4')}>
         <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full h-10 font-semibold text-sm transition-all duration-200"
              size="sm" // Smaller button
            >
             <ShoppingCart className="h-4 w-4 mr-2" />
             {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </motion.div>
      </CardFooter>
    </>
  );

  // Grid View Specific Structure
   if (viewMode === 'grid') {
    return (
       <motion.div
         variants={cardVariants}
         initial="hidden"
         animate="visible"
         whileHover={{ y: -5 }} // Lift effect on hover
         custom={index} // Pass index to variants
         className={cn("h-full", className)}
       >
          <Link to={productLink} className="block h-full">
            <Card className="group overflow-hidden transition-shadow duration-300 hover:shadow-xl border dark:border-muted/50 h-full flex flex-col rounded-lg">
             <CardInnerContent />
            </Card>
          </Link>
        </motion.div>
    );
  }

  // --- NEW List View Specific Structure (matches screenshot) ---
   return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className={cn("w-full", className)} // Ensure it takes full width
    >
      <Card className="group overflow-hidden transition-shadow duration-300 hover:shadow-lg border dark:border-muted/50 flex flex-row relative rounded-lg">
        {/* Image container */}
        <Link to={productLink} className="block w-1/3 flex-shrink-0 aspect-square">
          <div className="relative h-full overflow-hidden bg-secondary/30 rounded-l-lg">
            <motion.img
              src={product.thumbnail}
              alt={product.title}
              className="h-full w-full object-contain"
              whileHover={{ scale: 1.05 }}
            />
            {product.discountPercentage > 0 && (
              <Badge variant="destructive" className="absolute top-2 left-2 shadow text-xs px-1.5 py-0.5">
                -{Math.round(product.discountPercentage)}%
              </Badge>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <Badge variant="destructive" className="absolute bottom-2 left-2 animate-pulse shadow text-xs px-1.5 py-0.5">
                ⚡ Only {product.stock} left!
              </Badge>
            )}
            {product.stock === 0 && (
               <Badge variant="destructive" className="absolute top-2 left-2 shadow text-xs px-1.5 py-0.5">
                 Out of Stock
               </Badge>
            )}
          </div>
        </Link>

        {/* Content container */}
        <div className="flex-1 flex flex-col p-3 min-w-0">
          <Link to={productLink} className="group/link mb-1 pr-12"> {/* Add padding for button */}
            <h3 className="font-semibold text-sm line-clamp-2 group-hover/link:text-primary transition-colors leading-tight">
              {product.title}
            </h3>
          </Link>
          
          <div className="flex items-center gap-1.5 mb-1.5">
            <Badge variant="secondary" className="bg-green-600 text-white shadow text-xs px-1.5 py-0.5 rounded">
              {product.rating.toFixed(1)} ★
            </Badge>
            {/* Mocking rating count */}
            <span className="text-xs text-muted-foreground">({Math.floor(product.rating * 1234) + 50})</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1.5">
            <span className="text-base font-bold text-green-600">
              {formatCurrency(discountedPrice)}
            </span>
            {product.discountPercentage > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Mocking bank/exchange offers from image */}
          {product.discountPercentage > 10 && (
               <p className="text-xs font-medium text-green-700 dark:text-green-500 line-clamp-1">Bank Offer</p>
          )}

          <p className="text-xs text-muted-foreground mt-auto pt-1">
            {product.stock > 0 ? `Delivery by Tomorrow` : <span className="text-destructive font-semibold">Out of Stock</span>}
          </p>
        </div>
        
        {/* Action Buttons (Top Right) */}
        <div className="absolute top-1 right-1 flex flex-col items-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleWishlistToggle}
            className="h-8 w-8 rounded-full"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-5 w-5", isWishlisted ? "fill-red-500 text-red-500" : "text-foreground/60")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCompareToggle}
            className="h-8 w-8 rounded-full"
            aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
          >
            <Scale className={cn("h-5 w-5", isCompared ? "text-primary" : "text-foreground/60")} />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductCard;