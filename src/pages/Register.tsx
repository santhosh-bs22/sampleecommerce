// src/pages/Register.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useUserStore } from '../store/useUserStore';
import { useToast } from '../hooks/use-toast';
import { User } from '../types';
import AuthLayout from '../components/AuthLayout';

// 1. Define the validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);

    try {
      // Simulate API registration call (2 second delay)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful user data creation
      const newUser: User = {
        id: Date.now(),
        email: data.email,
        username: data.email.split('@')[0],
        firstName: data.firstName,
        lastName: data.lastName,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      };

      // Auto-login the user
      login(newUser); 

      toast({
        title: "Registration successful!",
        description: "Your account has been created. Welcome to EcomX!",
      });

      navigate('/'); // Redirect to home page
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Join EcomX Today. Quick & Easy Sign Up.">
      {/* START: Redesigned Form Content Structure */}
      <div className="w-full">

        {/* Tab Switcher */}
        <div className="flex justify-start text-lg font-semibold border-b mb-6">
            <Link to="/login" className="pb-3 text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <div className="ml-6 pb-3 border-b-2 border-primary text-primary cursor-default">Sign Up</div>
        </div>
        
        <CardHeader className="text-left p-0 mb-6">
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            Enter your details below to get started with EcomX
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* First Name / Last Name in a Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register('firstName')}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register('lastName')}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                {...register('password')}
                 className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                {...register('confirmPassword')}
                 className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full h-11 text-base mt-6" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Sign Up'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div >
        </CardContent>
      </div>
      {/* END: Redesigned Form Content Structure */}
    </AuthLayout>
  );
};

export default Register;