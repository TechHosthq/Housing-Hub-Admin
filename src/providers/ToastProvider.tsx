'use client';

import React from 'react';
import Toast from '@/components/ui/Toast';
import { useToastStore } from '@/store/useToastStore';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </>
  );
};
