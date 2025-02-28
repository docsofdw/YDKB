// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
      './pages/**/*.{ts,tsx,js,jsx}',
      './components/**/*.{ts,tsx,js,jsx}',
      './app/**/*.{ts,tsx,js,jsx}',
      './src/**/*.{ts,tsx,js,jsx}',
    ],
    prefix: "",
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {
        colors: {
          // YDKB Brand Colors
          "deep-slate": "#121620", // Primary background
          "turf-green": "#00A550", // Primary accent/success color
          "pigskin-brown": "#8B4513", // Secondary accent
          "midnight-navy": "#1A1F2E", // Secondary background, card backgrounds
          "chalk-white": "#F5F5F5", // Primary text
          "silver-gray": "#C0C0C0", // Secondary text, borders, inactive elements
          
          // Functional Colors
          "victory-green": "#00A550", // Success states, correct answers
          "penalty-red": "#E53935", // Error states, incorrect answers
          "warning-yellow": "#FFC107", // Warning states, hints
          "highlight-blue": "#0288D1", // Focus states, buttons, links
          
          // Difficulty Level Colors
          "easy": "#00A550", // Soft green
          "hard": "#FFC107", // Caution yellow
          "hall-of-fame": "#9C27B0", // Prestigious purple
          
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
          inter: ['Inter', 'sans-serif'],
          montserrat: ['Montserrat', 'sans-serif'],
        },
        fontSize: {
          // Type Scale
          'heading-1': '32px', // Game Title
          'heading-2': '24px', // Section Titles
          'heading-3': '20px', // Card Titles
          'body-large': '16px',
          'body-default': '14px',
          'body-small': '12px',
          'caption': '10px',
        },
        fontWeight: {
          regular: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          extrabold: '800',
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
          'card': '8px',
          'button': '6px',
          'input': '6px',
        },
        boxShadow: {
          'card': '0 4px 6px rgba(0, 0, 0, 0.1)',
          'button': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        spacing: {
          '4': '4px',   // Extra Small
          '8': '8px',   // Small
          '16': '16px', // Medium
          '24': '24px', // Large
          '32': '32px', // Extra Large
          '48': '48px', // 2x Large
          '64': '64px', // 3x Large
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
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
          "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          "shake": "shake 0.4s ease-in-out",
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