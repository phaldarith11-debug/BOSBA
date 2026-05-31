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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50:  "#fff1f1",
          100: "#ffe1e1",
          200: "#ffc7c7",
          300: "#ffa0a0",
          400: "#ff6b6b",
          500: "#f83b3b",
          600: "#e51b1b",
          700: "#c31111",
          800: "#a01111",
          900: "#7f1d1d",
          950: "#450a0a",
        },
      },
      fontFamily: {
        sans:     ["var(--font-inter)",  "ui-sans-serif", "system-ui", "sans-serif"],
        khmer:    ["var(--font-khmer)",  "ui-sans-serif", "system-ui", "sans-serif"],
        japanese: ["var(--font-jp)",     "ui-sans-serif", "system-ui", "sans-serif"],
        chinese:  ["var(--font-zh)",     "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "card":       "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 12px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        "popup":      "0 20px 60px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04)",
        "glass":      "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.4)",
        "btn":        "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
      },
      backgroundImage: {
        "hero-gradient":  "linear-gradient(135deg, #7f1d1d 0%, #991b1b 40%, #c31111 100%)",
        "brand-gradient": "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)",
        "dark-gradient":  "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      },
      animation: {
        "fade-in":        "fadeIn 0.4s ease-out",
        "fade-up":        "fadeUp 0.5s ease-out",
        "slide-down":     "slideDown 0.28s cubic-bezier(0.16,1,0.3,1)",
        "slide-in-right": "slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)",
        "scale-in":       "scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)",
        "bounce-dot":     "bounceDot 1.2s ease-in-out infinite",
        "wiggle":         "wiggle 0.45s cubic-bezier(0.36,0.07,0.19,0.97)",
        "cart-bump":      "cartBump 0.4s cubic-bezier(0.17,0.67,0.83,0.67)",
        "heart-burst":    "heartBurst 0.5s cubic-bezier(0.17,0.67,0.83,0.67)",
        "shimmer":        "shimmer 1.6s linear infinite",
        "pulse-slow":     "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow":      "spin 4s linear infinite",
        "float":          "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:       { "0%": { opacity: "0" },                                                  "100%": { opacity: "1" } },
        fadeUp:       { "0%": { opacity: "0", transform: "translateY(16px)" },                   "100%": { opacity: "1", transform: "translateY(0)" } },
        slideDown:    { "0%": { opacity: "0", transform: "translateY(-10px)" },                  "100%": { opacity: "1", transform: "translateY(0)" } },
        slideInRight: { "0%": { transform: "translateX(100%)" },                                 "100%": { transform: "translateX(0)" } },
        scaleIn:      { "0%": { opacity: "0", transform: "scale(0.94)" },                        "100%": { opacity: "1", transform: "scale(1)" } },
        bounceDot:    { "0%,80%,100%": { transform: "scale(0.6)", opacity: "0.5" },              "40%": { transform: "scale(1)", opacity: "1" } },
        wiggle:       { "0%,100%": { transform: "rotate(-8deg)" },                               "50%": { transform: "rotate(8deg)" } },
        cartBump:     { "0%": { transform: "scale(1)" }, "50%": { transform: "scale(1.4)" },     "100%": { transform: "scale(1)" } },
        heartBurst:   { "0%": { transform: "scale(1)" }, "50%": { transform: "scale(1.5)" },     "100%": { transform: "scale(1)" } },
        shimmer:      { "0%": { backgroundPosition: "200% 0" },                                  "100%": { backgroundPosition: "-200% 0" } },
        float:        { "0%,100%": { transform: "translateY(0)" },                               "50%": { transform: "translateY(-12px)" } },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16,1,0.3,1)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
