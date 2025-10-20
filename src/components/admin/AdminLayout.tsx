// src/components/admin/AdminLayout.tsx
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
// Corrected: Ensure AdminSidebar.tsx exists in this directory (src/components/admin/)
import AdminSidebar from './AdminSidebar';
import { ShieldAlert } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { isAdmin, isAuthenticated } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect logic: If not logged in, go to login. If logged in but not admin, go home.
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/admin' } } }); // Try to redirect back after login
    } else if (!isAdmin) {
      navigate('/'); // Redirect non-admins to the homepage
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Render nothing or a loading state while checks run, prevents brief flash of content for non-admins
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Checking permissions... {/* Or a loading spinner */}
      </div>
    );
  }

  // If checks pass, render the layout with the Sidebar and Outlet for nested routes
  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Child admin routes (Dashboard, Products, Orders) will render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;