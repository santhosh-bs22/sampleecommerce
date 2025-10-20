// src/pages/admin/AdminProducts.tsx
import React from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PlusCircle } from 'lucide-react';

const AdminProducts: React.FC = () => {
  // Mock data - replace with actual product fetching and management logic
  const products = [
    { id: 1, name: "Sample Product 1", price: 1000, stock: 50 },
    { id: 2, name: "Sample Product 2", price: 2500, stock: 20 },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Replace with a proper table component later */}
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Name</th>
                <th className="py-2">Price</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{formatCurrency(p.price)}</td>
                  <td className="py-2">{p.stock}</td>
                  <td className="py-2 space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm">Delete</Button>
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

// Need to define formatCurrency or import it
const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;


export default AdminProducts;