// santhosh-bs22/sampleecommerce/sampleecommerce-63bc78e91cd4ea948c5abc2c3fed71363e6bd765/src/pages/Checkout.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod'; // FIX: Use namespace import, relying on tsconfig.json to resolve module interop
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useCartStore } from '../store/useCartStore';
import { useUserStore } from '../store/useUserStore';
import { formatCurrency } from '../utils/currency';
import { useToast } from '../hooks/use-toast';

const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
  paymentMethod: z.enum(['credit-card', 'debit-card', 'upi', 'cod']),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  upiId: z.string().optional(),
}).refine((data) => {
  if (data.paymentMethod === 'credit-card' || data.paymentMethod === 'debit-card') {
    return data.cardNumber && data.expiryDate && data.cvv;
  }
  if (data.paymentMethod === 'upi') {
    return data.upiId;
  }
  return true;
}, {
  message: "Please fill all required payment details",
  path: ["paymentMethod"],
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart, getTotalPrice } = useCartStore();
  const { user } = useUserStore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      paymentMethod: 'credit-card',
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');

  const subtotal = getTotalPrice();
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutForm) => { // TS7006 fix retained
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order
      const order = {
        id: Date.now(),
        items,
        total,
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
        paymentMethod: data.paymentMethod,
        status: 'completed' as const,
        createdAt: new Date().toISOString(),
      };

      // Save order to localStorage (in real app, send to backend)
      const existingOrders = JSON.parse(localStorage.getItem('flipstore-orders') || '[]');
      localStorage.setItem('flipstore-orders', JSON.stringify([order, ...existingOrders]));

      // Clear cart
      clearCart();

      toast({
        title: "Order placed successfully!",
        description: "Your order has been confirmed and will be shipped soon.",
      });

      navigate('/orders');
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Please try again or use a different payment method.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Add some items to your cart before checking out.</p>
        <Button onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Shipping and Payment */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      {...register('firstName')}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      {...register('lastName')}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter your full address"
                    {...register('address')}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      {...register('city')}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      {...register('state')}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="400001"
                    {...register('zipCode')}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-500">{errors.zipCode.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={selectedPaymentMethod} onValueChange={(value) => {}}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit-card" id="credit-card" />
                    <Label htmlFor="credit-card">Credit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debit-card" id="debit-card" />
                    <Label htmlFor="debit-card">Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi">UPI</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod">Cash on Delivery</Label>
                  </div>
                </RadioGroup>

                {errors.paymentMethod && (
                  <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
                )}

                {/* Credit/Debit Card Details */}
                {(selectedPaymentMethod === 'credit-card' || selectedPaymentMethod === 'debit-card') && (
                  <div className="space-y-4 mt-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        {...register('cardNumber')}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          {...register('expiryDate')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          {...register('cvv')}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Details */}
                {selectedPaymentMethod === 'upi' && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@upi"
                      {...register('upiId')}
                    />
                  </div>
                )}

                {/* COD Message */}
                {selectedPaymentMethod === 'cod' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Pay when your order is delivered. Additional ₹20 charge may apply.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const discountedPrice = item.product.price - (item.product.price * item.product.discountPercentage) / 100;
                    return (
                      <div key={item.product.id} className="flex items-center gap-3">
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.product.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatCurrency(discountedPrice * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    `Place Order - ${formatCurrency(total)}`
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;