module.exports = {
  server: {
    proxy: "http://localhost:8888/pour-magnelli.dev",
    notify: false,
  },
  tailwind: "tailwind.config.js",
  scss: {
    src: "theme/src/scss/",
  },
  css: {
    src: "theme/src/css/",
    dest: "theme/dist/css/",
  },
  js: {
    src: ["theme/src/js/main.js"],
    dest: "theme/dist/js/",
    name: "main.js",
  },
  html: {
    src: "squelettes/**/*.html",
  },
  clean: ["theme/dist/**/*", "!theme/dist/"],
  tasks: {
    css: true,
    cssVendor: false,
    fonts: false,
    js: false,
    clean: true,
    reload: true,
  },
};
