module.exports = getData;

async function getData(req, res) {
  const name = req.query.query;

  let result = [];
  let chars = await search(res, 'character', name);
  if (chars.length) result = result.concat(chars);
  //result.push(await search(res, 'character', name));
  //result.push(await search(res, 'corporation', name));
  //result.push(await search(res, 'alliance', name));

  result = { 'suggestions': result };
  res.json(result);
}

async function search(res, type, name) {
    let result = await res.app.mysql.query('select ' + type + '_id id, name from ew_' + type + 's where name = ? or name like ? order by name limit 10', [name, name + '%']);

    let ret = [];
    for (let i = 0; i < result.length; i++ ) {
        row = result[i];
        let add = {value: row.name, data: { 'type': type, id: row.id  }};
        ret.push(add);
    }
    return ret;
}
