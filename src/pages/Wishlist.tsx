import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency, formatDiscountPrice } from '../utils/currency';
import { useToast } from '../hooks/use-toast';

const Wishlist: React.FC = () => {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  // FIX: Destructure toast from useToast hook
  const { toast } = useToast();

  const handleRemoveFromWishlist = (productId: number, productTitle: string) => {
    removeItem(productId);
    toast({
      title: "Removed from wishlist",
      description: `${productTitle} has been removed from your wishlist.`,
    });
  };

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const handleMoveAllToCart = () => {
    items.forEach(product => addItem(product));
    toast({
      title: "Items moved to cart",
      description: "All items have been moved to your cart.",
    });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-8">
          Save items you love to your wishlist. Review them anytime and easily move them to your cart.
        </p>
        <Link to="/">
          <Button size="lg">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground mt-2">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
        <Button onClick={handleMoveAllToCart}>
          Move All to Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <Card key={product.id} className="group overflow-hidden">
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.thumbnail}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge variant="secondary" className="bg-green-500 text-white">
                  {product.rating} ★
                </Badge>
                {product.discountPercentage > 0 && (
                  <Badge variant="destructive">
                    -{product.discountPercentage}%
                  </Badge>
                )}
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-green-600">
                  {formatDiscountPrice(product.price, product.discountPercentage)}
                </span>
                {product.discountPercentage > 0 && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {product.stock} in stock • {product.brand}
              </p>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex gap-2">
              <Button 
                className="flex-1" 
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleRemoveFromWishlist(product.id, product.title)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;