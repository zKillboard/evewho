var express = require('express');
var router = express.Router();

//const util = require('util')

async function doStuff(req, res, next, controllerFile, pugFile) {
  try {
    const file = res.app.root + '/controllers/' + controllerFile + '.js';
    const controller = require(file);

    let result = await controller(req, res);

    if (typeof result == "object") {
      res.render(pugFile, result);
    } else if (typeof result == "string") {
      res.redirect(result);
    } else {
        res.sendStatus(404);
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

router.get('/autocomplete/', async function(req, res, next) {
  const controller = require(res.app.root + '/controllers/autocomplete.js');
  await controller(req, res);
});

module.exports = router;
