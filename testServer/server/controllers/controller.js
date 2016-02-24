/*jslint node: true */
'use strict';

module.exports = {
  hello: function(req, res){
    res.status(200).send('Well hello there!');
  }
};