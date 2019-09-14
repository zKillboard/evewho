module.exports = getData;

const utf8 = require('utf8');

async function getData(req, res) {
  const name = utf8.encode(req.query.query);

  //await res.app.mysql.query('insert ignore into ew_unprocessed (name) values (?)', name);

  let result = [];
  let chars = await search(res, 'character', name);
  if (chars.length) result = result.concat(chars);
  let corps = await search(res, 'corporation', name);
  if (corps.length) result = result.concat(corps);
  let alli = await search(res, 'alliance', name);
  if (alli.length) result = result.concat(alli);

  res.json({ 'suggestions': result });
}

async function search(res, type, name) {
    let secondSort = (type == 'character' ? ' ' : ', memberCount desc ');
    let query = 'select ' + type + '_id id, name from ew_' + type + 's where name = ? or name like ? order by name ' + secondSort + ' limit 10';
    let result = await res.app.mysql.query(query, [name, name + '%']);

    let ret = [];
    for (let i = 0; i < result.length; i++ ) {
        row = result[i];
        let add = {value: row.name, data: { 'type': type, groupBy: type + 's',  id: row.id  }};
        ret.push(add);
    }
    return ret;
}
