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
        // Deep forest green — calm, luxurious, nature-forward
        primary: {
          DEFAULT: "#17382F",
          dark: "#0E2922",
          light: "#1F4D3A",
        },
        secondary: {
          DEFAULT: "#DDD6C7",
          dark: "#C8BEA8",
          light: "#EDE8DF",
        },
        // Antique gold — restrained, elegant accent only
        accent: {
          DEFAULT: "#B69A62",
          dark: "#9A8048",
          light: "#CAB07A",
        },
        // Muted sage — secondary text, decorative
        sage: {
          DEFAULT: "#6F8275",
          light: "#8FA097",
          dark: "#556462",
        },
        background: "#F7F5EF",
        surface: "#FCFBF7",
        charcoal: "#1E2823",
        "warm-gray": "#69736C",
        border: "#D8D5CC",
        success: "#2E7D5B",
        error: "#B4534B",
        warning: "#C97B2D",
        // Ivory tones
        ivory: "#F7F5EF",
        "warm-white": "#FCFBF7",
        beige: "#DDD6C7",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        "serif-display": ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "112": "28rem",
        "128": "32rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(14,41,34,0.08), 0 1px 2px -1px rgba(14,41,34,0.06)",
        "card-hover": "0 6px 20px 0 rgba(14,41,34,0.10), 0 2px 8px -2px rgba(14,41,34,0.08)",
        panel: "0 4px 24px 0 rgba(14,41,34,0.08)",
        "xs": "0 1px 2px 0 rgba(14,41,34,0.06)",
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "slide-in": "slideIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        shimmer: "shimmer 1.8s infinite",
        "slow-zoom": "slowZoom 8s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
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
        slowZoom: {
          "0%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
      },
      letterSpacing: {
        widest: "0.25em",
        "ultra-wide": "0.35em",
      },
    },
  },
  plugins: [],
};

export default config;
