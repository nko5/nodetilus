const rest = require('rest');
const mime = require('rest/interceptor/mime');
const errorCode = require('rest/interceptor/errorCode');

module.exports = rest.wrap(mime).wrap(errorCode, { code: 500 });