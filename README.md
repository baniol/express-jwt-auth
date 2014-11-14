## Express Api Authorisation

Middleware for user authorization and authentication with JSON Web Token. Uses MongoDB for user storage.

### Features

* user registration
* user login
* edit user
* password reset via reset link sent in email
* account removal
* keep alive for token expiration time refresh

### Quick start

```bash
npm install express-api-auth
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
var auth = require('express-api-auth')(app, settings);

app.use(bodyParser.json());

app.get('/api/test', auth, function(req, res) {
  res.send('Secured access.');
});

server.listen(3000);

```

### Options

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

### Secured requests

Secured requests must contain a header parameter with JSON Web Token string: `Authorization:Bearer <JWT string>`

### API

###`signup` 

  If the signup request is valid (payload parameters validated: username, email and password) it returns a json object: `{token: <JWT string>}`

##### Errors

> error code `400`

Collection of validation errors. For example: `[{"msg":"Email already exists","param":"email"},{"msg":"Username already exists","param":"username"}]`

###`login`

Successful login (request payload parameters: username and password) returns a json object: `{token: <JWT string>}`

##### Errors

> error code `401`

Object: `{"msg":"Unauthorized"}`

###`editprofile`

If payload parameters are valid (username, email and optional password) a json object: `{token: <JWT string>}`. Updates password only if the password parameter is not empty.

##### Errors ?????

> error code `401` ????

###`removeaccount`

###`checkauth`

Returns code 200 or 401 in case the token is not validated

###`keepalive`

Should be send using intervals. Returns refreshed token: `{token: <JWT string>}`.

###`remindpassword`

If the payload email is validated sends an email with reset password link. Returns: `{"msg":"new_password_sent"}`. Requires nodemailer transport settings.

##### Errors 

> error code `400`

`[{"msg":"Email not found","param":"email"}]`

###`resetpassword`

Sends a new password provided by user. Payload parameters: password string, reset token from query string parameter.

### Tests

### Example Front-End implementation

### License

  [MIT](LICENSE)