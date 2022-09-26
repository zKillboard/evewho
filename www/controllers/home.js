module.exports = getData;

const arrs = ['home:big_alliances', 'home:growing_alliances', 'home:shrinking_alliances', 'home:big_corporations', 'home:growing_corporations', 'home:shrinking_corporations'];

async function getData(req, res) {
  const o = {};
  for (let i = 0; i < arrs.length; i++ ) {  
    const key = arrs[i];
    const value = await JSON.parse(await res.app.redis.get(key));
    o[key.replace('home:', '')] = value;
  }
  o.title = 'Home';
  return o;
}
