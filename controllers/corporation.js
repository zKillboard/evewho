module.exports = getData;

async function getData(req, res) {
  req.params.id = parseInt(req.params.id);


  const o = {};
  const details = await req.app.mysql.query('select corp.*, al.name alli_name from ew_corporations corp left join ew_alliances al on corp.alliance_id = al.alliance_id where corporation_id = ?', req.params.id);
  o.details = details[0];
  o.characters = await req.app.mysql.query('select distinct ew.character_id id, name, date_format(start_date, "%Y/%m/%d %H:%i") start_date from ew_characters ew left join ew_history eh on ew.character_id = eh.character_id where ew.corporation_id = 98409330 and eh.corporation_id = 98409330 and end_date is null order by start_date desc limit 50', req.params.id, req.params.id);

  if (o.details.memberCount > 0 && o.details.ceoID > 1) {
    const ceo = await req.app.mysql.query('select character_id, name from ew_characters where character_id = ?', o.details.ceoID);
    if (ceo.length) o.details.ceo_name = ceo[0].name;
  }

  o.title = o.details.name;
  
  return o;
}
