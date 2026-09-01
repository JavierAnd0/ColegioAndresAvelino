// Pre-cargar cloudinary con require() para que Vercel NFT trace todos sus archivos internos
const { createRequire } = require('module');
const req = createRequire(__filename);
req('cloudinary');
req('lodash/compact');
req('lodash/clone');
module.exports = {};
