'use strict';
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// configure our server with all the middleware and and routing
require('./server/server.js')(app, express, io);

// export our app for testing and flexibility, required by index.js
var port = process.env.PORT || 3000;

http.listen(port, function(){
  console.log('Making Digital Magic on ' + port);
});

module.exports = app;