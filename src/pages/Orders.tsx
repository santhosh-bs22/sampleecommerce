// src/pages/Orders.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'; // Adjusted imports if needed
import { Button } from '../components/ui/button';
import { Badge, BadgeProps } from '../components/ui/badge'; // Import BadgeProps if needed by Badge variant type
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Package, ShoppingBag, Calendar, MapPin, ArrowRight, Truck, CheckCircle, XCircle, CircleDashed, Info } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { formatCurrency, calculateDiscount } from '../utils/currency';
import { cn } from '../lib/utils';
import { Product } from '../types'; // Import Product type if needed elsewhere

// Interface for Order data structure
interface Order {
  id: number;
  items: Array<{
    product: {
      id: number;
      source: string; // Keep source for linking
      title: string;
      thumbnail: string;
      price: number;
      discountPercentage: number;
    };
    quantity: number;
  }>;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled' | 'shipped' | 'delivered';
  createdAt: string;
  // userId?: number; // Optional: Add userId if filtering locally
}

const Orders: React.FC = () => {
  const { user, isAuthenticated } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Load orders from localStorage (replace with API fetch in real app)
    if (isAuthenticated) {
      const savedOrders = JSON.parse(localStorage.getItem('flipstore-orders') || '[]');
      // Optional: Filter orders for the current user if localStorage stores orders for multiple users
      // const userOrders = savedOrders.filter(order => order.userId === user?.id);
      setOrders(savedOrders); // Assuming localStorage only has current user's orders
    } else {
      setOrders([]); // Clear orders if not authenticated
    }
  }, [isAuthenticated, user?.id]); // Rerun effect if authentication or user changes

  // Filter orders based on the active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  // Enhanced status badge function with TypeScript fixes
  const getStatusBadge = (status: Order['status']) => {
    // Define the type for the status configuration values
    type StatusConfigValue = {
        variant: BadgeProps['variant']; // Use BadgeProps['variant'] for type safety
        label: string;
        icon: React.ReactElement;
        className?: string; // className is optional
    };

    // Use satisfies to ensure the whole object conforms without losing specific types
    const statusConfig = {
      pending: { variant: 'secondary', label: 'Pending', icon: <CircleDashed className="h-3 w-3 mr-1" />, className: 'text-yellow-700 border-yellow-300 bg-yellow-50 dark:text-yellow-300 dark:border-yellow-700 dark:bg-yellow-900/30' },
      completed: { variant: 'default', label: 'Completed', icon: <CheckCircle className="h-3 w-3 mr-1" />, className: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600' },
      cancelled: { variant: 'destructive', label: 'Cancelled', icon: <XCircle className="h-3 w-3 mr-1" />, className: '' }, // Provide default className
      shipped: { variant: 'default', label: 'Shipped', icon: <Truck className="h-3 w-3 mr-1" />, className: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600' },
      delivered: { variant: 'default', label: 'Delivered', icon: <CheckCircle className="h-3 w-3 mr-1" />, className: 'bg-green-600 hover:bg-green-700 text-white border-green-700' },
    } satisfies Record<Order['status'], StatusConfigValue>; // Check the whole object structure

    const config = statusConfig[status];

    // Pass the correctly typed variant and handle potentially undefined className
    return (
      <Badge variant={config.variant} className={cn("text-xs font-medium flex items-center", config.className)}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  // Function to get display label for payment methods
  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      'credit-card': 'Credit Card',
      'debit-card': 'Debit Card',
      upi: 'UPI',
      cod: 'Cash on Delivery',
    };
    return labels[method] || method.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // --- Render Logic ---

  // Display prompt if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-[calc(100vh-theme(space.16)-theme(space.1))] flex flex-col justify-center items-center">
        <ShoppingBag className="h-20 w-20 text-primary mb-6" />
        <h2 className="text-3xl font-bold mb-4">View Your Order History</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Please sign in to access your past orders, track current shipments, and manage returns.
        </p>
        <Link to="/login">
          <Button size="lg" className="text-lg px-8 py-3">
            Sign In Now
          </Button>
        </Link>
      </div>
    );
  }

  // Display orders if authenticated
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">My Orders</h1>
        <p className="text-muted-foreground">
          Track, return, or buy items again easily.
        </p>
      </div>

      {/* Tabs for filtering orders */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full sm:w-auto mb-6 border divide-x rounded-md overflow-hidden"> {/* Style TabsList */}
          <TabsTrigger value="all" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pending</TabsTrigger>
          <TabsTrigger value="shipped" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Shipped</TabsTrigger>
          <TabsTrigger value="delivered" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Delivered</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Completed</TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          // Display when no orders match the filter
          <Card className="shadow-sm border-dashed border-muted-foreground/50">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {activeTab === 'all'
                  ? "You haven't placed any orders yet. Let's find something great!"
                  : `You don't have any ${activeTab} orders.`
                }
              </p>
              <Link to="/">
                <Button size="lg">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          // Map through and display filtered orders
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border">
              {/* Order Header */}
              <CardHeader className="bg-muted/30 p-4 border-b">
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-foreground">ORDER #{(order.id).toString().slice(-8)}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="font-semibold text-foreground">
                    Total: {formatCurrency(order.total)}
                  </div>
                </div>
              </CardHeader>

              {/* Order Items */}
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  {order.items.map((item, index) => {
                    const itemPrice = calculateDiscount(item.product.price, item.product.discountPercentage);
                    const productLink = `/product/${item.product.source}-${item.product.id}`;

                    return (
                      <div key={index} className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-b-0 border-dashed">
                        <Link to={productLink}>
                          <img
                            src={item.product.thumbnail}
                            alt={item.product.title}
                            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-md border bg-muted/20" // Slightly larger image
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={productLink} className="hover:text-primary transition-colors">
                            <h4 className="font-medium text-sm md:text-base line-clamp-2 mb-1">{item.product.title}</h4>
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                           <p className="text-xs text-muted-foreground">
                             Price: {formatCurrency(itemPrice)} each
                           </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 flex-shrink-0 w-24">
                           <p className="font-semibold text-sm md:text-base">
                             {formatCurrency(itemPrice * item.quantity)}
                           </p>
                           {/* Simplified Buy Again at order level */}
                         </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>

              {/* Order Footer Actions */}
              <CardFooter className="p-4 bg-muted/30 border-t flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Ship to: {order.shippingAddress.firstName}, {order.shippingAddress.city}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                   {/* Conditional Buttons */}
                   {(order.status === 'shipped' || order.status === 'delivered') && (
                     <Button variant="outline" size="sm" className="bg-background"> {/* Added bg-background for contrast */}
                       <Truck className="h-4 w-4 mr-2"/> Track Order
                     </Button>
                   )}
                   {order.status === 'delivered' && (
                     <Button variant="outline" size="sm" className="bg-background"> {/* Added bg-background */}
                       Return Item
                     </Button>
                   )}
                  <Button variant="secondary" size="sm">
                     <Info className="h-4 w-4 mr-2" /> View Details
                  </Button>
                  {/* General Buy Again button */}
                  <Button size="sm" asChild>
                    <Link to="/"> {/* Link to home, adjust if needed */}
                       Shop Similar <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;