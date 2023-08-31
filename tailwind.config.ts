import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7856ff",
        secondary: "#252223",
        background: "#020617", // zinc 400
        text: "#fff",
        accent: "#636e6a",
      },
    },
  },
  plugins: [],
} satisfies Config;
