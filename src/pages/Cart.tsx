// src/pages/Cart.tsx
import React from 'react';
// Import useLocation for redirect state
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useCartStore } from '../store/useCartStore';
import { useUserStore } from '../store/useUserStore'; // Import user store
import { formatCurrency, calculateDiscount } from '../utils/currency';
import { useToast } from '../hooks/use-toast';
import { Trash2 } from 'lucide-react'; // Import Trash2 for remove button

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const { isAuthenticated } = useUserStore(); // Get authentication status
  const { toast } = useToast();

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    // Ensure quantity doesn't go below 1 or exceed stock
    const item = items.find(i => i.product.id === productId);
    if (!item) return;
    const validatedQuantity = Math.max(1, Math.min(newQuantity, item.product.stock));
    updateQuantity(productId, validatedQuantity);
  };

  const handleRemoveItem = (productId: number, productTitle: string) => {
    removeItem(productId);
    toast({
      title: "Item removed",
      description: `${productTitle} has been removed from your cart.`,
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const handleProceedToCheckout = () => {
    // *** AUTHENTICATION CHECK ***
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to proceed to checkout.",
        variant: "destructive",
      });
      // Redirect to login, passing the current page to return to
      navigate('/login', { state: { from: location } });
      return; // Stop execution
    }
    // *** END AUTHENTICATION CHECK ***

    // If authenticated, navigate to checkout
    navigate('/checkout');
  };


  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link to="/">
          <Button size="lg"> {/* Make button slightly larger */}
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = 0; // Assuming free shipping
  const tax = subtotal * 0.18; // Assuming 18% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold">Shopping Cart ({cartItemsCount} items)</h1>
            <Button variant="outline" size="sm" onClick={handleClearCart}>
              Clear Cart
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => {
              const discountedPrice = calculateDiscount(item.product.price, item.product.discountPercentage);
              const totalPrice = discountedPrice * item.quantity;

              return (
                <Card key={item.product.id} className="overflow-hidden"> {/* Added overflow */}
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Product Image */}
                    <Link to={`/product/${item.product.source}-${item.product.id}`}>
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        className="w-24 h-24 sm:w-20 sm:h-20 object-contain rounded-lg border flex-shrink-0" // Contain image
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.source}-${item.product.id}`} className="hover:text-primary">
                        <h3 className="font-semibold text-base sm:text-lg line-clamp-2 mb-1">
                          {item.product.title}
                        </h3>
                      </Link>
                      <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                        {item.product.brand} - {item.product.category.replace('-', ' ')}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold text-green-600">
                          {formatCurrency(discountedPrice)}
                        </span>
                        {item.product.discountPercentage > 0 && (
                          <>
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(item.product.price)}
                            </span>
                            <Badge variant="destructive" className="text-xs px-1.5 py-0.5"> {/* Smaller badge */}
                              -{Math.round(item.product.discountPercentage)}%
                            </Badge>
                          </>
                        )}
                      </div>
                       <p className="text-xs text-muted-foreground mt-1">
                         {item.product.stock <= 10 && item.product.stock > 0 ? `Only ${item.product.stock} left!` : item.product.stock > 0 ? `${item.product.stock} available` : 'Out of stock'}
                       </p>
                    </div>

                    {/* Quantity & Remove on Small Screens */}
                    <div className="flex sm:hidden items-center justify-between w-full mt-2">
                         <div className="flex items-center space-x-2">
                             <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="h-8 w-8"
                              >
                               <span className="h-4 w-4">-</span>
                              </Button>
                             <span className="w-8 text-center font-medium">{item.quantity}</span>
                             <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="h-8 w-8"
                              >
                               <span className="h-4 w-4">+</span>
                             </Button>
                         </div>
                         <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.product.id, item.product.title)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50/50 px-2 py-1 h-8"
                        >
                           <Trash2 className="h-4 w-4 mr-1" /> Remove
                        </Button>
                    </div>


                    {/* Quantity Controls (Medium Screens Up) */}
                    <div className="hidden sm:flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8" // Smaller buttons
                      >
                        <span className="h-4 w-4">-</span>
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="h-8 w-8" // Smaller buttons
                      >
                        <span className="h-4 w-4">+</span>
                      </Button>
                    </div>

                    {/* Total Price and Remove (Medium Screens Up) */}
                    <div className="hidden sm:flex flex-col items-end space-y-1 min-w-[100px] flex-shrink-0"> {/* Adjusted width */}
                      <p className="font-semibold text-base sm:text-lg"> {/* Slightly larger font */}
                        {formatCurrency(totalPrice)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.product.id, item.product.title)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50/50 px-2 py-1 h-auto" // Adjusted padding/height
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 sticky top-20 self-start"> {/* Make summary sticky */}
          <Card className="shadow-md"> {/* Add subtle shadow */}
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle> {/* Slightly smaller title */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm"> {/* Smaller text */}
                <span>Subtotal ({cartItemsCount} items)</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Estimated Tax (18%)</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Order Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <Button size="lg" className="w-full text-base" onClick={handleProceedToCheckout}> {/* Larger button */}
                Proceed to Checkout
              </Button>

              <Link to="/" className="block text-center mt-2">
                <Button variant="link" className="text-primary h-auto p-0">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;