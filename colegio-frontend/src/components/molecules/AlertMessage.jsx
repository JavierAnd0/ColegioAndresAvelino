'use client';
import { useEffect } from 'react';

const types = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: '✅',
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: '❌',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: '⚠️',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'ℹ️',
  },
};

export default function AlertMessage({
  type = 'info',
  message,
  onClose,
  className = '',
  duration = 5000,
}) {
  useEffect(() => {
    if (!message || !onClose || duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const style = types[type] || types.info;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${style.container} ${className}`}>
      <span className="text-lg flex-shrink-0">{style.icon}</span>
      <p className="text-sm font-medium flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer"
        >
          ✕
        </button>
      )}
    </div>
  );
}
