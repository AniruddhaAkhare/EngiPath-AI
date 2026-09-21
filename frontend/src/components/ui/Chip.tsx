import React from 'react';
import { clsx } from 'clsx';
import { Check, X } from 'lucide-react';

export type ChipVariant =
  | 'default'
  | 'selected'
  | 'filter'
  | 'mint'
  | 'coral'
  | 'amber'
  | 'lavender'
  | 'blue'
  | 'teal'
  | 'accent-mint'
  | 'accent-coral'
  | 'accent-amber'
  | 'accent-lavender'
  | 'accent-purple'
  | 'accent-blue'
  | 'accent-teal'
  | 'disabled';

export type ChipSize = 'sm' | 'md' | 'lg';

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ChipVariant;
  size?: ChipSize;
  selected?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
}

const renderChipIcon = (
  iconProp?: React.ComponentType<{ className?: string }> | React.ReactNode,
  className = 'w-3.5 h-3.5 shrink-0'
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

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  size = 'md',
  selected = false,
  removable = false,
  onRemove,
  icon,
  className,
  ...props
}) => {
  const activeVariant = selected ? 'selected' : variant;

  const sizeStyles: Record<ChipSize, string> = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3.5 py-1.5 gap-1.5',
    lg: 'text-sm px-4 py-2 gap-2',
  };

  const baseStyles =
    'inline-flex items-center rounded-full font-semibold select-none transition-all duration-200 shadow-sm';

  const variantStyles: Record<ChipVariant, string> = {
    default:
      'bg-white text-slate-700 border border-[#E2E4DC] hover:border-slate-300 hover:bg-slate-50',
    selected:
      'bg-[#9CE3C0] text-[#064E3B] border border-[#70D4A0] shadow-[0_2px_8px_rgba(156,227,192,0.4)]',
    filter:
      'bg-[#F1F2EC] text-slate-700 border border-[#E2E4DC] hover:bg-white',
    mint:
      'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]',
    'accent-mint':
      'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]',
    coral:
      'bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]',
    'accent-coral':
      'bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]',
    amber:
      'bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]',
    'accent-amber':
      'bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]',
    lavender:
      'bg-[#F5F3FF] text-[#5B21B6] border border-[#DDD6FE]',
    'accent-lavender':
      'bg-[#F5F3FF] text-[#5B21B6] border border-[#DDD6FE]',
    'accent-purple':
      'bg-[#F5F3FF] text-[#5B21B6] border border-[#DDD6FE]',
    blue:
      'bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]',
    'accent-blue':
      'bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]',
    teal:
      'bg-[#F0FDFA] text-[#115E59] border border-[#99F6E4]',
    'accent-teal':
      'bg-[#F0FDFA] text-[#115E59] border border-[#99F6E4]',
    disabled:
      'bg-[#E5E7EB] text-slate-400 border border-slate-200 cursor-not-allowed opacity-60',
  };

  return (
    <div className={clsx(baseStyles, sizeStyles[size], variantStyles[activeVariant], className)} {...props}>
      {selected && <Check className="w-3.5 h-3.5 text-[#064E3B] shrink-0" />}
      {!selected && renderChipIcon(icon)}
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 p-0.5 rounded-full hover:bg-black/10 focus:outline-none"
        >
          <X className="w-3 h-3 text-current" />
        </button>
      )}
    </div>
  );
};
