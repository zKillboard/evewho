module.exports = f;

async function f(app) {
  let result = await app.phin('https://esi.evetech.net/latest/alliances/');
  let alliances = result.body;
  for (let i = 0; i < alliances.length; i++ ) {
    await app.mysql.query('insert ignore into ew_alliances (alliance_id) values (?)', alliances[i]);
  }
}
