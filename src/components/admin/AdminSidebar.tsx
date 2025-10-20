// src/components/admin/AdminSidebar.tsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, BarChart3, Settings, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminSidebar: React.FC = () => {
  const linkClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
      isActive && "bg-muted text-primary"
    );

  return (
    <aside className="hidden md:block w-64 border-r bg-background">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span>Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4 px-4 text-sm font-medium">
          <NavLink to="/admin" end className={({ isActive }) => linkClass(isActive)}>
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => linkClass(isActive)}>
            <Package className="h-4 w-4" />
            Products
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => linkClass(isActive)}>
            <ShoppingCart className="h-4 w-4" />
            Orders
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => linkClass(isActive)}>
            <Users className="h-4 w-4" />
            Customers
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => linkClass(isActive)}>
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;