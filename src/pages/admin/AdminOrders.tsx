// src/pages/admin/AdminOrders.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

// Need to define formatCurrency or import it
const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const AdminOrders: React.FC = () => {
  // Mock data - replace with actual order fetching and management logic
  const orders = [
    { id: 101, customer: "Alice", total: 5000, status: "Processing", date: "2025-10-20" },
    { id: 102, customer: "Bob", total: 1200, status: "Shipped", date: "2025-10-19" },
    { id: 103, customer: "Charlie", total: 8500, status: "Delivered", date: "2025-10-18" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Replace with a proper table component later */}
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Order ID</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Date</th>
                <th className="py-2">Total</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b">
                  <td className="py-2">#{o.id}</td>
                  <td className="py-2">{o.customer}</td>
                  <td className="py-2">{o.date}</td>
                  <td className="py-2">{formatCurrency(o.total)}</td>
                  <td className="py-2"><Badge variant={o.status === 'Delivered' ? 'default' : 'secondary'}>{o.status}</Badge></td>
                   <td className="py-2">
                     <Button variant="outline" size="sm">View</Button>
                     {/* Add buttons for Update Status, etc. */}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;