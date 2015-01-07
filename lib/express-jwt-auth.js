var expressValidator = require('express-validator');
var mongoose = require('mongoose');
var cors = require('cors');
var path = require('path');
var bodyParser = require('body-parser');
var nconf = require('nconf');
var extend = require('util')._extend;

var configFile = path.join(__dirname, '..', 'config.json');
var corsOptions = {};

nconf.file({ file: configFile});

module.exports = function (app, options) {
  // Initialize module with custom settings
  if (!options) {
    throw Error('You have to provide options object!');
  }
  if (options.logFile)  {
    nconf.set('logFile', options.logFile);
  }
  if (options.tokenSecret) {
    nconf.set('tokenSecret', options.tokenSecret);
  }
  if (options.tokenExpire) {
    nconf.set('tokenExpire', options.tokenExpire);
  }
  if (options.mailer) {
    nconf.set('mailerSettings', options.mailer);
  }
  if (options.serviceUrl) {
    nconf.set('serviceUrl', options.serviceUrl);
  }
  if (options.serviceUrlSeparator) {
    nconf.set('serviceUrlSeparator', options.serviceUrlSeparator);
  }
  if (options.removeCallback && typeof options.removeCallback === 'function') {
    nconf.set('removeCallback', options.removeCallback);
  }
  // Including userController after options setting is done
  var userController = require('../controllers/user');

  if (options.corsDomains) {
    var whitelist = options.corsDomains;
    corsOptions = {
      origin: function(origin, callback){
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
      }
    };
  }

  var urlStrings = {
    signup: '/signup',
    login: '/login',
    remindpassword: '/remindpassword',
    resetpassword: '/resetpassword',
    checkauth: '/checkauth',
    keepalive: '/keepalive',
    editprofile: '/editprofile',
    removeaccount: '/removeaccount'
  };

  if (options.urlStrings) {
    extend(urlStrings, options.urlStrings);
  }

  app.use(cors(corsOptions));
  app.use(bodyParser.json());
  app.use(expressValidator());

  // User routes
  app.post(urlStrings.signup, userController.signup);
  app.post(urlStrings.login, userController.login);
  app.post(urlStrings.remindpassword, userController.remindPassword);
  app.post(urlStrings.resetpassword, userController.resetPassword);
  app.post(urlStrings.checkauth, userController.checkAuth, function (req, res) {res.send('');});
  app.post(urlStrings.keepalive, userController.keepAlive);
  app.post(urlStrings.editprofile, userController.checkAuth, userController.editProfile);
  app.post(urlStrings.removeaccount, userController.checkAuth, userController.removeAccount);

  return userController.checkAuth;
};
