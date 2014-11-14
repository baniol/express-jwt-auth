var User = require('../models/user');
var async = require('async');

exports.checkIfUserExists = function (user, data, callback) {
  var emailQuery;
  // User found - edit profile
  if (user) {
    var userId = user._id;
    emailQuery = User.findOne({email: data.email, _id: {$ne: userId}});
    usernameQuery = User.findOne({name: data.username, _id: {$ne: userId}});
  }
  else {
    emailQuery = User.findOne({email: data.email});
    usernameQuery = User.findOne({name: data.username,});
  }

  async.series(
    [
      // Checking if the email is unique
      function(callback) {
        emailQuery.exec(function(err, user) {
          if (err) {
            if (userId) {
              logger.error('Error checking email existance on account editing. User ID ' + userId);
            } else {
              logger.debug('Email exists on signup');
            }
          } else {
            if (!user) {
              callback(null);
            } else {
              callback(null, 'email_exists');
            }
          }
        });
      },
      // Checking if the username is unique
      function(callback) {
        usernameQuery.exec(function(err, user) {
          if (err) {
            logger.error('Error checking username existance on account editing. User ID ' + userId);
          } else {
            if (!user) {
              callback(null);
            } else {
              callback(null, 'username_exists');
            }
          }
        });
      }
    ],
    function(err, msgArray) {
      var check = handleErrors(msgArray);
      callback(check);
    }
  );
};

function handleErrors(result) {
  var errors = [];
  if (result.indexOf('email_exists') !== -1) {
    errors.push({msg: 'Email already exists', param: 'email'});
  }
  if (result.indexOf('username_exists') !== -1) {
    errors.push({msg: 'Username already exists', param: 'username'});
  }
  if (errors.length > 0) {
    return errors;
  }
  else {
    return 'user_uniq';
  }
}
