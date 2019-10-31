module.exports = getData;

const utf8 = require('utf8');

async function getData(req, res) {
  const name = utf8.encode(req.query.query);

  let result = [];
  let chars = search(res, 'character', name, false);
  let corps = search(res, 'corporation', name, false);
  let corpstickers = search(res, 'corporation', name, true);
  let alli = search(res, 'alliance', name, false);
  let allitickers = search(res, 'alliance', name, true);

  chars = await chars;
  corps = await corps;
  corpstickers = await corpstickers;
  alli = await alli;
  allitickers = await allitickers;

  if (chars.length) result = result.concat(chars);
  if (corps.length) result = result.concat(corps);
  if (corpstickers.length) result = result.concat(corpstickers);
  if (alli.length) result = result.concat(alli);
  if (allitickers.length) result = result.concat(allitickers);

  res.json({ 'suggestions': result });
}

async function search(res, type, name, ticker) {
    try {
      let secondSort = (type == 'character' ? ' ' : ', memberCount desc ');
      let column = (ticker ? ' ticker ' : ' name' );
      let query = 'select ' + type + '_id id, name from ew_' + type + 's where ' + column + ' = ? or ' + column + '  like ? order by name ' + secondSort + ' limit 10';
      let result = await res.app.mysql.query(query, [name, name + '%']);

      let ret = [];
      for (let i = 0; i < result.length; i++ ) {
        row = result[i];
        let add = {value: row.name, data: { 'type': type, groupBy: type + 's',  id: row.id  }};
        ret.push(add);
      }
      return ret;
    } catch (e) { 
      console.log(e);
      return [];
    }
}
