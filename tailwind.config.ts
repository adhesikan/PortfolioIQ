import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#0F172A",
        "brand-accent": "#2563EB",
        "brand-muted": "#94A3B8"
      }
    }
  },
  plugins: []
};

export default config;
