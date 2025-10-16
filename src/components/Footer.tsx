import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">EcomX</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your one-stop destination for all your shopping needs. Quality products at unbeatable prices.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 cursor-pointer hover:text-primary" />
              <Twitter className="h-5 w-5 cursor-pointer hover:text-primary" />
              <Instagram className="h-5 w-5 cursor-pointer hover:text-primary" />
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h3 className="font-semibold">Shop</h3>
            <div className="space-y-2">
              <Link to="/products" className="block text-sm text-muted-foreground hover:text-primary">
                All Products
              </Link>
              <Link to="/categories/smartphones" className="block text-sm text-muted-foreground hover:text-primary">
                Smartphones
              </Link>
              <Link to="/categories/laptops" className="block text-sm text-muted-foreground hover:text-primary">
                Laptops
              </Link>
              <Link to="/categories/audio" className="block text-sm text-muted-foreground hover:text-primary">
                Audio
              </Link>
              <Link to="/categories/footwear" className="block text-sm text-muted-foreground hover:text-primary">
                Footwear
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold">Customer Service</h3>
            <div className="space-y-2">
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary">
                Contact Us
              </Link>
              <Link to="/shipping" className="block text-sm text-muted-foreground hover:text-primary">
                Shipping Info
              </Link>
              <Link to="/returns" className="block text-sm text-muted-foreground hover:text-primary">
                Returns
              </Link>
              <Link to="/faq" className="block text-sm text-muted-foreground hover:text-primary">
                FAQ
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Info</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>123 Business Street</p>
              <p>Mumbai, MH 400001</p>
              <p>India</p>
              <p>Email: support@ecomx.com</p>
              <p>Phone: +91 98765 43210</p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 EcomX. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;