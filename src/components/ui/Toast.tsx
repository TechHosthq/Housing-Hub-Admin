'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, ToastType } from '@/store/useToastStore';

interface ToastProps {
  id: string;
  message: string | string[];
  type: ToastType;
}

const Toast: React.FC<ToastProps> = ({ id, message, type }) => {
  const removeToast = useToastStore((state) => state.removeToast);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  };

  const bgColors = {
    success: 'bg-green-50/80 border-green-200',
    error: 'bg-red-50/80 border-red-200',
    info: 'bg-blue-50/80 border-blue-200',
    warning: 'bg-amber-50/80 border-amber-200',
  };

  return (
    <div
      className={`
        animate-toast-in
        flex items-center gap-3 min-w-[300px] max-w-md p-4 rounded-xl border backdrop-blur-md shadow-lg
        ${bgColors[type]}
      `}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-grow">
        {Array.isArray(message) ? (
          <ul className="space-y-1 list-none p-0 m-0">
            {message.map((msg, index) => (
              <li key={index} className="text-sm font-semibold text-gray-900 leading-tight">
                {msg}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-semibold text-gray-900">{message}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(id)}
        className="flex-shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
};

export default Toast;
