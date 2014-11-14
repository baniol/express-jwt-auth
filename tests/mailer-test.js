var superagent = require('superagent');
var should = require('should');
var fs = require('fs');
var config  = require('./config-test');
var host = config.host;

require('./test-server');

var token;
var resetToken;

describe('Forgot Password', function() {

  it('should register a new user', function(done) {
    superagent.post(host + config.signupUrl)
      .send({
        username: config.loginUser.username,
        email: config.loginUser.email,
        password: 'testPassword',
        confirmPassword: 'testPassword'
      })
      .end(function(e, res) {
        res.status.should.eql(200);
        // res.body.should.have.property('msg', 'User successfully registered');
        res.body.should.have.property('token');
        done();
      });
  });

  it('should login in the first user and get token', function(done) {
    superagent.post(host + config.loginUrl)
      .send({
        username: config.loginUser.username,
        password: 'testPassword'
      })
      .end(function(e, res) {
        res.status.should.eql(200);
        res.body.should.have.property('token');
        // Assign returned token to a global variable
        token = res.body.token;
        done();
      });
  });

  it('should return error when email field empty', function(done) {
    superagent.post(host + config.remindPasswordUrl)
      .send({email: ''})
      .end(function(e, res) {
        res.status.should.eql(400);
        res.body[0].should.have.property('param', 'email');
        res.body[0].should.have.property('msg', 'Email cannot be empty');
        done();
      });
  });

  it('remind password with non existing email', function(done) {
    superagent.post(host + config.remindPasswordUrl)
      .send({email: 'asdf@sadf.oo'})
      .end(function(e, res) {
        res.status.should.eql(400);
        res.body[0].should.have.property('param', 'email');
        res.body[0].should.have.property('msg', 'Email not found');
        done();
      });
  });

  it('remind password with an existing email', function(done) {
    superagent.post(host + config.remindPasswordUrl)
      .send({email: config.loginUser.email})
      .end(function(e, res) {
        res.status.should.eql(200);
        // Read a new password from the test file
        link = fs.readFileSync('./testpass.txt', 'utf-8');
        // Get token value from query string
        var resetToken = link.split('=')[1];
        fs.unlink('./testpass.txt');
        // res.body.should.have.property('msg', 'new_password_sent');
        done();
      });
  });

  it('generates a links with a reset token', function(done) {
    superagent.post(host + config.remindPasswordUrl)
      .send({email: config.loginUser.email})
      .end(function(e, res) {
        res.status.should.eql(200);
        // Read a new password from the test file
        link = fs.readFileSync('./testpass.txt', 'utf-8');
        // Get token value from query string
        resetToken = link.split('=')[1];
        fs.unlink('./testpass.txt');
        // res.body.should.have.property('msg', 'new_password_sent');
        done();
      });
  });

  it('sets new password with reset token', function(done) {
    superagent.post(host + config.resetPasswordUrl)
      .send({token: resetToken, password: 'newPassword'})
      .end(function(e, res) {
        res.status.should.eql(200);
        res.body.should.have.property('msg', 'New password set');
        done();
      });
  });

  it('tries to login with the old password', function(done) {
    superagent.post(host + config.loginUrl)
      .send({
        username: config.loginUser.email,
        password: 'testPassword'
      })
      .end(function(e, res) {
        res.status.should.eql(401);
        res.body.should.have.property('msg', 'Unauthorized');
        done();
      });
  });

  it('login with a new password', function(done) {
    superagent.post(host + config.loginUrl)
      .send({
        username: config.loginUser.email,
        password: 'newPassword'
      })
      .end(function(e, res) {
        res.status.should.eql(200);
        res.body.should.have.property('token');
        // Assign returned token to a global variable
        token = res.body.token;
        done();
      });

  });

  it('should remove user one account', function(done) {
    superagent.post(host + config.removeAccountUrl)
      .set('Authorization', 'Bearer ' + token)
      .end(function(e, res) {
        res.status.should.eql(200);
        res.body.should.have.property('msg', 'account_removed');
        done();
      });
  });

});