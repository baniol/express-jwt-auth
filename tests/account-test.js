var superagent = require('superagent');
var should = require('should');
var config  = require('./config-test');
var atob = require('atob');
var host = config.host;

var token;
var tokenTwo;

require('./test-server');

describe('Registering', function() {

  it('registering with invalid email', function(done) {
    superagent.post(host + config.signupUrl)
      .send({
        username: 'testUser',
        email: 'user@testco',
        password: 'testpassword'
        // confirmPassword: 'testpassword'
      })
      .end(function(e, res) {
        res.status.should.eql(401);
        res.body[0].should.have.property('param', 'email');
        res.body[0].should.have.property('msg', 'Email is not valid');
        done();
      });
  });

  it('registering with invalid password', function(done) {
    superagent.post(host + config.signupUrl)
      .send({
        username: 'testUser',
        email: 'user@test.co',
        password: 'tes'
        // confirmPassword: 'tes'
      })
      .end(function(e, res) {
        res.status.should.eql(401);
        res.body[0].should.have.property('param', 'password');
        res.body[0].should.have.property('msg', 'Password must be at least 4 characters long');
        done();
      });
  });

  it('registering with invalid username', function(done) {
    superagent.post(host + config.signupUrl)
      .send({
        username: 'tes',
        email: 'user@test.co',
        password: 'testPassword'
        // confirmPassword: 'testPassword'
      })
      .end(function(e, res) {
        res.status.should.eql(401);
        res.body[0].should.have.property('param', 'username');
        res.body[0].should.have.property('msg', 'Username must be at least 4 characters long');
        done();
      });
  });

  it('registering with invalid username, email & password', function(done) {
    superagent.post(host + config.signupUrl)
      .send({
        username: 'te',
        email: 'user@testco',
        password: 'ss'
        // confirmPassword: 'ss'
      })
      .end(function(e, res) {
        res.status.should.eql(401);
        res.body[0].should.have.property('param', 'username');
        res.body[0].should.have.property('msg', 'Username must be at least 4 characters long');
        res.body[1].should.have.property('param', 'email');
        res.body[1].should.have.property('msg', 'Email is not valid');
        res.body[2].should.have.property('param', 'password');
        res.body[2].should.have.property('msg', 'Password must be at least 4 characters long');
        done();
      });
  });

  it('successfull registering', function(done) {
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

  it('registering with existing username', function(done) {
    superagent.post(host + config.signupUrl)
      .send({
        username: config.loginUser.username,
        email: 'user@test.com',
        password: 'testPassword'
        // confirmPassword: 'testPassword'
      })
      .end(function(e, res) {
        res.status.should.eql(409);
        res.body[0].should.have.property('param', 'username');
        res.body[0].should.have.property('msg', 'Username already exists');
        done();
      });
  });

  it('registering with existing email', function(done) {
    superagent.post(host + config.signupUrl)
      .send({
        username: 'testUser2',
        email: config.loginUser.email,
        password: 'testPassword'
        // confirmPassword: 'testPassword'
      })
      .end(function(e, res) {
        res.status.should.eql(409);
        res.body[0].should.have.property('param', 'email');
        res.body[0].should.have.property('msg', 'Email already exists');
        done();
      });
  });

  it('registering with existing username & email', function(done) {
    superagent.post(host + config.signupUrl)
      .send({
        username: config.loginUser.username,
        email: config.loginUser.email,
        password: 'testPassword'
        // confirmPassword: 'testPassword'
      })
      .end(function(e, res) {
        res.status.should.eql(409);
        res.body[0].should.have.property('param', 'email');
        res.body[0].should.have.property('msg', 'Email already exists');
        res.body[1].should.have.property('param', 'username');
        res.body[1].should.have.property('msg', 'Username already exists');
        done();
      });
  });

});

describe('Logging in', function() {

  it('login with wrong username/email', function(done) {
    superagent.post(host + config.loginUrl)
      .send({
        username: config.loginUser.username,
        password: 'testPasswordwrong'
      })
      .end(function(e, res) {
        res.status.should.eql(401);
        res.body.should.have.property('msg', 'Unauthorized');
        done();
      });
  });

  it('login with wrong username/email', function(done) {
    superagent.post(host + config.loginUrl)
      .send({
        username: 'some_user',
        password: 'testPassword'
      })
      .end(function(e, res) {
        res.status.should.eql(401);
        res.body.should.have.property('msg', 'Unauthorized');
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

  it('should check auth request with a valid token', function(done) {
    superagent.post(host + config.checkAuthUrl)
      .set('Authorization', 'Bearer ' + token)
      .end(function(e, res) {
        res.status.should.eql(200);
        done();
      });
  });

});

describe('Edit profile', function () {

  it('should register the second user', function(done) {
    superagent.post(host + config.signupUrl)
      .send({
        username: config.loginUserTwo.username,
        email: config.loginUserTwo.email,
        password: 'testPassword'
        // confirmPassword: 'testPassword'
      })
      .end(function(e, res) {
        res.status.should.eql(200);
        // res.body.should.have.property('msg', 'User successfully registered');
        res.body.should.have.property('token');
        done();
      });
  });

  it('should login in the second user and get token', function(done) {
    superagent.post(host + config.loginUrl)
      .send({
        username: config.loginUserTwo.username,
        password: 'testPassword'
      })
      .end(function(e, res) {
        res.status.should.eql(200);
        res.body.should.have.property('token');
        // Assign returned token to a global variable
        tokenTwo = res.body.token;
        done();
      });
  });

  it('tries to change username to existing', function(done) {
    superagent.post(host + config.editProfileUrl)
      .send({
        username: config.loginUserTwo.username
      })
      .set('Authorization', 'Bearer ' + token)
      .end(function(e, res) {
        res.status.should.eql(409);
        res.body[0].should.have.property('param', 'username');
        res.body[0].should.have.property('msg', 'Username already exists');
        done();
      });
  });

  it('tries to change email to existing', function(done) {
    superagent.post(host + config.editProfileUrl)
      .send({
        email: config.loginUserTwo.email
      })
      .set('Authorization', 'Bearer ' + token)
      .end(function(e, res) {
        res.status.should.eql(409);
        res.body[0].should.have.property('param', 'email');
        res.body[0].should.have.property('msg', 'Email already exists');
        done();
      });
  });

  it('try to change username & email to existing', function(done) {
    superagent.post(host + config.editProfileUrl)
      .send({
        username: config.loginUserTwo.username,
        email: config.loginUserTwo.email
      })
      .set('Authorization', 'Bearer ' + token)
      .end(function(e, res) {
        res.status.should.eql(409);
        res.body[0].should.have.property('param', 'email');
        res.body[0].should.have.property('msg', 'Email already exists');
        res.body[1].should.have.property('param', 'username');
        res.body[1].should.have.property('msg', 'Username already exists');
        done();
      });
  });

  it('changes username', function(done) {
    superagent.post(host + config.editProfileUrl)
      .send({
        username: 'username_changed',
        email: config.loginUser.email
      })
      .set('Authorization', 'Bearer ' + token)
      .end(function(e, res) {
        res.status.should.eql(200);
        // Assigh the new token
        token = res.body;
        var u = JSON.parse(atob(token.split('.')[1]));
        var newName = u.user.name;
        newName.should.eql('username_changed');
        done();
      });
  });

  it('changes email', function(done) {
    superagent.post(host + config.editProfileUrl)
      .send({
        username: config.loginUser.username,
        email: 'email@changed.now'
      })
      .set('Authorization', 'Bearer ' + token)
      .end(function(e, res) {
        res.status.should.eql(200);
        // Assigh the new token
        token = res.body;
        var u = JSON.parse(atob(token.split('.')[1]));
        var newEmail = u.user.email;
        newEmail.should.eql('email@changed.now');
        done();
      });
  });

});

describe('Removing test accounts', function () {
  it('should remove user one account', function(done) {
    superagent.post(host + config.removeAccountUrl)
      .set('Authorization', 'Bearer ' + token)
      .end(function(e, res) {
        res.status.should.eql(200);
        res.body.should.have.property('msg', 'account_removed');
        done();
      });
  });
  it('should remove user two account', function(done) {
    superagent.post(host + config.removeAccountUrl)
      .set('Authorization', 'Bearer ' + tokenTwo)
      .end(function(e, res) {
        res.status.should.eql(200);
        res.body.should.have.property('msg', 'account_removed');
        done();
      });
  });
});