import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'mint'
  | 'coral'
  | 'amber'
  | 'lavender'
  | 'blue'
  | 'teal'
  | 'secondary'
  | 'ghost'
  | 'outline';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  rightIcon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  fullWidth?: boolean;
}

const renderButtonIcon = (
  iconProp?: React.ComponentType<{ className?: string }> | React.ReactNode,
  className = 'w-4 h-4'
): React.ReactNode => {
  if (!iconProp) return null;
  if (React.isValidElement(iconProp)) return iconProp;
  if (
    typeof iconProp === 'function' ||
    (typeof iconProp === 'object' && iconProp !== null && '$$typeof' in iconProp)
  ) {
    const IconComponent = iconProp as React.ComponentType<{ className?: string }>;
    return <IconComponent className={className} />;
  }
  return iconProp as React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none';

  const sizeStyles = {
    sm: 'text-xs px-4 py-2 gap-1.5 shadow-sm',
    md: 'text-sm px-6 py-2.5 gap-2 shadow-clay-pill',
    lg: 'text-base px-8 py-3.5 gap-2.5 shadow-clay',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#82E2B0] hover:bg-[#6edba2] text-stone-900 border border-[#60cca0] shadow-[0_4px_14px_rgba(130,226,176,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] focus:ring-4 focus:ring-[#82E2B0]/40',
    mint:
      'bg-[#9CE3C0] hover:bg-[#85DCAB] text-[#064E3B] border border-[#70D4A0] shadow-[0_4px_14px_rgba(156,227,192,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] focus:ring-4 focus:ring-[#9CE3C0]/40',
    coral:
      'bg-[#FF9E9E] hover:bg-[#F88585] text-[#881337] border border-[#F47171] shadow-[0_4px_14px_rgba(255,158,158,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] focus:ring-4 focus:ring-[#FF9E9E]/40',
    amber:
      'bg-[#FDE047] hover:bg-[#FACC15] text-[#713F12] border border-[#EAB308] shadow-[0_4px_14px_rgba(253,224,71,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] focus:ring-4 focus:ring-[#FDE047]/40',
    lavender:
      'bg-[#C4B5FD] hover:bg-[#A78BFA] text-[#4C1D95] border border-[#8B5CF6] shadow-[0_4px_14px_rgba(196,181,253,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] focus:ring-4 focus:ring-[#C4B5FD]/40',
    blue:
      'bg-[#93C5FD] hover:bg-[#60A5FA] text-[#1E3A8A] border border-[#3B82F6] shadow-[0_4px_14px_rgba(147,197,253,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] focus:ring-4 focus:ring-[#93C5FD]/40',
    teal:
      'bg-[#5EEAD4] hover:bg-[#2DD4BF] text-[#134E4A] border border-[#0D9488] shadow-[0_4px_14px_rgba(94,234,212,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] focus:ring-4 focus:ring-[#5EEAD4]/40',
    secondary:
      'bg-white hover:bg-[#F8F9F5] text-slate-800 border border-[#E2E4DC] shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)] focus:ring-4 focus:ring-slate-200',
    outline:
      'bg-transparent hover:bg-slate-100 text-slate-800 border border-slate-300 focus:ring-4 focus:ring-slate-200',
    ghost:
      'bg-transparent hover:bg-slate-100/80 text-slate-700 shadow-none focus:ring-2 focus:ring-slate-200',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        renderButtonIcon(leftIcon) && <span className="inline-flex shrink-0">{renderButtonIcon(leftIcon)}</span>
      )}
      <span>{children}</span>
      {!isLoading && renderButtonIcon(rightIcon) && <span className="inline-flex shrink-0">{renderButtonIcon(rightIcon)}</span>}
    </button>
  );
};
