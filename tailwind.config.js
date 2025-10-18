/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))", // Teal
          foreground: "hsl(var(--primary-foreground))", // White/Light Gray
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Lighter Gray
          foreground: "hsl(var(--secondary-foreground))", // Darker Gray/Black
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))", // Red remains
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))", // Slightly darker gray
          foreground: "hsl(var(--muted-foreground))", // Medium gray
        },
        accent: {
          DEFAULT: "hsl(var(--accent))", // Lighter Teal
          foreground: "hsl(var(--accent-foreground))", // Darker Gray/Black
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: { // Add keyframes for animations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
         "slide-in-left": {
          from : { transform: 'translateX(-100%)', opacity: '0'},
          to: { transform: 'translateX(0)', opacity: '1'},
        },
         "slide-in-right": {
          from : { transform: 'translateX(100%)', opacity: '0'},
          to: { transform: 'translateX(0)', opacity: '1'},
        }
      },
      animation: { // Add animation utilities
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-in-left": "slide-in-left 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.5s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")], // Add animate plugin if not already there
}

// Note: You might need to install tailwindcss-animate: npm install tailwindcss-animate