module.exports = getData;

const utf8 = require('utf8');

async function getData(req, res) {
  const name = utf8.encode(req.query.query);

  await res.app.mysql.query('insert ignore into ew_unprocessed (name) values (?)', name);

  let result = [];
  let chars = await search(res, 'character', name, false);
  if (chars.length) result = result.concat(chars);

  let corps = await search(res, 'corporation', name, false);
  if (corps.length) result = result.concat(corps);
  let corpstickers = await search(res, 'corporation', name, true);
  if (corpstickers.length) result = result.concat(corpstickers);

  let alli = await search(res, 'alliance', name, false);
  if (alli.length) result = result.concat(alli);
  let allitickers = await search(res, 'alliance', name, true);
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
