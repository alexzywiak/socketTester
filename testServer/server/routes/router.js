/*jslint node: true */
'use strict';

var controller = require('../controllers/controller');

module.exports = function(app) {
  app.get('/', controller.hello);
};
