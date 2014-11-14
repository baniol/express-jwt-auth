var log4js = require('log4js');
var path = require('path');
var nconf = require('nconf');

module.exports = function () {

  var logFile = process.env.ENV !== 'testing' ? nconf.get('logFile') : '';

  if (process.env.ENV !== 'testing') {
    log4js.loadAppender('file');
    logFile = log4js.appenders.file(logFile);
    log4js.addAppender(logFile, 'auth');
  }
  else {
    log4js.clearAppenders();
  }

  var logger = log4js.getLogger('auth');

  if (process.env.ENV === 'production') {
    logger.setLevel('ERROR');
  }

  if (process.env.ENV === 'development' || !process.env.ENV) {
    logger.setLevel('ALL');
  }

  return logger;

};