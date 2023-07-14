/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
        border: "var(--border, #e5e5e5)",
        input: "var(--input, #e5e5e5)",
        ring: "var(--ring, #a3a3a3)",
        background: "var(--background, #ffffff)",
        foreground: "var(--foreground, #0a0a0a)",
        primary: {
          DEFAULT: "var(--primary, #171717)",
          foreground: "var(--primary-foreground, #fafafa)",
        },
        secondary: {
          DEFAULT: "var(--secondary, #f5f5f5)",
          foreground: "var(--secondary-foreground, #171717)",
        },
        destructive: {
          DEFAULT: "var(--destructive, #ef4444)",
          foreground: "var(--destructive-foreground, #fafafa)",
        },
        muted: {
          DEFAULT: "var(--muted, #f5f5f5)",
          foreground: "var(--muted-foreground, #737373)",
        },
        accent: {
          DEFAULT: "var(--accent, #f5f5f5)",
          foreground: "var(--accent-foreground, #171717)",
        },
        popover: {
          DEFAULT: "var(--popover, #ffffff)",
          foreground: "var(--popover-foreground, #0a0a0a)",
        },
        card: {
          DEFAULT: "var(--card, #ffffff)",
          foreground: "var(--card-foreground, #0a0a0a)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
