module.exports = {
   paths: '/api/:type/:id',
   get: getData
}


async function getData(req, res) {
  const app = req.app.app;

  if (req.params.type == 'character') return getChar(req, res);
  if (req.params.type == 'corplist') return getCorp(req, res);
  if (req.params.type == 'allilist') return getAlli(req, res);
  
  // CorpDeparted, change path if needed, this is draft!
  if (req.params.type == 'corpdeparted') return getCorpDeparted(req, res);
  // CorpJoined, change path if needed, this is draft!
  if (req.params.type == 'corpjoined') return getCorpJoined(req, res);

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

async function getCorpDeparted(req, res) {
  const app = req.app.app;
  
  // TODO: Need to check compatibility, since Nullish coalscing needs node 14 at least.
  const page = (req.query.page ?? 0)
  const offset = 50 * (page - 1)
  const info = await app.mysql.query('select corporation_id, name, memberCount from ew_corporations where is_npc_corp = 0 and corporation_id > 0 and corporation_id = ? limit 1', req.params.id);
  
  if (info.length == 0)return {status_code: 404} // 404;

  query = 'select h.character_id id, name, date_format(start_date, "%Y/%m/%d %H:%i") start_date, date_format(end_date, "%Y/%m/%d %H:%i") end_date from ew_history h left join ew_characters c on h.character_id = c.character_id where end_date is not null and h.corporation_id = ? order by end_date desc limit 50 offset ?' 

  const result = await app.mysql.query(query, [req.params.id, offset]) 
  
  return { json: {info: info, page: page, characters: result} } 
}

async function getCorpJoined(req, res) {
  const app = req.app.app;
  
  // TODO: Need to check compatibility, since Nullish coalscing needs node 14 at least.
  const page = (req.query.page ?? 0)
  const offset = 50 * (page - 1)
  const info = await app.mysql.query('select corporation_id, name, memberCount from ew_corporations where is_npc_corp = 0 and corporation_id > 0 and corporation_id = ? limit 1', req.params.id);
  
  if (info.length == 0)return {status_code: 404} // 404;

  query = 'select h.character_id id, name, date_format(start_date, "%Y/%m/%d %H:%i") start_date, date_format(end_date, "%Y/%m/%d %H:%i") end_date from ew_history h left join ew_characters c on h.character_id = c.character_id where h.corporation_id = ? order by start_date desc limit 50 offset ?'
  
  const result = await app.mysql.query(query, [req.params.id, offset]) 
  
  return { json: {info: info, page: page, characters: result} } 
}
