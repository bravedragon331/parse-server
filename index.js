// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://gram:tHsrW5mz@ds057386.mlab.com:57386/gram-research-dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'Gram-Research-Server-Local',
  masterKey: process.env.MASTER_KEY || 'gramResearchLocalMastaKey', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse'  // Don't forget to change to https if needed

});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

var bodyParser = require('body-parser');
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
// Middleware for reading request body
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});


if (process.env.ENABLE_DASHBOARD == "true" || true) {
  console.log("WARNING** DASHBOARD ENABLED");
  var ParseDashboard = require('parse-dashboard');
  var dashboard = new ParseDashboard({
    "apps": [
      {
        "serverURL": process.env.SERVER_URL || 'http://localhost:1337/parse',
        "appId": process.env.APP_ID || 'Gram-Research-Server-Local',
        "masterKey": process.env.MASTER_KEY || 'gramResearchLocalMastaKey',
        "appName": process.env.APP_ID || 'Gram Research Server Local'
      }
    ],
    "users":   [
    {
      "user":"admin",
      "pass":"ofthegram!"
    }]
  }, true);
  app.use('/dashboard', dashboard);
}


var auth = require('basic-auth')
var basicAuth = function(req, res, next) {
  console.log("Standard Auth");
    var userAuth = auth(req);

    if (userAuth === undefined) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
        res.end('Unauthorized Dude');
    } else {
          console.log('logging in with: ' + userAuth['name'] + ", " + userAuth['pass']);
      if ((userAuth['name'] == 'admin' && userAuth['pass'] == 'tHsrW5mz') || (userAuth['name'] == 'admin' && userAuth['pass'] == 'ofthegram!')) {
        next();
      } else {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
        res.end('Unauthorized : not admin');
      }
    }
};



var adminController 	= require('./cloud/controllers/admin_controller.js');
app.get('/peripherals',basicAuth, adminController.peripheralList);
app.get('/peripherals/:id', basicAuth, adminController.peripheral);
