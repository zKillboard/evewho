var express = require('express');
var router = express.Router();

//const util = require('util')

async function doStuff(req, res, next, controllerFile, pugFile) {
  try {
    const file = res.app.root + '/controllers/' + controllerFile + '.js';
    const controller = require(file);

    let result = await controller(req, res);

    if (result === null) { 
        res.sendStatus(404);
    } else if (typeof result === "object") {
      if (result.json !== undefined) res.json(result.json);
      else res.render(pugFile, result);
    } else if (typeof result == "string") {
      res.redirect(result);
    }

  } catch (e) {
    console.log(e);
  }
}

function addGet(route, controllerFile, pugFile) {
   if (pugFile == undefined) pugFile = controllerFile;
   router.get(route, (req, res, next) => { doStuff(req, res, next, controllerFile, pugFile); }); 
}

addGet('/', 'home');
addGet('/corp/', 'corps');
addGet('/alli/', 'allis');

addGet('/character/:id', 'character');
addGet('/corporation/:id', 'corporation');
addGet('/alliance/:id', 'alliance');

addGet('/pilot/:id', 'character');
addGet('/corp/:id', 'corporation');
addGet('/alli/:id', 'alliance');

addGet('/api/:type/:id', 'api');

// Redirects for old evewho
router.get('/pilot/:id', (req, res, next) => { res.send('/character/' + req.params.id); });
router.get('/corp/:id', (req, res, next) => { res.send('/corporation/' + req.params.id); });
router.get('/alli/:id', (req, res, next) => { res.send('/alliance/' + req.params.id); });

// Search!
router.get('/autocomplete/', async function(req, res, next) {
  const controller = require(res.app.root + '/controllers/autocomplete.js');
  await controller(req, res);
});

module.exports = router;
