// src/pages/admin/AdminDashboard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder cards */}
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹1,23,456</p>
            <p className="text-xs text-muted-foreground">+10% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">58</p>
            <p className="text-xs text-muted-foreground">+5 this week</p>
          </CardContent>
        </Card>
        {/* Add more cards as needed */}
      </div>
       {/* Add charts or tables later */}
    </div>
  );
};

export default AdminDashboard;