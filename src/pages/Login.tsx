// src/pages/Login.tsx

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useUserStore } from '../store/useUserStore';
import { useToast } from '../hooks/use-toast';
import AuthLayout from '../components/AuthLayout';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUserStore();
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mock login - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockUser = {
        id: 1,
        email: formData.email,
        username: formData.email.split('@')[0],
        firstName: 'John',
        lastName: 'Doe',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      };

      login(mockUser);
      toast({
        title: "Login successful",
        description: "Welcome back to EcomX!",
      });

      navigate(from, { replace: true });

    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Seamless Shopping Awaits. Sign In.">
      {/* START: Redesigned Form Content Structure */}
      <div className="w-full">

        {/* Tab Switcher */}
        <div className="flex justify-start text-lg font-semibold border-b mb-6">
            <div className="pb-3 border-b-2 border-primary text-primary cursor-default">Sign In</div>
            <Link to="/register" className="ml-6 pb-3 text-muted-foreground hover:text-foreground transition-colors">Sign Up</Link>
        </div>

        <CardHeader className="text-left p-0 mb-6">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your EcomX account
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased spacing for better look */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                {/* Added Forgot Password Link */}
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot Password?</Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}> {/* Slightly taller button */}
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </div>
      {/* END: Redesigned Form Content Structure */}
    </AuthLayout>
  );
};

export default Login;