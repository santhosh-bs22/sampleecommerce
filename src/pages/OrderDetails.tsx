// src/pages/OrderDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// Corrected paths: Changed ../../ to ../
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, calculateDiscount } from '../utils/currency';
import { Order, TrackingEvent, CartItem } from '../types'; // Import necessary types
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from 'lucide-react';
import { cn } from '../lib/utils';

// Mock function to fetch order details - replace with actual API call
const fetchOrderDetails = async (orderId: number): Promise<Order | null> => {
  console.log(`Fetching details for order ${orderId}...`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Find order in localStorage (replace with backend fetch)
  const savedOrders: Order[] = JSON.parse(localStorage.getItem('flipstore-orders') || '[]');
  const order = savedOrders.find(o => o.id === orderId);

  // Add mock tracking details if found
  if (order) {
    order.trackingNumber = order.trackingNumber || `ECOMX${order.id}${Math.floor(Math.random() * 1000)}`;
    order.estimatedDelivery = order.estimatedDelivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN');
    order.trackingHistory = order.trackingHistory || [
      { timestamp: order.createdAt, status: 'Order Placed', location: 'Warehouse, Mumbai', description: 'Order confirmed and awaiting processing.' },
      ...(order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' || order.status === 'completed' ? [{ timestamp: new Date(new Date(order.createdAt).getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'Processing', location: 'Warehouse, Mumbai', description: 'Order is being processed.' }] : []),
      ...(order.status === 'shipped' || order.status === 'delivered' || order.status === 'completed' ? [{ timestamp: new Date(new Date(order.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Shipped', location: 'Mumbai Hub', description: `Package shipped via BlueDart. Tracking: ${order.trackingNumber}` }] : []),
      ...(order.status === 'delivered' || order.status === 'completed' ? [{ timestamp: new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), status: 'Out for Delivery', location: order.shippingAddress.city, description: 'Package is out for delivery.' }] : []),
      ...(order.status === 'delivered' || order.status === 'completed' ? [{ timestamp: new Date(new Date(order.createdAt).getTime() + 4.5 * 24 * 60 * 60 * 1000).toISOString(), status: 'Delivered', location: order.shippingAddress.address, description: 'Package delivered successfully.' }] : []),
      ...(order.status === 'cancelled' ? [{ timestamp: new Date(new Date(order.createdAt).getTime() + 0.5 * 24 * 60 * 60 * 1000).toISOString(), status: 'Cancelled', location: 'System', description: 'Order was cancelled.' }] : []),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort descending
  }

  return order || null;
};

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true);
      setError(null);
      const id = parseInt(orderId || '0', 10);
      if (isNaN(id) || id <= 0) {
        setError("Invalid order ID.");
        setIsLoading(false);
        return;
      }

      try {
        const fetchedOrder = await fetchOrderDetails(id);
        if (fetchedOrder) {
          setOrder(fetchedOrder);
        } else {
          setError("Order not found.");
        }
      } catch (err) {
        setError("Failed to load order details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      'credit-card': 'Credit Card',
      'debit-card': 'Debit Card',
      upi: 'UPI',
      cod: 'Cash on Delivery',
    };
    return labels[method] || method;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric'
    });
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-destructive mb-4">Error</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  if (!order) {
    // Should be covered by error state, but as a fallback
    return <div className="container mx-auto px-4 py-16 text-center">Order details not available.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" onClick={() => navigate('/orders')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Order Details</h1>
        <p className="text-muted-foreground">Order #{order.id.toString().slice(-8)} - Placed on {formatDate(order.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tracking & Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tracking Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg mb-2 capitalize">{order.status}</p>
              {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                <p className="text-sm text-muted-foreground mb-4">Estimated Delivery: {order.estimatedDelivery}</p>
              )}
              {order.trackingNumber && (
                <p className="text-sm text-muted-foreground mb-4">Tracking ID: <span className="font-medium text-primary">{order.trackingNumber}</span></p>
              )}
              {/* Mock Tracking History */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                {/* Corrected: Added types for map parameters */}
                {order.trackingHistory?.map((event: TrackingEvent, index: number) => (
                  <div key={index} className="flex gap-3 text-xs relative pl-5">
                    <div className={cn(
                        "absolute left-0 top-0.5 h-full w-0.5",
                        index === 0 ? "bg-primary" : "bg-border",
                         // Corrected: Check length before accessing index
                        index === (order.trackingHistory?.length ?? 0) - 1 && "h-1"
                    )}></div>
                     <div className={cn(
                         "absolute left-[-3.5px] top-0.5 h-2.5 w-2.5 rounded-full border-2",
                         index === 0 ? "bg-primary border-primary" : "bg-background border-border"
                     )}></div>
                    <div>
                      <p className={cn("font-semibold", index === 0 && "text-primary")}>{event.status} - {event.location}</p>
                      <p className="text-muted-foreground">{formatDate(event.timestamp)}</p>
                      <p className="text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
             {/* Corrected: Added types for reduce parameters */}
              <div className="flex justify-between">
                <span>Subtotal ({order.items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0)} items)</span>
                <span>{formatCurrency(order.total / 1.18)}</span> {/* Approx subtotal */}
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%)</span>
                <span>{formatCurrency(order.total - order.total / 1.18)}</span> {/* Approx tax */}
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Items, Shipping, Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Items in Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Corrected: Added types for map parameters */}
              {order.items.map((item: CartItem, index: number) => {
                const itemPrice = calculateDiscount(item.product.price, item.product.discountPercentage);
                const productLink = `/product/${item.product.source}-${item.product.id}`;
                return (
                  <div key={index} className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-b-0 border-dashed">
                    <Link to={productLink}>
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={productLink} className="hover:text-primary transition-colors">
                        <h4 className="font-medium line-clamp-2 mb-1">{item.product.title}</h4>
                      </Link>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-xs text-muted-foreground">Price: {formatCurrency(itemPrice)} each</p>
                    </div>
                    <p className="font-semibold text-sm">
                      {formatCurrency(itemPrice * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Shipping & Payment Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p className="text-muted-foreground">{order.shippingAddress.address}</p>
                <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</p>
                {/* Could add last 4 digits for card, etc. */}
                <p className="font-bold text-base mt-2">Total Paid: {formatCurrency(order.total)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;