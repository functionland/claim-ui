import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // This covers all files in src directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
