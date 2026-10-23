import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary emerald colors for the application theme
        // Requirement 19.1: Primary color for main actions and active states
        primary: {
          DEFAULT: '#047857', // emerald-700
          light: '#059669',   // emerald-600 - for hover states and success messages (19.3)
          dark: '#064e3b',    // emerald-900 - for titles and headings (19.2)
        },
        // Emerald palette - extending default Tailwind emerald colors
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',  // Requirement 19.3: Hover states and success
          700: '#047857',  // Requirement 19.1: Main actions and active states
          800: '#065f46',
          900: '#064e3b',  // Requirement 19.2: Titles and headings
          950: '#022c22',
        },
        // Background colors
        // Requirement 19.4: Page backgrounds
        background: {
          DEFAULT: '#f9fafb', // gray-50
          white: '#ffffff',
        },
        // Text colors
        // Requirement 19.6: Text colors
        text: {
          primary: '#374151',   // gray-700 - primary text
          secondary: '#6b7280', // gray-500 - secondary text
          dark: '#064e3b',      // emerald-900 - headings
        },
        // Border colors
        // Requirement 19.5: Borders
        border: {
          DEFAULT: '#e5e7eb', // gray-200
          light: '#f3f4f6',   // gray-100
          dark: '#d1d5db',    // gray-300
        },
        // Status colors
        // Requirement 19.7: Error messages
        error: {
          DEFAULT: '#dc2626', // red-600
          light: '#fee2e2',   // red-50
          dark: '#991b1b',    // red-800
        },
        success: {
          DEFAULT: '#059669', // emerald-600
          light: '#d1fae5',   // emerald-100
          dark: '#047857',    // emerald-700
        },
      },
      // Typography
      // Requirement 19.8: System font stack
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      // Spacing customization (if needed beyond defaults)
      spacing: {
        // Additional spacing values can be added here if needed
      },
      // Border radius
      // Requirement 19.9: Rounded corners
      borderRadius: {
        DEFAULT: '0.375rem', // 6px
        sm: '0.25rem',       // 4px
        md: '0.375rem',      // 6px
        lg: '0.5rem',        // 8px
        xl: '0.75rem',       // 12px
        '2xl': '1rem',       // 16px
        '3xl': '1.5rem',     // 24px
        full: '9999px',
      },
      // Box shadows
      // Requirement 19.9: Subtle shadows on cards
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
export default config
