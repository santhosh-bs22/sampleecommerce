// src/components/MiniCart.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';// Import ScrollArea
import { formatCurrency, calculateDiscount } from '../utils/currency';
import { ShoppingCart, X } from 'lucide-react';

interface MiniCartProps {
  onClose?: () => void; // Optional function to close the cart (e.g., from Popover)
}

const MiniCart: React.FC<MiniCartProps> = ({ onClose }) => {
  const { items, removeItem, getTotalPrice, getTotalItems } = useCartStore();
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <div className="w-80 p-4 bg-popover text-popover-foreground rounded-md shadow-lg border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Shopping Cart ({totalItems})</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          Your cart is empty.
        </div>
      ) : (
        <>
          <ScrollArea className="max-h-60 pr-3"> {/* Use ScrollArea */}
            <div className="space-y-4"> {/* Removed redundant scroll classes */}
              {items.map((item) => {
                const discountedPrice = calculateDiscount(item.product.price, item.product.discountPercentage);
                const productLink = `/product/${item.product.source}-${item.product.id}`;

                return (
                  <div key={`${item.product.source}-${item.product.id}`} className="flex items-start gap-3">
                    <Link to={productLink} onClick={onClose}>
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded border flex-shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={productLink} onClick={onClose} className="hover:text-primary">
                        <p className="text-sm font-medium line-clamp-2">{item.product.title}</p>
                      </Link>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">{formatCurrency(discountedPrice * item.quantity)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.product.id)}
                      aria-label={`Remove ${item.product.title}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <Separator className="my-4" />

          <div className="flex justify-between items-center font-semibold mb-4">
            <span>Subtotal:</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild onClick={onClose}>
              <Link to="/cart">View Cart</Link>
            </Button>
            <Button className="flex-1" asChild onClick={onClose}>
              <Link to="/checkout">Checkout</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default MiniCart;