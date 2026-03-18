'use client';
import { useEffect } from 'react';
import { LuCircleCheck, LuCircleX, LuTriangleAlert, LuInfo, LuX } from 'react-icons/lu';

const types = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    Icon: LuCircleCheck,
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    Icon: LuCircleX,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    Icon: LuTriangleAlert,
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    Icon: LuInfo,
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
      <style.Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer"
        >
          <LuX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
