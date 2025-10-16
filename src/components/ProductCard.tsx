import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useComparisonStore } from '../store/useComparisonStore'; // 👈 Imported
import { formatCurrency, calculateDiscount } from '../utils/currency';
import { useToast } from '../hooks/use-toast';
import { cn } from '../lib/utils';
import { Scale } from 'lucide-react'; // 👈 Imported icon

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode = 'grid',
  className 
}) => {
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addProduct: addToCompare, removeProduct: removeFromCompare, isInComparison } = useComparisonStore(); // 👈 Destructured
  const { toast } = useToast();
  
  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInComparison(product.id); // 👈 New state
  const discountedPrice = calculateDiscount(product.price, product.discountPercentage);
  const savings = product.price - discountedPrice;
  
  // New: Define product link using composite ID (source-id)
  const productLink = `/product/${product.source}-${product.id}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem(product);
    toast({
      title: "🎉 Added to cart",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast({
        title: "❤️ Removed from wishlist",
        description: `${product.title} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "💖 Added to wishlist",
        description: `${product.title} has been added to your wishlist.`,
      });
    }
  };

  // New: Handle Compare Toggle
  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isCompared) {
      removeFromCompare(product.id);
      toast({
        title: "Removed from comparison",
        description: `${product.title} removed from compare list.`,
      });
    } else {
      addToCompare(product);
      toast({
        title: "Added to comparison",
        description: `${product.title} added to compare list.`,
      });
    }
  };


  // Grid View (Default)
  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/20 h-full flex flex-col",
      className
    )}>
      <Link to={productLink} className="block flex-1">
        <div className="relative aspect-square overflow-hidden bg-muted/20">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Top Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Badge variant="secondary" className="bg-green-500 text-white">
              {product.rating.toFixed(1)} ★
            </Badge>
            {product.discountPercentage > 0 && (
              <Badge variant="destructive">
                -{Math.round(product.discountPercentage)}%
              </Badge>
            )}
          </div>
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discountPercentage > 20 && (
              <Badge variant="destructive" className="text-xs">
                🔥 MEGA SALE
              </Badge>
            )}
            {product.rating > 4.7 && (
              <Badge variant="secondary" className="bg-yellow-500 text-white text-xs">
                ⭐ BESTSELLER
              </Badge>
            )}
          </div>


          {/* Action Buttons (Wishlist & Compare) */}
          <div className="absolute top-2 left-2 flex flex-col space-y-2">
            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleWishlistToggle}
              className={cn(
                "h-9 w-9 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm transition-all duration-300",
                isWishlisted ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
              )}
            >
              <span className={cn(
                "text-lg transition-all",
                isWishlisted ? "text-red-500 scale-110" : "text-gray-600"
              )}>
                {isWishlisted ? '❤️' : '🤍'}
              </span>
            </Button>
            
            {/* Compare Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCompareToggle}
              className={cn(
                "h-9 w-9 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm transition-all duration-300",
                isCompared ? "opacity-100 scale-100 text-primary" : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 text-gray-600"
              )}
            >
              <Scale className="h-4 w-4" />
            </Button>
          </div>

          {/* Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="secondary" className="bg-red-500 text-white text-lg py-3 px-6 font-semibold">
                Out of Stock
              </Badge>
            </div>
          )}

          {/* Limited Stock Banner */}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-red-500 text-white text-xs text-center py-1 px-2 rounded-full font-semibold">
                ⚡ Only {product.stock} left!
              </div>
            </div>
          )}
        </div>
        
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="mb-3">
            <Link to={productLink}>
              <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors leading-tight">
                {product.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
              {product.description}
            </p>
          </div>
          
          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(discountedPrice)}
              </span>
              {product.discountPercentage > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            
            {product.discountPercentage > 0 && (
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                  Save {formatCurrency(savings)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round(product.discountPercentage)}% off
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground bg-secondary px-2 py-1 rounded-full capitalize">
                {product.brand}
              </span>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  product.stock > 10 ? "bg-green-500" : 
                  product.stock > 0 ? "bg-yellow-500" : "bg-red-500"
                )} />
                <span className={cn(
                  product.stock === 0 && "text-red-500 font-semibold"
                )}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full h-12 font-semibold transition-all duration-200 hover:scale-105"
          size="lg"
        >
          <span className="mr-2">🛒</span>
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;