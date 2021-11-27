const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#3c4858',
          DEFAULT: '#373c42',
          light: '#e0e6ed',
        }
      },
      zIndex: {
        'top': 2147483647,
      }, 
      minWidth: {
        '400': '400px',
      },
      maxWidth: {
        '600': '600px',
      },
      minHieght: {
        '500': '500px',
      },
      width: {
        '50': '50px',
        '400': '400px',

      },
      hieght: {
        '50': '50px',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
