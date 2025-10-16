import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Package, ShoppingBag, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { formatCurrency } from '../utils/currency';

interface Order {
  id: number;
  items: Array<{
    product: {
      id: number;
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
}

const Orders: React.FC = () => {
  const { isAuthenticated } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Load orders from localStorage (in real app, fetch from API)
    const savedOrders = JSON.parse(localStorage.getItem('flipstore-orders') || '[]');
    setOrders(savedOrders);
  }, []);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      completed: { variant: 'default' as const, label: 'Completed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
      shipped: { variant: 'default' as const, label: 'Shipped' },
      delivered: { variant: 'default' as const, label: 'Delivered' },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      'credit-card': 'Credit Card',
      'debit-card': 'Debit Card',
      upi: 'UPI',
      cod: 'Cash on Delivery',
    };
    return labels[method] || method;
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Sign in to view your orders</h2>
        <p className="text-muted-foreground mb-8">
          Please sign in to access your order history and tracking information.
        </p>
        <Link to="/login">
          <Button size="lg">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          Track, return, or buy things again
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === 'all' 
                    ? "You haven't placed any orders yet."
                    : `You don't have any ${activeTab} orders.`
                  }
                </p>
                <Link to="/">
                  <Button>
                    Start Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Order #{(order.id).toString().slice(-8)}
                        {getStatusBadge(order.status)}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{order.shippingAddress.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{item.product.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(
                              (item.product.price - 
                               (item.product.price * item.product.discountPercentage) / 100) * 
                              item.quantity
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Order Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                    <div className="flex items-center gap-4 text-sm">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Track Order
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          Return Item
                        </Button>
                      )}
                    </div>
                    
                    <Button size="sm" asChild>
                      <Link to="/">
                        Buy Again
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Order Statistics */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <p className="text-sm text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'shipped').length}
              </div>
              <p className="text-sm text-muted-foreground">In Transit</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'cancelled').length}
              </div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Orders;