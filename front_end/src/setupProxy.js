const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://gsmi-backend.cleverlytics.site",
      changeOrigin: true,
      secure: false, // Disable SSL verification for the proxy
    })
  );
};
