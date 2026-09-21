/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- Authenticated Claymorphic Styleguide Tokens (Reference 2) ---
        surface: {
          bg: '#F8F9F5',
          card: '#FFFFFF',
          subtle: '#F1F2EC',
          inset: '#E8EAE2',
        },
        border: {
          soft: '#E2E4DC',
          medium: '#D3D6CB',
          strong: '#CBD0C2',
        },
        clay: {
          // 1. Mint Green (Primary Action)
          mint: {
            DEFAULT: '#9CE3C0',
            hover: '#82DBAE',
            subtle: '#ECFDF5',
            border: '#70D4A0',
            text: '#064E3B',
            glow: 'rgba(156, 227, 192, 0.45)',
          },
          // 2. Soft Coral / Rose (Error / Hot)
          coral: {
            DEFAULT: '#FF9E9E',
            hover: '#F88585',
            subtle: '#FFF1F2',
            border: '#F47171',
            text: '#881337',
            glow: 'rgba(255, 158, 158, 0.45)',
          },
          // 3. Warm Amber / Honey (Warning / Attention)
          amber: {
            DEFAULT: '#FDE047',
            hover: '#FACC15',
            subtle: '#FEF9C3',
            border: '#EAB308',
            text: '#713F12',
            glow: 'rgba(253, 224, 71, 0.45)',
          },
          // 4. Soft Lavender / Violet (AI Insights / Creative)
          lavender: {
            DEFAULT: '#C4B5FD',
            hover: '#A78BFA',
            subtle: '#F5F3FF',
            border: '#8B5CF6',
            text: '#4C1D95',
            glow: 'rgba(196, 181, 253, 0.45)',
          },
          // 5. Sky / Azure (Maps / Search / Technical)
          blue: {
            DEFAULT: '#93C5FD',
            hover: '#60A5FA',
            subtle: '#EFF6FF',
            border: '#3B82F6',
            text: '#1E3A8A',
            glow: 'rgba(147, 197, 253, 0.45)',
          },
          // 6. Emerald / Teal (Verified / Live)
          teal: {
            DEFAULT: '#5EEAD4',
            hover: '#2DD4BF',
            subtle: '#F0FDFA',
            border: '#0D9488',
            text: '#134E4A',
            glow: 'rgba(94, 234, 212, 0.45)',
          },
        },
        // --- Public Landing Page Tokens (Reference 1) ---
        landing: {
          purple: '#8B5CF6',
          indigo: '#6366F1',
          fuchsia: '#D946EF',
          dark: '#0F172A',
          card: 'rgba(255, 255, 255, 0.75)',
        },
      },
      boxShadow: {
        'clay-sm': '0 2px 6px 0 rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'clay': '0 8px 24px -4px rgba(0, 0, 0, 0.07), 0 3px 8px -2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'clay-hover': '0 14px 28px -4px rgba(0, 0, 0, 0.09), 0 5px 12px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        'clay-card': '0 12px 30px -4px rgba(0, 0, 0, 0.06), 0 4px 10px -2px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'clay-elevated': '0 20px 38px -6px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        'clay-inset': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06), inset 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'focus-mint': '0 0 0 4px rgba(156, 227, 192, 0.5)',
        'focus-purple': '0 0 0 4px rgba(196, 181, 253, 0.5)',
      },
      borderRadius: {
        'clay': '24px',
        'clay-lg': '32px',
        'clay-xl': '40px',
      },
    },
  },
  plugins: [],
};
