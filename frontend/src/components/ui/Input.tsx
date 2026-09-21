import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  leftIcon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  rightIcon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  pill?: boolean;
}

const renderIcon = (
  iconProp?: React.ComponentType<{ className?: string }> | React.ReactNode,
  defaultClassName = 'w-4 h-4'
): React.ReactNode => {
  if (!iconProp) return null;
  if (React.isValidElement(iconProp)) {
    return iconProp;
  }
  if (
    typeof iconProp === 'function' ||
    (typeof iconProp === 'object' && iconProp !== null && '$$typeof' in iconProp)
  ) {
    const IconComponent = iconProp as React.ComponentType<{ className?: string }>;
    return <IconComponent className={defaultClassName} />;
  }
  return iconProp as React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, leftIcon, rightIcon, pill = true, className, ...props }, ref) => {
    const renderedLeftIcon = renderIcon(leftIcon || icon, 'w-4 h-4');
    const renderedRightIcon = renderIcon(rightIcon, 'w-4 h-4');

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 pl-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {renderedLeftIcon && (
            <div className="absolute left-4 flex items-center pointer-events-none text-slate-400">
              {renderedLeftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full bg-[#FFFFFF] text-slate-900 placeholder-slate-400 text-sm transition-all duration-200 border',
              'shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] focus:outline-none',
              pill ? 'rounded-full' : 'rounded-2xl',
              renderedLeftIcon ? 'pl-11' : 'pl-5',
              renderedRightIcon ? 'pr-11' : 'pr-5',
              'py-3',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                : 'border-[#E2E4DC] hover:border-[#D3D6CB] focus:border-[#70D4A0] focus:ring-4 focus:ring-[#9CE3C0]/35',
              className
            )}
            {...props}
          />
          {renderedRightIcon && (
            <div className="absolute right-4 flex items-center pointer-events-none text-slate-400">
              {renderedRightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-xs font-medium text-red-500 pl-2">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-slate-500 pl-2">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
