// src/pages/Checkout.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// Corrected paths: Changed ../../ to ../
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
import { cn } from '../lib/utils';
import { CreditCard, Landmark, IndianRupee } from 'lucide-react';
import { CartItem } from '../types'; // <-- Import CartItem type

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
    // Basic validation: check if fields are present and roughly look correct
    const cardNumberValid = data.cardNumber && /^\d{13,19}$/.test(data.cardNumber.replace(/\s/g, ''));
    const expiryDateValid = data.expiryDate && /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(data.expiryDate);
    const cvvValid = data.cvv && /^\d{3,4}$/.test(data.cvv);
    return cardNumberValid && expiryDateValid && cvvValid;
  }
  if (data.paymentMethod === 'upi') {
     // Basic UPI ID validation (example: user@bank)
    return data.upiId && /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(data.upiId);
  }
  return true; // For 'cod' or other methods, no extra validation needed here
}, {
  // Custom error message logic based on payment method
  message: "Please fill in valid payment details for the selected method.",
  path: ["paymentMethod"], // General path, specific errors better handled by individual field rules if needed
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
    setValue, // <-- Add setValue from useForm
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      paymentMethod: 'credit-card', // Default value
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');

  const subtotal = getTotalPrice();
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutForm) => {
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
        userId: user?.id || 0, // <-- Add userId from store
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
        status: 'processing' as const, // <-- Change initial status to 'processing'
        createdAt: new Date().toISOString(),
        // Initialize tracking fields (optional)
        trackingNumber: undefined,
        estimatedDelivery: undefined,
        trackingHistory: [],
      };

      // Save order to localStorage (in real app, send to backend)
      const existingOrders = JSON.parse(localStorage.getItem('flipstore-orders') || '[]');
      localStorage.setItem('flipstore-orders', JSON.stringify([order, ...existingOrders]));

      // Clear cart
      clearCart();

      toast({
        title: "Order placed successfully!",
        description: "Your order is being processed and will be shipped soon.",
      });

      // Navigate to the new Order Details page for this order
      navigate(`/order/${order.id}`); // <-- Navigate to Order Details
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

   // Function to handle changing payment method - needed for custom styling
   const handlePaymentChange = (value: 'credit-card' | 'debit-card' | 'upi' | 'cod') => {
    setValue('paymentMethod', value, { shouldValidate: true }); // Update form state & validate
   };


  if (items.length === 0 && !isProcessing) { // Prevent showing empty cart during processing
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping and Payment */}
          <div className="space-y-6 lg:col-span-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>1. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                    aria-invalid={errors.email ? "true" : "false"}
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
                <CardTitle>2. Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      {...register('firstName')}
                       aria-invalid={errors.firstName ? "true" : "false"}
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
                      aria-invalid={errors.lastName ? "true" : "false"}
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
                    aria-invalid={errors.address ? "true" : "false"}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      {...register('city')}
                      aria-invalid={errors.city ? "true" : "false"}
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
                      aria-invalid={errors.state ? "true" : "false"}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500">{errors.state.message}</p>
                    )}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="400001"
                      {...register('zipCode')}
                      aria-invalid={errors.zipCode ? "true" : "false"}
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-red-500">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* --- REDESIGNED Payment Method Card --- */}
            <Card>
              <CardHeader>
                <CardTitle>3. Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Use hidden RadioGroup for form state management */}
                <RadioGroup
                  defaultValue="credit-card"
                  className="hidden" // Keep the group for react-hook-form, but hide the default radios
                  aria-label="Payment Method" // Accessibility improvement
                  {...register('paymentMethod')} // Register the group itself
                >
                  <RadioGroupItem value="credit-card" id="r-credit-card" />
                  <RadioGroupItem value="debit-card" id="r-debit-card" />
                  <RadioGroupItem value="upi" id="r-upi" />
                  <RadioGroupItem value="cod" id="r-cod" />
                </RadioGroup>

                {/* Custom styled options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Credit Card Option */}
                  <button
                    type="button"
                    role="radio" // Accessibility: Treat as radio button
                    aria-checked={selectedPaymentMethod === 'credit-card'} // Accessibility: Indicate selection state
                    onClick={() => handlePaymentChange('credit-card')}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border bg-background p-4 transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selectedPaymentMethod === 'credit-card' && "ring-2 ring-primary border-primary bg-primary/5"
                    )}
                  >
                    <CreditCard className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-sm text-left">Credit Card</span>
                  </button>

                  {/* Debit Card Option */}
                  <button
                    type="button"
                     role="radio"
                    aria-checked={selectedPaymentMethod === 'debit-card'}
                    onClick={() => handlePaymentChange('debit-card')}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border bg-background p-4 transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selectedPaymentMethod === 'debit-card' && "ring-2 ring-primary border-primary bg-primary/5"
                    )}
                  >
                    <CreditCard className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-sm text-left">Debit Card</span>
                  </button>

                  {/* UPI Option */}
                  <button
                    type="button"
                     role="radio"
                    aria-checked={selectedPaymentMethod === 'upi'}
                    onClick={() => handlePaymentChange('upi')}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border bg-background p-4 transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selectedPaymentMethod === 'upi' && "ring-2 ring-primary border-primary bg-primary/5"
                    )}
                  >
                    <Landmark className="h-5 w-5 text-muted-foreground flex-shrink-0" /> {/* UPI Icon */}
                    <span className="font-medium text-sm text-left">UPI</span>
                  </button>

                  {/* COD Option */}
                  <button
                    type="button"
                     role="radio"
                    aria-checked={selectedPaymentMethod === 'cod'}
                    onClick={() => handlePaymentChange('cod')}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border bg-background p-4 transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selectedPaymentMethod === 'cod' && "ring-2 ring-primary border-primary bg-primary/5"
                    )}
                  >
                    <IndianRupee className="h-5 w-5 text-muted-foreground flex-shrink-0" /> {/* COD Icon */}
                    <span className="font-medium text-sm text-left">Cash on Delivery</span>
                  </button>
                </div>
                {/* --- End Custom styled options --- */}


                {errors.paymentMethod && (
                  <p className="text-sm text-red-500 mt-2">{errors.paymentMethod.message}</p>
                )}

                {/* Conditional Payment Details remain the same */}
                {(selectedPaymentMethod === 'credit-card' || selectedPaymentMethod === 'debit-card') && (
                  <div className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/20">
                    <Label className="font-semibold text-base">Enter Card Details</Label>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-xs text-muted-foreground">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        {...register('cardNumber')}
                         aria-invalid={errors.cardNumber ? "true" : "false"}
                      />
                       {errors.cardNumber && ( <p className="text-sm text-red-500">{errors.cardNumber.message}</p> )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate" className="text-xs text-muted-foreground">Expiry Date (MM/YY)</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          {...register('expiryDate')}
                          aria-invalid={errors.expiryDate ? "true" : "false"}
                        />
                         {errors.expiryDate && ( <p className="text-sm text-red-500">{errors.expiryDate.message}</p> )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-xs text-muted-foreground">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                           type="password" // Use password type for CVV
                           maxLength={4}
                          {...register('cvv')}
                          aria-invalid={errors.cvv ? "true" : "false"}
                        />
                         {errors.cvv && ( <p className="text-sm text-red-500">{errors.cvv.message}</p> )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === 'upi' && (
                  <div className="space-y-2 mt-4 p-4 border rounded-lg bg-muted/20">
                    <Label htmlFor="upiId" className="font-semibold text-base">Enter UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@upi"
                      {...register('upiId')}
                      aria-invalid={errors.upiId ? "true" : "false"}
                    />
                    {errors.upiId && ( <p className="text-sm text-red-500">{errors.upiId.message}</p> )}
                  </div>
                )}

                {selectedPaymentMethod === 'cod' && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      You can pay in cash to the delivery agent when your order arrives. Additional charges may apply.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* --- END REDESIGNED Payment Method Card --- */}

          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-background">
                  {/* Corrected: Added CartItem type for item */}
                  {items.map((item: CartItem) => {
                    const discountedPrice = item.product.price - (item.product.price * item.product.discountPercentage) / 100;
                    return (
                      <div key={`${item.product.source}-${item.product.id}`} className="flex items-center gap-3"> {/* Use combined key */}
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.title}
                          className="w-12 h-12 object-cover rounded border"
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
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
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
                  className="w-full h-12 text-lg font-semibold" // Make button prominent
                  size="lg"
                  disabled={isProcessing}
                  aria-live="polite" // Announce processing state changes
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Order...
                    </>
                  ) : (
                    `Place Order - ${formatCurrency(total)}`
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-2">
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