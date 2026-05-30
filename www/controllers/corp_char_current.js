module.exports = {
	paths: '/list/corp/char/current/:id/:page',
	get: getData
}

async function getData(req, res) {
	const app = req.app.app;

	let offset = 250 * (req.params.page - 1);
	if (offset < 0 || offset > 10000) return { package: { characters: [], entity_type: 'character' }, ttl: 86400 };
	if (req.params.id < 1999999) return { package: { characters: [], entity_type: 'character' }, ttl: 86400 }; // Ignore NPC corps

	const query = 'select c.character_id id, c.name, date_format(h.start_date, "%Y/%m/%d %H:%i") start_date from ew_characters c left join ew_history h on h.record_id = (select max(h2.record_id) from ew_history h2 where h2.character_id = c.character_id and h2.corporation_id = c.corporation_id) where c.corporation_id = ? order by h.start_date desc limit 250 offset ?';
	let result = await app.mysql.query(query, [req.params.id, offset]);

	return {
		package: { characters: result, entity_type: 'character' },
		view: 'history_rows.pug',
		ttl: 86400  // 1 day
	};
}
