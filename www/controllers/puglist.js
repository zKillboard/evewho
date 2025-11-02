module.exports = {
	paths: '/pug/list/:id/:which/:page',
	get: getData
}

async function getData(req, res) {
	const app = req.app.app;

	let offset = 250 * (req.params.page - 1);
	if (offset < 0 || offset > 10000) return { package: { characters: [], left: [], right: [] }, ttl: 86400}; 
	if (req.params.id < 1999999) return { package: { characters: [], left: [], right: [] }, ttl: 86400}; // Ignore NPC corps

	let query, left = false, right = false;
	switch (req.params.which) {
		case 'current':
			query = 'select h.character_id id, c.name, date_format(start_date, "%Y/%m/%d %H:%i") start_date from ew_history h left join ew_characters c on h.character_id = c.character_id where end_date is null and h.corporation_id = ? order by start_date desc limit 250 offset ?';
			right = true;
			break;
		case 'joined':
			query = 'select h.character_id id, name, date_format(start_date, "%Y/%m/%d %H:%i") start_date, date_format(end_date, "%Y/%m/%d %H:%i") end_date from ew_history h left join ew_characters c on h.character_id = c.character_id where h.corporation_id = ? order by start_date desc limit 250 offset ?';
			right = true;
			break;
		case 'departed':
			left = true;
			right = true;
			query = 'select h.character_id id, name, date_format(start_date, "%Y/%m/%d %H:%i") start_date, date_format(end_date, "%Y/%m/%d %H:%i") end_date from ew_history h left join ew_characters c on h.character_id = c.character_id where end_date is not null and h.corporation_id = ? order by end_date desc limit 250 offset ?';
			break;
		default:
			return null;
	}

	let result = await app.mysql.query(query, [req.params.id, offset]);

	return {
		package: { characters: result, left: left, right: right },
		view: 'puglist.pug',
		ttl: 86400  // 1 day
	};
}
