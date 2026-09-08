// Netlify reserved event function: verified form submissions only.
const { createHandler } = require('../lib/lead-processing');
exports.handler = createHandler();
