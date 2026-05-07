import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f7f3ef",
        surface: "#ffffff",
        "surface-warm": "#fffaf6",
        border: "#e7ded6",
        "border-strong": "#d9cdc1",
        text: "#171717",
        muted: "#6f6761",
        "muted-2": "#9a918a",
        orange: {
          DEFAULT: "#f04b13",
          dark: "#d83d08",
          soft: "#fff0e8",
          "soft-2": "#fde6d9",
        },
        green: {
          DEFAULT: "#137a3a",
          soft: "#e6f3ec",
        },
        "blue-soft": "#e7eef9",
        "warm-soft": "#f5ece4",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
