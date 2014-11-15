## Express JWT Auth

Middleware for user authorization and authentication with JSON Web Token. Uses MongoDB for data storage.

**The module is in early beta stage.**

### Features

* user signup
* user login
* profile edit
* password reset
* account removal
* keep alive for token renewal

### Quick start

```bash
npm install express-jwt-auth
```

#### Example integration:

```javascript
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
var auth = require('express-jwt-auth')(app, settings);

app.use(bodyParser.json());

app.get('/api/test', auth, function(req, res) {
  res.send('Secured access.');
});

server.listen(3000);

```

### Securing routes

express-api-auth is a middleware meaning you can pass the module to express routing as an agrument, as in the integration example above: `app.get('/api/test', auth, function(req, res) { ...`

### Options

Name | Default value | Description
--- | --- | ---
`dbname` | express-api-auth | MongoDB database name.
`urlStrings` | {<br>signup: '/signup',<br>login: '/login',<br>remindpassword: '/remindpassword',<br>resetpassword: '/resetpassword',<br>checkauth: '/checkauth',<br>keepalive: '/keepalive',<br>editprofile: '/editprofile',<br>removeaccount: '/removeaccount'<br>} | Object with url strings.
`removeCallback` | - | Execute a callback on account remove. The callback returns removed user id.
`logFile` | - | Log file name/path.
`tokenSecret` | 53cr3t-h3re-p9t | String for salting token encryption.
`serviceUrl` | http://example.com/# | Url for reset password link. Should contain trailing slash or hashbang if needed.
`tokenExpire` | 300 | Token expiration period in seconds.
`corsDomains` | - | Array with allowed domains. Ex. `['http://mydomain.com', 'http://example.com']`
`mailer` | - | Transport settings for nodemailer module. [More details](https://github.com/andris9/Nodemailer#examples)

### Secured requests

Secured requests must contain a header parameter with JSON Web Token string: `Authorization:Bearer <JWT string>`

### API

###`signup`

  If the signup request is valid (payload parameters validated: username, email and password) it returns a json object: `{token: <JWT string>}`

##### Errors

If the payload data is invalid (username, email, password) the server returns a collection of error objects, for example: `[{"param":"username","msg":"Username must be at least 4 characters long","value":"dd"},{"param":"password","msg":"Password must be at least 4 characters long","value":"ee"}]` with status code `400`.

In case of data conflict (existing username or email): `[{"msg":"Email already exists","param":"email"},{"msg":"Username already exists","param":"username"}]`. Status code is `409`.

###`login`

Successful login (request payload parameters: username and password) returns a json object: `{token: <JWT string>}`

##### Errors

Object: `{"msg":"Unauthorized"}`. Status code `401`.

###`editprofile`

If payload parameters are valid (username, email and optional password) retuns a json object: `{token: <JWT string>}`. Updates password only if the password string is not empty.

##### Errors

The same as for `signup`.

###`removeaccount`

###`checkauth`

Returns code 200 or 401 in case the token is not validated

###`keepalive`

Should be send using intervals. Returns refreshed token: `{token: <JWT string>}`.

###`remindpassword`

If the payload email is validated sends an email with reset password link. Returns: `{"msg":"new_password_sent"}`. Requires nodemailer transport settings.

##### Errors 

`[{"msg":"Email not found","param":"email"}]`. Status code `400`.

###`resetpassword`

Sends a new password provided by user. Payload parameters: password string, reset token from query string parameter.

### Tests

Run tests with `npm test`.

### Example Front-End implementation

Angularjs example can be found in `examples` directory: [https://github.com/baniol/express-jwt-auth/tree/master/examples](https://github.com/baniol/express-jwt-auth/tree/master/examples).

Follow the instructions from the readme file.

### License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2014 Marcin Baniowski <http://baniowski.net>