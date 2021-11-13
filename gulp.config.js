module.exports = {
  server: {
    proxy: "http://localhost:8888/pour-magnelli.dev",
    notify: false,
  },
  tailwind: "tailwind.config.js",
  scss: {
    src: "theme/src/scss/",
    loadPath: ["node_modules"],
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
  clean: ["theme/dist/css/*.css", "!theme/dist/"],
  tasks: {
    css: true,
    cssVendor: false,
    fonts: false,
    js: false,
    clean: true,
    reload: true,
  },
};
