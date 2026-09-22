import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1F4D3A",
          dark: "#163A2C",
          light: "#2A6B50",
        },
        secondary: {
          DEFAULT: "#D9C3A5",
          dark: "#C4A882",
          light: "#EAD9C0",
        },
        accent: {
          DEFAULT: "#B8945A",
          dark: "#9E7A42",
          light: "#CEAD78",
        },
        background: "#FAF8F3",
        surface: "#FFFFFF",
        charcoal: "#1F2933",
        "warm-gray": "#6B7280",
        border: "#E7E1D7",
        success: "#2E7D5B",
        error: "#B4534B",
        warning: "#D97706",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "112": "28rem",
        "128": "32rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(31,41,51,0.08), 0 1px 2px -1px rgba(31,41,51,0.06)",
        "card-hover": "0 4px 12px 0 rgba(31,41,51,0.12), 0 2px 6px -2px rgba(31,41,51,0.08)",
        panel: "0 4px 24px 0 rgba(31,41,51,0.08)",
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
