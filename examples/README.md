### AngularJS authorisation example.

### Installation

#### Prepare the express server with the express-jwt-module

Set up a nodejs server in a separate directory with `package.json` and `server.js` files:

```json
{
  "name": "express-jwt-auth-demo",
  "version": "0.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.9.7",
    "mongoose": "^3.8.16",
    "express-jwt-auth": "*",
    "body-parser": "^1.9.2"
  }
}
```

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

#### Install and run angularjs example

Make sure you have `node`, `npm`, `gulp` and `bower` installed.

* `npm install`
* `bower install`

To run the project locally: `gulp serve`.

### Resources
This example is based on: [https://github.com/sahat/tvshow-tracker](https://github.com/sahat/tvshow-tracker)