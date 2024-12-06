module.exports = {
   paths: '/api/:type/:id',
   get: getData
}


async function getData(req, res) {
  const app = req.app.app;

  if (req.params.type == 'character') return getChar(req, res);
  if (req.params.type == 'corplist') return getCorp(req, res);
  if (req.params.type == 'allilist') return getAlli(req, res);
  return {json: {}};
}

async function getChar(req, res) {
  const app = req.app.app;

  let info = await app.mysql.query('select character_id, corporation_id, alliance_id, faction_id, name, sec_status from ew_characters where character_id = ? limit 1', req.params.id);
  if (info.length == 0) return {status_code: 404} // 404;

  let history = await app.mysql.query('select record_id, corporation_id, date_format(start_date, "%Y/%m/%d %H:%i") start_date, date_format(end_date, "%Y/%m/%d %H:%i") end_date from ew_history where character_id = ?', req.params.id); 

  return { json: { info: info, history: history }};
}

async function getCorp(req, res) {
  const app = req.app.app;

  let info = await app.mysql.query('select corporation_id, name, memberCount from ew_corporations where is_npc_corp = 0 and corporation_id > 0 and corporation_id = ? limit 1', req.params.id);
  if (info.length == 0) return {status_code: 404} // 404;


  let characters = await app.mysql.query('select character_id, name from ew_characters where corporation_id = ?', req.params.id);

  return { json: {info: info, characters: characters} };
}

async function getAlli(req, res) {
  const app = req.app.app;

  let info = await app.mysql.query('select alliance_id, name, memberCount from ew_alliances where alliance_id > 0 and alliance_id = ? limit 1', req.params.id);
  if (info.length == 0) return {status_code: 404} // 404;

  let characters = await app.mysql.query('select character_id, name from ew_characters where alliance_id = ?', req.params.id);

  return { json: {info: info, characters: characters}};
}

