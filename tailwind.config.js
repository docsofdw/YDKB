// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
      './pages/**/*.{ts,tsx}',
      './components/**/*.{ts,tsx}',
      './app/**/*.{ts,tsx}',
    ],
    safelist: [
      /^bg-(success|warning|error|info)/,
      /^text-(success|warning|error|info)/
    ],
    prefix: "",
    theme: {
      container: {
        center: true,
        padding: "1rem",
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px",
        },
      },
      extend: {
        colors: {
          // CSS HSL variables for base colors
          "theme-surface": "var(--surface)",
          "theme-primary": "var(--primary)",
          "theme-secondary": "var(--secondary)",
          "theme-text": "var(--text)",
          "theme-muted": "var(--muted)",
          
          // Semantic Colors
          "theme-success": "#4ADE80",
          "theme-warning": "#FACC15",
          "theme-error": "#EF4444",
          "theme-info": "#3B82F6",
          
          // Legacy shadcn colors - keeping for compatibility
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace'],
        },
        fontSize: {
          'xs': '0.75rem',
          'sm': '0.875rem',
          'base': '1rem',
          'lg': '1.125rem',
          'xl': '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
        lineHeight: {
          'tight': '1.25',
          'normal': '1.5',
          'relaxed': '1.75',
        },
        spacing: {
          '0': '0px',
          '1': '0.25rem',
          '2': '0.5rem',
          '3': '0.75rem',
          '4': '1rem',
          '5': '1.25rem',
          '6': '1.5rem',
          '8': '2rem',
          '10': '2.5rem',
          '12': '3rem',
          '16': '4rem',
          '20': '5rem',
          '24': '6rem',
        },
        borderRadius: {
          'xs': '0.125rem',
          'sm': '0.25rem',
          'md': '0.375rem',
          'lg': '0.5rem',
          'xl': '0.75rem',
          '2xl': '1rem',
          'full': '9999px',
        },
        boxShadow: {
          'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          'green-glow': '0 0 15px rgba(74, 222, 128, 0.5)',
          'theme-green-glow': '0 0 15px rgba(74, 222, 128, 0.5)',
        },
        keyframes: {
          "accordion-down": {
            from: { height: "0" },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: "0" },
          },
          "pulse": {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.5 },
          },
          "shake": {
            '0%, 100%': { transform: 'translateX(0)' },
            '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
            '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
          },
          "fade-in": {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          "fade-out": {
            '0%': { opacity: '1', transform: 'translateY(0)' },
            '100%': { opacity: '0', transform: 'translateY(20px)' },
          },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
          "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          "shake": "shake 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
          "fade-in": "fade-in 0.3s ease-out",
          "fade-out": "fade-out 0.3s ease-out",
        },
        transitionProperty: {
          'height': 'height',
          'spacing': 'margin, padding',
        },
        transitionDuration: {
          '150': '150ms',
          '200': '200ms',
          '250': '250ms',
          '300': '300ms',
          '400': '400ms',
        },
        transitionTimingFunction: {
          'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
  }