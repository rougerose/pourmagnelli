module.exports = ({ env }) => ({
  plugins: [
    require("tailwindcss"),
    require("autoprefixer"),
    env === "production" ? require("postcss-csso")() : false,
  ],
});
