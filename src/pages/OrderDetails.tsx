// src/pages/OrderDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, calculateDiscount } from '../utils/currency';
import { Order, TrackingEvent, CartItem } from '../types';
// Added Ban icon for Cancel button
import { ArrowLeft, Package, MapPin, CreditCard, Truck, Ban } from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../hooks/use-toast'; // Import useToast

// Mock function to fetch order details - (Keep existing fetchOrderDetails)
const fetchOrderDetails = async (orderId: number): Promise<Order | null> => {
    console.log(`Fetching details for order ${orderId}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const savedOrders: Order[] = JSON.parse(localStorage.getItem('flipstore-orders') || '[]');
    const order = savedOrders.find(o => o.id === orderId);

    if (order) {
        order.trackingNumber = order.trackingNumber || `ECOMX${order.id}${Math.floor(Math.random() * 1000)}`;
        order.estimatedDelivery = order.estimatedDelivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN');
        order.trackingHistory = order.trackingHistory || [
            { timestamp: order.createdAt, status: 'Order Placed', location: 'Warehouse, Mumbai', description: 'Order confirmed and awaiting processing.' },
            ...(order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' || order.status === 'completed' ? [{ timestamp: new Date(new Date(order.createdAt).getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'Processing', location: 'Warehouse, Mumbai', description: 'Order is being processed.' }] : []),
            ...(order.status === 'shipped' || order.status === 'delivered' || order.status === 'completed' ? [{ timestamp: new Date(new Date(order.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Shipped', location: 'Mumbai Hub', description: `Package shipped via BlueDart. Tracking: ${order.trackingNumber}` }] : []),
            ...(order.status === 'delivered' || order.status === 'completed' ? [{ timestamp: new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), status: 'Out for Delivery', location: order.shippingAddress.city, description: 'Package is out for delivery.' }] : []),
            ...(order.status === 'delivered' || order.status === 'completed' ? [{ timestamp: new Date(new Date(order.createdAt).getTime() + 4.5 * 24 * 60 * 60 * 1000).toISOString(), status: 'Delivered', location: order.shippingAddress.address, description: 'Package delivered successfully.' }] : []),
            ...(order.status === 'cancelled' ? [{ timestamp: new Date(new Date(order.createdAt).getTime() + 0.5 * 24 * 60 * 60 * 1000).toISOString(), status: 'Cancelled', location: 'System', description: 'Order was cancelled by user.' }] : []), // Updated description
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    return order || null;
};

// *** NEW: Mock function to cancel an order ***
const cancelOrder = async (orderId: number): Promise<Order | null> => {
  console.log(`Cancelling order ${orderId}...`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const savedOrders: Order[] = JSON.parse(localStorage.getItem('flipstore-orders') || '[]');
  let updatedOrder: Order | null = null;

  const updatedOrders = savedOrders.map(o => {
    if (o.id === orderId) {
      // Check if order is cancellable
      if (o.status === 'pending' || o.status === 'processing') {
        updatedOrder = {
          ...o,
          status: 'cancelled',
          // Add a cancellation event to tracking history
          trackingHistory: [
            {
              timestamp: new Date().toISOString(),
              status: 'Cancelled',
              location: 'User Request',
              description: 'Order cancelled by user.',
            },
            ...(o.trackingHistory || []), // Keep existing history
          ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), // Re-sort
        };
        return updatedOrder;
      }
    }
    return o;
  });

  if (updatedOrder) {
    localStorage.setItem('flipstore-orders', JSON.stringify(updatedOrders));
    return updatedOrder;
  } else {
    // Return null if order not found or not cancellable
    console.warn(`Order ${orderId} not found or cannot be cancelled.`);
    return null;
  }
};
// *** END NEW FUNCTION ***

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast(); // Initialize toast
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false); // <-- State for cancellation loading
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

  // *** NEW: Handler for cancel button click ***
  const handleCancelOrder = async () => {
    if (!order || !(order.status === 'pending' || order.status === 'processing')) {
      toast({ title: "Cannot Cancel", description: "This order is no longer eligible for cancellation.", variant: "destructive" });
      return;
    }

    // Basic confirmation
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }

    setIsCancelling(true);
    try {
      const cancelledOrder = await cancelOrder(order.id);
      if (cancelledOrder) {
        setOrder(cancelledOrder); // Update local state to show cancelled status
        toast({ title: "Order Cancelled", description: `Order #${order.id.toString().slice(-8)} has been cancelled.` });
      } else {
        // Handle case where cancellation failed (e.g., status changed in backend)
        toast({ title: "Cancellation Failed", description: "Could not cancel the order. It might have already been shipped.", variant: "destructive" });
        // Optionally refetch order details here
        const refreshedOrder = await fetchOrderDetails(order.id);
        if(refreshedOrder) setOrder(refreshedOrder);
      }
    } catch (err) {
      toast({ title: "Error", description: "An error occurred while trying to cancel the order.", variant: "destructive" });
      console.error("Cancellation error:", err);
    } finally {
      setIsCancelling(false);
    }
  };
  // *** END NEW HANDLER ***

  const getPaymentMethodLabel = (method: string) => {
    // ... (keep existing function)
    const labels: { [key: string]: string } = {
      'credit-card': 'Credit Card',
      'debit-card': 'Debit Card',
      upi: 'UPI',
      cod: 'Cash on Delivery',
    };
    return labels[method] || method;
  };

  const formatDate = (dateString: string) => {
    // ... (keep existing function)
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric'
    });
  };

  // --- Render Logic ---
  if (isLoading) { /* ... keep existing loading render ... */
      return <div className="container mx-auto px-4 py-16 text-center"><LoadingSpinner size="lg" /></div>;
  }

  if (error) { /* ... keep existing error render ... */
      return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-semibold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </div>
      );
  }

  if (!order) { /* ... keep existing no order render ... */
      return <div className="container mx-auto px-4 py-16 text-center">Order details not available.</div>;
  }

  // Determine if the order is cancellable
  const isCancellable = order.status === 'pending' || order.status === 'processing';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... keep Back button ... */}
       <Button variant="outline" size="sm" onClick={() => navigate('/orders')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
      </Button>

      {/* ... keep Header ... */}
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

              {/* *** Add Cancel Button Here *** */}
              {isCancellable && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="w-full mb-4"
                >
                  {isCancelling ? (
                    <> <LoadingSpinner size="sm" className="mr-2 border-white"/> Cancelling... </>
                  ) : (
                    <> <Ban className="h-4 w-4 mr-2" /> Cancel Order </>
                  )}
                </Button>
              )}
              {/* *** End Cancel Button *** */}


              {/* Tracking History */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                {order.trackingHistory?.map((event: TrackingEvent, index: number) => (
                   <div key={index} className="flex gap-3 text-xs relative pl-5">
                     <div className={cn(
                         "absolute left-0 top-0.5 h-full w-0.5",
                         index === 0 ? "bg-primary" : "bg-border",
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

          {/* Summary Card - (Keep existing) */}
          <Card>
            <CardHeader> <CardTitle>Order Summary</CardTitle> </CardHeader>
            <CardContent className="space-y-2 text-sm">
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

        {/* Right Column: Items, Shipping, Payment - (Keep existing) */}
        <div className="lg:col-span-2 space-y-6">
           {/* Items Card */}
           <Card>
             <CardHeader> <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Items in Order</CardTitle> </CardHeader>
             <CardContent className="space-y-4">
               {order.items.map((item: CartItem, index: number) => {
                 const itemPrice = calculateDiscount(item.product.price, item.product.discountPercentage);
                 const productLink = `/product/${item.product.source}-${item.product.id}`;
                 return (
                   <div key={index} className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-b-0 border-dashed">
                     <Link to={productLink}> <img src={item.product.thumbnail} alt={item.product.title} className="w-16 h-16 object-cover rounded-md border" /> </Link>
                     <div className="flex-1 min-w-0">
                       <Link to={productLink} className="hover:text-primary transition-colors"> <h4 className="font-medium line-clamp-2 mb-1">{item.product.title}</h4> </Link>
                       <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                       <p className="text-xs text-muted-foreground">Price: {formatCurrency(itemPrice)} each</p>
                     </div>
                     <p className="font-semibold text-sm"> {formatCurrency(itemPrice * item.quantity)} </p>
                   </div>
                 );
               })}
             </CardContent>
           </Card>

           {/* Shipping & Payment Card */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <Card>
               <CardHeader> <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Shipping Address</CardTitle> </CardHeader>
               <CardContent className="text-sm space-y-1">
                 <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                 <p className="text-muted-foreground">{order.shippingAddress.address}</p>
                 <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
               </CardContent>
             </Card>
             <Card>
               <CardHeader> <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payment Method</CardTitle> </CardHeader>
               <CardContent className="text-sm space-y-1">
                 <p className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</p>
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