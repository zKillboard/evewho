var express = require('express');
var router = express.Router();

//const util = require('util')

router.get('/', async function(req, res, next) {
  const controller = require(res.app.root + '/controllers/home.js');
  res.render('home', await controller(res));
});

router.get('/corps/', async function(req, res, next) {
  const controller = require(res.app.root + '/controllers/corps.js');
  res.render('corps', await controller(res));
});

module.exports = router;
