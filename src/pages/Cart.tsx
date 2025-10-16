import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency, calculateDiscount } from '../utils/currency';
import { useToast } from '../hooks/use-toast';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const { toast } = useToast();
  
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
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

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link to="/">
          <Button>
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <Button variant="outline" onClick={handleClearCart}>
              Clear Cart
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => {
              const discountedPrice = calculateDiscount(item.product.price, item.product.discountPercentage);
              const totalPrice = discountedPrice * item.quantity;

              return (
                <Card key={item.product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {item.product.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.product.brand}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(discountedPrice)}
                          </span>
                          {item.product.discountPercentage > 0 && (
                            <>
                              <span className="text-sm text-muted-foreground line-through">
                                {formatCurrency(item.product.price)}
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                -{item.product.discountPercentage}%
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <span className="h-4 w-4">-</span>
                        </Button>
                        
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                          min="1"
                        />
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <span className="h-4 w-4">+</span>
                        </Button>
                      </div>

                      {/* Total Price and Remove */}
                      <div className="text-right min-w-24">
                        <p className="font-bold text-lg">
                          {formatCurrency(totalPrice)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.product.id, item.product.title)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <span className="mr-1">🗑️</span>
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({cartItemsCount} items)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <Button className="w-full" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>

              <Link to="/" className="block">
                <Button variant="outline" className="w-full">
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