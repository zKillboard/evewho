module.exports = {
   paths: '/autocomplete/',
   get: getData
}


const utf8 = require('utf8');

async function getData(req, res) {
  const app = req.app.app;
  
  const name = utf8.encode(req.query.query);

  let result = [];
  let chars = search(res, app, 'character', name, false);
  let corps = search(res, app, 'corporation', name, false);
  let corpstickers = search(res, app, 'corporation', name, true);
  let alli = search(res, app, 'alliance', name, false);
  let allitickers = search(res, app, 'alliance', name, true);

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

  return {
    json: { 'suggestions': result }
  };
}

const search_query = 'select :type_id id, name :moreInfo from ew_:types where :column = ? or :column like ? order by name :secondSort limit 10';

async function search(res, app, type, name, ticker) {
    try {
      let moreInfo = (type == 'character' ? ', corporation_id ' : ', memberCount');
      let secondSort = (type == 'character' ? ' ' : ', memberCount desc ');

      let column = (ticker ? ' ticker ' : ' name' );
      let query = search_query
        .replace(/:type/g, type)
        .replace(/:moreInfo/g, moreInfo)
        .replace(/:column/g, column)
        .replace(/:secondSort/g, secondSort);
      let result = await app.mysql.query(query, [name, name + '%']);

      let ret = [];
      for (let i = 0; i < result.length; i++ ) {
        row = result[i];
        if (type == 'character' && row.corporation_id == 1000001) row.name = row.name + ' (recycled)';
        else if (row.memberCount == 0) row.name = row.name + ' (closed)';
        let add = {value: row.name, data: { 'type': type, groupBy: type + 's',  id: row.id  }};
        ret.push(add);
      }
      return ret;
    } catch (e) { 
      console.log(e);
      return [];
    }
}
