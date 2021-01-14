'use strict';

const frontEndHandlingURL =
  'https://rathod-sahaab.github.io/prody/server-response.html' + '?';
// necessary to append question mark
const signalFrontend = (options) => {
  return frontEndHandlingURL + new URLSearchParams(options).toString();
};

module.exports = signalFrontend;
