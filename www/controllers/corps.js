module.exports = {
   paths: '/corp/',
   get: getData
}


const arrs = ['corp:top_member_count1','corp:top_member_count2','corp:highest_activity1','corp:highest_activity2','corp:pirate_corporations1','corp:pirate_corporations2','corp:carebear_corporations1','corp:carebear_corporations2','corp:newest_25_members1','corp:newest_25_members2','corp:newest_recruiting1','corp:newest_recruiting2','corp:growing_corporations1','corp:growing_corporations2','corp:shrinking_corporations1','corp:shrinking_corporations2'];

async function getData(req, res) {
  const app = req.app.app;

  const o = {};
  for (let i = 0; i < arrs.length; i++ ) {  
    const key = arrs[i];
    const value = await JSON.parse(await app.redis.get(key));
    o[key.replace('corp:', '')] = value;
  }
  o.title = 'Corporations';
  return {
    package: o,
    view: 'corps.pug'
  };
}
