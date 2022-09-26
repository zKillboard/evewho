module.exports = {
   paths: '/',
   get: getData
}


const arrs = ['home:big_alliances', 'home:growing_alliances', 'home:shrinking_alliances', 'home:big_corporations', 'home:growing_corporations', 'home:shrinking_corporations'];

async function getData(req, res) {
  const app = req.app.app;

  const o = {};
  for (let i = 0; i < arrs.length; i++ ) {  
    const key = arrs[i];
    let cached = await app.redis.get(key);
    let value;
    if (cached != null) value = await JSON.parse(cached);
    else value = {};
    o[key.replace('home:', '')] = value;
  }
  o.title = 'Home';
  return {
    view: 'home.pug',
    package: o
  };
}
