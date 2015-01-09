var User = require('../models/user');
var userHelper = require('../lib/userhelper');
var utils = require('../lib/utils');
var mailer = require('../lib/mailer');
var jwt = require('jwt-simple');
var _ = require('lodash');
var fs = require('fs');
var nconf = require('nconf');
var moment = require('moment');
var logger = require('../lib/logger')();

var tokenSecret = nconf.get('tokenSecret');

function UserController (req, res, next) {}

UserController.prototype.signup = function (req, res, next) {
  req.assert('username', 'Username must be at least 4 characters long').len(4);
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  var errors = req.validationErrors();
  if (errors) {
    res.status(400).json(errors);
    return false;
  }
  var data = req.body;
  userHelper.checkIfUserExists(null, data, function (result) {
    if (result === 'user_uniq') {
      var user = User({
        name: data.username,
        email: data.email,
        password: data.password
      });
      user.save(function(err) {
        if (err) {
          logger.error('Error saving user on signup. User: ' + JSON.stringify(user));
          return next(err);
        }
        res.json({token: generateToken(user)});
      });
    }
    else {
      res.status(409).json(result);
    }
  });
};

UserController.prototype.login = function (req, res, next) {
  req.assert('username', 'Username cannot be blank').notEmpty();
  req.assert('password', 'Password cannot be blank').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    res.status(401).json(errors);
    return false;
  }
  var self = this;
  var username = req.body.username;
  User.findOne({$or: [{email: username}, {name: username}]}, function(err, user) {
    if (!user) return res.status(401).json({msg: 'Unauthorized'});
    user.comparePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) return res.status(401).json({msg: 'Unauthorized'});
      // Save user data to object
      self.user = user;
      var token = generateToken(user);
      res.json({ token: token });
    });
  });
};

UserController.prototype.removeAccount = function (req, res, next) {
  User.remove({_id: req.user._id}, function(err) {
    if (!err) {
      if (nconf.get('removeCallback')) {
        nconf.get('removeCallback')(req.user._id);
      }
      res.status(200).send({msg: 'account_removed'});
    }
    else {
      logger.error('Error removing user account. User id : ' + req.user._id);
    }
  });
};

UserController.prototype.editProfile = function (req, res, next) {
  var data = req.body;
  req.assert('username', 'Username must be at least 4 characters long').len(4);
  req.assert('email', 'Email is not valid').isEmail();
  if (data.password) {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
  }
  var errors = req.validationErrors();
  if (errors) {
    res.status(400).json(errors);
    return false;
  }
  userHelper.checkIfUserExists(req.user, data, function (result) {
    if (result === 'user_uniq') {
      User.findOne({_id: req.user._id}, function (err, user) {
          if (!user) {
            logger.info('User not found for account update. User id : ' + req.user._id);
            return;
          }
          else {
            var updated = [];
            if (user.email !== data.email) {
              updated.push('email');
              user.email = data.email;
            }
            if (user.name !== data.username) {
              updated.push('name');
              user.name = data.username;
            }
            if (data.password !== '') {
              updated.push('password');
              user.password = data.password;
            }
            if (updated.length > 0) {
              user.date_modified = Date.now();
              var out = {
                name: user.username,
                email: user.email
              };
            }
            else {
              res.json({msg: 'Data not modified'});
              return;
            }

            user.save(function(err) {
              if (err) {
                logger.error('Error updating user account. User id: ' + req.user._id + ' Err: ' + err);
                res.status(401).json({msg: 'update_error'});
              }
              else {
                var newToken = generateToken(user);
                res.json({token: newToken});
              }
            });
          }
        });
    }
    else {
      res.status(409).json(result);
    }
  });
};

UserController.prototype.remindPassword = function(req, res) {
  var email = req.body.email;
  var url = req.body.url;
  if (email === '' || !email) {
    res.status(400).json([{msg: 'Email cannot be empty', param: 'email'}]);
    return;
  }
  if (url === '' || !url) {
    res.status(400).json([{msg: 'Url for reset password link is not specified', param: 'url'}]);
    return;
  }
  User.findOne({email: email}, function(err, user) {
    if (!user) {
      logger.info('User not found based on email for password reset. Email requested: ' + email);
      res.status(400).json([{msg: 'Email not found', param: 'email'}]);
    }
    else {
      // Generate random password
      var resetToken = utils.randomString(16);
      user.resetToken = resetToken;
      // Generate reset password link
      var link = url + nconf.get('urlStrings').resetpassword + '?token=' + resetToken;
      user.save(function(err) {
        if (err) {
          logger.error('Error saving user new password');
        }
        else {
          logger.info('New password generated for user id: ' + user._id);
          mailer.sendMessage(user, link, function (err, info) {
            if (err) {
              logger.error('Sending message error : ' + err);
              res.status(401).json({msg: 'error_sending_password'});
            }
            else {
              if (process.env.ENV === 'testing') {
                // Write new password to a file
                fs.writeFileSync("./testpass.txt", link);
              }
              logger.info('Remind password message sent to email : ' + user.email);
              var resp = {};
              resp.msg = 'new_password_sent';
              res.status(200).json(resp);
            }
          });
        }
      });
    }
  });
};

UserController.prototype.resetPassword = function (req, res, next) {
  var token = req.body.token;
  var password = req.body.password;

  if (token === '' || password === '') {
    res.status(400).send('Token or password not provided');
    return;
  }
  User.findOne({resetToken: token}, function(err, user) {
    if (!user) {
      logger.error('User not found resetToken: ' + token);
      res.status(400).send('User not found');
    }
    else {
      user.resetToken = '';
      user.password = password;
      user.save(function(err) {
        if (err) {
          logger.error('Error saving reset password');
        }
        else {
          logger.info('Reset password by user with id: ' + user._id);
          res.json({msg: 'New password set'});
        }
      });
    }
  });
};

UserController.prototype.checkAuth = function (req, res, next) {
  var token = getToken(req);
  if (token) {
    try {
      var decoded = jwt.decode(token, tokenSecret);
      // Difference in seconds
      var diff = parseInt((Date.now() - decoded.iat) / 1000, 10);
      if (nconf.get('tokenExpire') < diff) {
        res.send(401, 'Access token has expired');
      }
      else {
        req.user = decoded.user;
        return next();
      }
    }
    catch (err) {
      return res.status(500).send('Error parsing token');
    }
  }
  else {
    return res.send(401);
  }
};

UserController.prototype.keepAlive = function (req, res, next) {
  var token = getToken(req);
  try {
    // @TODO code duplication
    var decoded = jwt.decode(token, tokenSecret);
    var diff = parseInt((Date.now() - decoded.iat) / 1000, 10);
    if (nconf.get('tokenExpire') < diff) {
        res.send(401, 'Access token has expired');
      }
    else {
      User.findOne({_id: decoded.user._id}, function (err, user) {
        if (err || !user) {
          logger.error('KeepAlive, issue generating token for user id : ' + decoded.user._id);
          res.status(400).json({error: 'Issue generating token'});
        }
        else {
          res.json({token: generateToken(user)});
        }
      });
    }
  }
  catch (e) {
    logger.error('KeepAlive error: decoding token failed.');
    res.status(400).send('Unauthorized');
  }
}

function getToken(req) {
  if (req.headers.authorization) {
    return req.headers.authorization.split(' ')[1];
  }
  else {
    return false;
  }
}

function generateToken(user) {
  // Remove password property from user object
  // _.omit doesn't work for mongoose object
  user = _.pick(user, '_id', 'name' ,'email');
  var payload = {
    user: user,
    iat: new Date().getTime(),
    exp: moment().add(7, 'days').valueOf()
  };
  return jwt.encode(payload, tokenSecret);
}

module.exports = new UserController();
