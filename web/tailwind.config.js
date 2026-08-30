const { fontFamily } = require('tailwindcss/defaultTheme');

const config = {
  darkMode: 'selector',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
      },
      colors: {
        white: '#FFFFFF',
        blue: '#006ECD',
        blue1: '#338BD7',
        blue2: '#F2F7FC',
        skyblue: '#EEF5FF',
        red: '#EF151E',
        red1: '#FF2932',
        yellow: '#FF9700',
        pink: '#F46E6E',
        pink1: '#FFEDED',
        pink5: '#FEF8F8',
        pink20: '#FDE2E2',
        text: {
          black: '#333333',
          'dark-gray1': '#666666',
          'dark-gray2': '#999999',
        },
        bg: {
          gray1: '#E6E6E6',
          gray2: '#F2F2F2',
        },
        line: {
          gray1: '#BFBFBF',
          gray2: '#E6E6E6',
        },
      },
      zIndex: {
        header: 2000,
        menu: 3000,
        floatings: 3500,
        fullModal: 4000,
        modal: 5000,
        bottomSheet: 6000,
        absulute: 9999,
      },
      letterSpacing: {
        '05': '-0.5px',
      },
      backgroundImage: {
        'best-section': "url('/images/BestSection_bg@2x.jpg')",
      },
      boxShadow: {
        floatings: '0px 2px 4px 0px #00000040',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
