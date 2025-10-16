import React from 'react';
import { cn } from '../../lib/utils';
import { Toast } from '../../hooks/use-toast';

interface ToastProps extends Toast {
  onClose: () => void;
}

const ToastComponent: React.FC<ToastProps> = ({ 
  title, 
  description, 
  variant = 'default',
  onClose 
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
      variant === 'destructive' 
        ? "border-destructive bg-destructive text-destructive-foreground" 
        : "border bg-background text-foreground"
    )}>
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none group-hover:opacity-100"
      >
        <span className="h-4 w-4">×</span>
      </button>
    </div>
  );
};

export { ToastComponent };