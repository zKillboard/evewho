module.exports = {
	paths: '/list/corp/char/departed/:id/:page',
	get: getData
}

async function getData(req, res) {
	const app = req.app.app;

	let offset = 250 * (req.params.page - 1);
	if (offset < 0 || offset > 10000) return { package: { characters: [], entity_type: 'character' }, ttl: 86400 };
	if (req.params.id < 1999999) return { package: { characters: [], entity_type: 'character' }, ttl: 86400 }; // Ignore NPC corps

	const query = 'select h.character_id id, name, date_format(start_date, "%Y/%m/%d %H:%i") start_date, date_format(end_date, "%Y/%m/%d %H:%i") end_date from ew_history h left join ew_characters c on h.character_id = c.character_id where end_date is not null and h.corporation_id = ? order by end_date desc limit 250 offset ?';
	let result = await app.mysql.query(query, [req.params.id, offset]);

	return {
		package: { characters: result, entity_type: 'character' },
		view: 'history_rows.pug',
		ttl: 86400  // 1 day
	};
}
