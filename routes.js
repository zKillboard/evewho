var express = require('express');
var router = express.Router();

//const util = require('util')

async function doStuff(req, res, next, controllerFile, pugFile) {
  try {
    const file = res.app.root + '/controllers/' + controllerFile + '.js';
    const controller = require(file);

    let result = await controller(req, res);

    if (result === null || result === undefined) { 
      const isApiLike = req.path.startsWith('/api/') || req.path.startsWith('/list/') || req.xhr;
      if (isApiLike) {
        res.sendStatus(404);
      } else {
        const server_started = (req.app && req.app.app && req.app.app.server_started) || Date.now();
        res.status(404).render('404.pug', {
          requested_path: req.originalUrl,
          title: 'Not Found',
          server_started
        });
      }
    } else if (typeof result === "object") {
      if (result.json !== undefined) res.json(result.json);
      else res.render(pugFile, result);
    } else if (typeof result == "string") {
      res.redirect(result);
    }

  } catch (e) {
    console.error('[' + new Date().toISOString() + '] Error in ' + controllerFile + ':', e);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
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

addGet('/list/corp/char/current/:id/:page', 'corp_char_current', 'history_rows');
addGet('/list/corp/char/joined/:id/:page', 'corp_char_joined', 'history_rows');
addGet('/list/corp/char/departed/:id/:page', 'corp_char_departed', 'history_rows');
addGet('/list/alli/corp/current/:id/:page', 'alli_corp_current', 'history_rows');
addGet('/list/alli/corp/joined/:id/:page', 'alli_corp_joined', 'history_rows');
addGet('/list/alli/corp/departed/:id/:page', 'alli_corp_departed', 'history_rows');
addGet('/api/:type/:id', 'api');

// Redirects for old evewho
router.get('/pilot/:id', (req, res, next) => { res.send('/character/' + req.params.id); });
router.get('/corp/:id', (req, res, next) => { res.send('/corporation/' + req.params.id); });
router.get('/alli/:id', (req, res, next) => { res.send('/alliance/' + req.params.id); });

addGet('/autocomplete/:query', 'autocomplete');

module.exports = router;
