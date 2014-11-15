# Express Api Authorisation

`express-api-auth` is a request authorizatoin express middleware. It makes use of JSON Web Token for user authorization.

## Features
* user registration
* user login
* edit user
* password reset via reset link sent in email
* account removal
* keep alive for token expiration time refresh

## Quick start

`npm install express-api-auth`

### Example of the module integration in your server js file:

```
var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);
var path = require('path');
var bodyParser = require('body-parser');

var settings = {
  dbname: 'simple-api-auth',
  logFile: path.join(__dirname, 'authlogger.log'),
  corsDomains: ['http://localhost:5000'],
  // Nodemailer settings, used for resetting password
  mailer: {
    mailerFrom    : 'your.mail@example.com',
    mailerTitle   : 'Password reset',
    transporter   : {
      service: 'Gmail',
      auth: {
        user: 'your.mail@gmail.com',
        pass: '<app_token>'
      }
    }
  }
};
var auth = require('express-api-auth')(app, settings);

app.use(bodyParser.json());

app.get('/api/test', auth, function(req, res) {
  res.send('Secured access.');
});

server.listen(3000);

```

## Options

Name | Default value | Description
--- | --- | ---
`dbname` | express-api-auth | MongoDB database name.
`urlStrings` | {<br>signup: '/signup',<br>login: '/login',<br>remindpassword: '/remindpassword',<br>resetpassword: '/resetpassword',<br>checkauth: '/checkauth',<br>keepalive: '/keepalive',<br>editprofile: '/editprofile',<br>removeaccount: '/removeaccount'<br>} | Object with url strings.
`removeCallback` | - | Execute a callback on account remove. The callback returns removed user id.
`logFile` | - | Log file name/path.
`tokenSecret` | 53cr3t-h3re-p9t | String for salting token encryption (TODO).
`serviceUrl` | http://example.com/# | Url for reset password link. Should contain trailing slash or hashbang if needed.
`tokenExpire` | 300 | Token expiration period in seconds.
`corsDomains` | - | Array with allowed domains. Ex. `['http://mydomain.com', 'http://example.com']`
`mailer` | - | Object for nodemailer module. For details see .... TODO ...

## API

Below are the default urls, that can be customized via settings.

Url | Method | Parameters | Returns | Description
--- | --- | --- | --- | ---
`auth/signup` | POST {| username, email, password} | -| registering user
`auth/login` | POST | {username/email, password} | - | logging in
`auth/editprofile` | POST | {username, email, password} | - | 
`auth/removeaccount` POST | - | {}
`auth/checkauth` | POST | {} | empty string | check if a request with a given token is authorized
`auth/keepalive` | POST | {} | token string | request for refreshing token expiration date
`remindpassword` | POST | {email} | - | request for reset link, sent via email
`resetpassword` | POST | {password} | - | sending a new password

## Tests

## Example Front-End implementation
