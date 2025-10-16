import React from 'react';
import { ToastComponent } from './toast';
import { useToast } from '../../hooks/use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          {...toast}
          onClose={() => dismiss(toast.id)}
        />
      ))}
    </div>
  );
}