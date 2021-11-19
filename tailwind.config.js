const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  corePlugins: {
    container: false,
    fontSmoothing: false,
  },
  mode: "jit",
  purge: [
    "./squelettes/body.html",
    "./squelettes/content/*.html",
    "./squelettes/header/*.html",
    "./squelettes/images/*.html",
    "./squelettes/inclure/**/*.html",
    "./squelettes/formulaires/**/*.html",
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ['"GSN"', ...defaultTheme.fontFamily.sans],
      mono: defaultTheme.fontFamily.mono,
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.warmGray,
      red: {
        500: "#e51a1a1",
      },
    },
    extend: {
      fontSize: {
        "2xs": ".625rem",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
