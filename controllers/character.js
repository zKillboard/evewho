module.exports = getData;

async function getData(req, res) {
  const o = {};
  let details = await req.app.mysql.query('select ch.character_id, ch.name, ch.corporation_id, corp.name corp_name, ch.alliance_id, al.name alli_name from ew_characters ch left join ew_corporations corp on ch.corporation_id = corp.corporation_id left join ew_alliances al on ch.alliance_id = al.alliance_id where character_id = ?', req.params.id);

  if (details.length == 0) {
    req.params.id = req.params.id.replace(/\+/g, ' ');
    details = await req.app.mysql.query('select character_id from ew_characters where name = ?', req.params.id);
    if (details.length == 0) details = await req.app.mysql.query('select character_id from ew_characters where name = ?', req.params.id + '.');
    if (details.length > 0) return '/character/' + details[0].character_id;
  }

  if (details.length == 0) return undefined;

  o.details = details[0];
  o.history = await req.app.mysql.query('select eh.corporation_id id, ec.name, date_format(start_date, "%Y/%m/%d %H:%i") start_date , date_format(end_date, "%Y/%m/%d %H:%i") end_date from ew_history eh left join ew_corporations ec on eh.corporation_id = ec.corporation_id where character_id = ? order by record_id desc', req.params.id);

  if (details[0].corporation_id == 1000001) {
    o.history.unshift({id: 1000001, name: 'Doomheim (character recycled)'});
  }

  o.title = o.details.name;
  
  return o;
}
