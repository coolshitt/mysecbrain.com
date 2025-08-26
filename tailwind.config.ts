import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Only black, white, and gray scale palette
        primary: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Custom habit progress colors
        habit: {
          0: '#000000',    // 0% progress - black
          25: '#404040',   // 25% progress
          50: '#737373',   // 50% progress
          75: '#a3a3a3',  // 75% progress
          100: '#ffffff',  // 100% progress - white
        }
      },
    },
  },
  plugins: [],
};

export default config;
