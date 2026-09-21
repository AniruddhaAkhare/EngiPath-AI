import React from 'react';
import { clsx } from 'clsx';

export type CardVariant =
  | 'default'
  | 'elevated'
  | 'subtle'
  | 'interactive'
  | 'accent-mint'
  | 'accent-coral'
  | 'accent-amber'
  | 'accent-lavender'
  | 'accent-blue'
  | 'accent-teal'
  | 'clay-mint'
  | 'clay-coral'
  | 'clay-amber'
  | 'clay-purple'
  | 'clay-lavender'
  | 'clay-blue'
  | 'clay-teal';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
  isInteractive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  isInteractive = false,
  className,
  ...props
}) => {
  const baseStyles =
    'rounded-[28px] border transition-all duration-300 relative overflow-hidden';

  const variantStyles: Record<CardVariant, string> = {
    default:
      'bg-[#FFFFFF] border-[#E2E4DC] shadow-[0_10px_25px_-4px_rgba(0,0,0,0.06),0_4px_10px_-2px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.95)]',
    elevated:
      'bg-[#FFFFFF] border-[#E2E4DC] shadow-[0_20px_35px_-5px_rgba(0,0,0,0.09),0_8px_16px_-4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)]',
    subtle:
      'bg-[#F8F9F5] border-[#E2E4DC] shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.8)]',
    interactive:
      'bg-[#FFFFFF] border-[#E2E4DC] shadow-[0_10px_25px_-4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] hover:shadow-[0_16px_32px_-4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-1 cursor-pointer',
    'accent-mint':
      'bg-[#FFFFFF] border-[#9CE3C0] shadow-[0_10px_25px_-4px_rgba(156,227,192,0.25),inset_0_1px_0_rgba(255,255,255,0.95)]',
    'clay-mint':
      'bg-gradient-to-b from-[#F0FDF4] to-[#FFFFFF] border-[#9CE3C0]/80 shadow-[0_12px_28px_-6px_rgba(156,227,192,0.35),0_4px_10px_-2px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,1)]',
    'accent-coral':
      'bg-[#FFFFFF] border-[#FF9E9E] shadow-[0_10px_25px_-4px_rgba(255,158,158,0.25),inset_0_1px_0_rgba(255,255,255,0.95)]',
    'clay-coral':
      'bg-gradient-to-b from-[#FFF1F2] to-[#FFFFFF] border-[#FF9E9E]/80 shadow-[0_12px_28px_-6px_rgba(255,158,158,0.35),0_4px_10px_-2px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,1)]',
    'accent-amber':
      'bg-[#FFFFFF] border-[#FDE047] shadow-[0_10px_25px_-4px_rgba(253,224,71,0.25),inset_0_1px_0_rgba(255,255,255,0.95)]',
    'clay-amber':
      'bg-gradient-to-b from-[#FEFCE8] to-[#FFFFFF] border-[#FDE047]/80 shadow-[0_12px_28px_-6px_rgba(253,224,71,0.35),0_4px_10px_-2px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,1)]',
    'accent-lavender':
      'bg-[#FFFFFF] border-[#C4B5FD] shadow-[0_10px_25px_-4px_rgba(196,181,253,0.25),inset_0_1px_0_rgba(255,255,255,0.95)]',
    'clay-lavender':
      'bg-gradient-to-b from-[#F5F3FF] to-[#FFFFFF] border-[#C4B5FD]/80 shadow-[0_12px_28px_-6px_rgba(196,181,253,0.35),0_4px_10px_-2px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,1)]',
    'clay-purple':
      'bg-gradient-to-b from-[#F5F3FF] to-[#FFFFFF] border-[#C4B5FD]/80 shadow-[0_12px_28px_-6px_rgba(196,181,253,0.35),0_4px_10px_-2px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,1)]',
    'accent-blue':
      'bg-[#FFFFFF] border-[#93C5FD] shadow-[0_10px_25px_-4px_rgba(147,197,253,0.25),inset_0_1px_0_rgba(255,255,255,0.95)]',
    'clay-blue':
      'bg-gradient-to-b from-[#EFF6FF] to-[#FFFFFF] border-[#93C5FD]/80 shadow-[0_12px_28px_-6px_rgba(147,197,253,0.35),0_4px_10px_-2px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,1)]',
    'accent-teal':
      'bg-[#FFFFFF] border-[#5EEAD4] shadow-[0_10px_25px_-4px_rgba(94,234,212,0.25),inset_0_1px_0_rgba(255,255,255,0.95)]',
    'clay-teal':
      'bg-gradient-to-b from-[#F0FDFA] to-[#FFFFFF] border-[#5EEAD4]/80 shadow-[0_12px_28px_-6px_rgba(94,234,212,0.35),0_4px_10px_-2px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,1)]',
  };

  const shouldBeInteractive = interactive || isInteractive;

  return (
    <div
      className={clsx(
        baseStyles,
        variantStyles[variant],
        shouldBeInteractive && 'hover:-translate-y-1 hover:shadow-clay-float cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
