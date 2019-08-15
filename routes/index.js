var express = require('express');
var router = express.Router();

//const util = require('util')

router.get('/', async function(req, res, next) {
  const controller = require(res.app.root + '/controllers/home.js');
  res.render('home', await controller(req, res));
});

router.get('/corp/', async function(req, res, next) {
  const controller = require(res.app.root + '/controllers/corps.js');
  res.render('corps', await controller(req, res));
});

router.get('/alli/', async function(req, res, next) {
  const controller = require(res.app.root + '/controllers/allis.js');
  res.render('allis', await controller(req, res));
});


router.get('/alliance/:id', async function(req, res, next) {
  const controller = require(res.app.root + '/controllers/alliance.js');
  res.render('alliance', await controller(req, res));
});

router.get('/corporation/:id', async function(req, res, next) {
  const controller = require(res.app.root + '/controllers/corporation.js');
  res.render('corporation', await controller(req, res));
});

router.get('/character/:id', async function(req, res, next) {
  const controller = require(res.app.root + '/controllers/character.js');
  res.render('character', await controller(req, res));
});

module.exports = router;
