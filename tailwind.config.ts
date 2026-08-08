import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx,css}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    screens: {
      'md': '900px',  // <--- Mobile view ends here
      'lg': '1200px', // <--- "Dual Column" starts here
      'xl': '1600px', // <--- "Triple Column" starts here
    },
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      fontFamily: {
        // the display/reading voice
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        // the machine voice: headlines, labels, code, numbers-as-furniture
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        page: "hsl(var(--page))",
        background: "hsl(var(--page))", // alias — stock shadcn primitives use bg-background
        foreground: "hsl(var(--foreground))",
        cream: "hsl(var(--cream))",                  // legacy alias → paper
        "claude-peach": "hsl(var(--claude-peach))",  // legacy alias → accent
        "on-primary": "hsl(var(--on-primary))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--on-primary))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--on-primary))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-primary))",
          "accent-foreground": "hsl(var(--sidebar-primary-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // derived shades — named by job, defined in index.css
        "accent-hover": "var(--accent-hover)",
        "ink-soft": "var(--ink-soft)",
        "grey-2": "var(--grey-2)",
        "grey-3": "var(--grey-3)",
        "grey-4": "var(--grey-4)",
        "hairline-faint": "var(--hairline-faint)",
        tint: "var(--tint)",
      },
      borderRadius: {
        // the system has zero radius; these neutralize any straggler rounded-* class
        lg: "0",
        md: "0",
        sm: "0",
      },
      animationDelay: {
        2000: "2s",
        4000: "4s",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
