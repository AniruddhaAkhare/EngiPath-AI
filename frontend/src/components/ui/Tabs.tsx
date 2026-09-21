import React from 'react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pill' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  className,
}) => {
  if (variant === 'underline') {
    return (
      <div className={clsx('flex items-center gap-8 border-b border-[#E2E4DC]', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'relative pb-3 text-sm font-semibold transition-all duration-200 focus:outline-none flex items-center gap-2',
                isActive ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#70D4A0] rounded-full shadow-[0_0_8px_rgba(112,212,160,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'inline-flex items-center p-1.5 rounded-full bg-[#F1F2EC] border border-[#E2E4DC] shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 select-none flex items-center gap-2 focus:outline-none',
              isActive
                ? 'bg-white text-slate-900 shadow-[0_3px_10px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={clsx(
                  'px-2 py-0.5 rounded-full text-xs font-bold',
                  isActive ? 'bg-[#9CE3C0] text-[#064E3B]' : 'bg-slate-200 text-slate-700'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
