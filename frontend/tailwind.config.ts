import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        surface: "#ffffff",
        "surface-container": "#ebefed",
        "surface-container-low": "#f1f4f3",
        "surface-container-lowest": "#ffffff",
        "warm-bg": "#fbfaf7",
        "gentle-wash": "#eef7f4",
        "soft-mint": "#dff3ec",
        "muted-surface": "#f5f1ea",
        "botanical-border": "#d6e6df",
        "primary-hover": "#115e59",
        "ink-primary": "#12312d",
        "sage-secondary": "#64796f",
        "success-leaf": "#2f7d5a",
        "pending-amber": "#d97706",
        outline: "#8aa097",
        "on-primary": "#ffffff",
        "on-primary-container": "#a3faef",
        "on-surface": "#181c1c",
        "on-surface-variant": "#64796f",
        "secondary-container": "#e9f7ef",
        "on-secondary-container": "#164236",
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        display: ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.035em", fontWeight: "700" }],
        h2: ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],
        h3: ["1.125rem", { lineHeight: "1.75rem", fontWeight: "650" }],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "label-caption": ["0.75rem", { lineHeight: "1rem" }],
      },
      fontWeight: {
        h2: "700",
        h3: "650",
        "body-lg": "400",
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        "3xl": "4rem",
        "section-gap": "5rem",
      },
      maxWidth: {
        "max-width": "1280px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        stitch: "0 18px 55px rgba(15, 118, 110, 0.10)",
        "stitch-soft": "0 8px 30px rgba(15, 118, 110, 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
