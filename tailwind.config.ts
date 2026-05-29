import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#09090B",
        midnight: "#111827",
        frost: "#F8FAFC",
        violet: "#8B5CF6",
        neon: "#EC4899",
        cyan: "#67E8F9",
        peach: "#FDBA74",
        lavender: "#C4B5FD"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glow: "0 0 60px rgba(139, 92, 246, 0.32)",
        pink: "0 0 46px rgba(236, 72, 153, 0.28)",
        cyan: "0 0 38px rgba(103, 232, 249, 0.24)"
      },
      backgroundImage: {
        "film-grain":
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 1px), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.05), transparent 1px)"
      },
      opacity: {
        6: "0.06",
        7: "0.07",
        8: "0.08",
        12: "0.12",
        14: "0.14",
        15: "0.15",
        18: "0.18",
        24: "0.24",
        28: "0.28",
        34: "0.34",
        35: "0.35",
        36: "0.36",
        38: "0.38",
        42: "0.42",
        45: "0.45",
        46: "0.46",
        48: "0.48",
        55: "0.55",
        62: "0.62",
        68: "0.68",
        72: "0.72",
        74: "0.74",
        78: "0.78",
        82: "0.82",
        88: "0.88",
        92: "0.92",
        94: "0.94"
      }
    }
  },
  plugins: []
};

export default config;
