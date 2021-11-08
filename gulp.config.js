module.exports = {
  server: {
    proxy: "http://localhost:8888/pour-magnelli.dev",
    notify: false,
  },
  tailwind: "tailwind.config.js",
  scss: {
    src: "src/scss/",
  },
  css: {
    src: "src/css/",
    dest: "dist/css/",
  },
  js: {
    src: ["src/js/main.js"],
    dest: "dist/js/",
    name: "main.js",
  },
  clean: ["dist/**/*", "!dist/"],
  tasks: {
    css: true,
    cssVendor: false,
    fonts: false,
    js: false,
    clean: true,
    reload: true,
  },
};
