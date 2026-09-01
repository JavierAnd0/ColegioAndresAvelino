// Entry point CommonJS para Vercel Serverless
// require() permite que el bundler NFT de Vercel trace todos los archivos internos de cloudinary
require('cloudinary');

let appPromise;

function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const { default: connectDB } = await import('../src/config/database.js');
      const { default: app } = await import('../src/app.js');
      await connectDB();
      return app;
    })();
  }
  return appPromise;
}

module.exports = async (req, res) => {
  const app = await getApp();
  return app(req, res);
};
