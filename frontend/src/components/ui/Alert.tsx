import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'warning' | 'error' | 'info' | 'danger';

interface AlertProps {
  type?: AlertType;
  variant?: AlertType;
  title?: string;
  message?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  variant,
  title,
  message,
  children,
  onClose,
  className,
}) => {
  const chosenType = variant || type || 'info';
  const normalizedType = chosenType === 'danger' ? 'error' : chosenType;

  const styles: Record<'success' | 'warning' | 'error' | 'info', { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    success: {
      bg: 'bg-[#ECFDF5]',
      border: 'border-[#A7F3D0]',
      text: 'text-[#065F46]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />,
    },
    warning: {
      bg: 'bg-[#FFFBEB]',
      border: 'border-[#FDE68A]',
      text: 'text-[#92400E]',
      icon: <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0" />,
    },
    error: {
      bg: 'bg-[#FFF1F2]',
      border: 'border-[#FECDD3]',
      text: 'text-[#9F1239]',
      icon: <AlertCircle className="w-5 h-5 text-[#E11D48] shrink-0" />,
    },
    info: {
      bg: 'bg-[#EFF6FF]',
      border: 'border-[#BFDBFE]',
      text: 'text-[#1E40AF]',
      icon: <Info className="w-5 h-5 text-[#2563EB] shrink-0" />,
    },
  };

  const current = styles[normalizedType];

  return (
    <div
      className={clsx(
        'w-full flex items-start gap-3 p-4 rounded-2xl border shadow-sm transition-all duration-200',
        current.bg,
        current.border,
        current.text,
        className
      )}
    >
      {current.icon}
      <div className="flex-1 text-sm">
        {title && <h5 className="font-bold mb-0.5">{title}</h5>}
        <div className="leading-relaxed opacity-95">{message || children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/5 transition-colors focus:outline-none"
        >
          <X className="w-4 h-4 text-current opacity-70 hover:opacity-100" />
        </button>
      )}
    </div>
  );
};
