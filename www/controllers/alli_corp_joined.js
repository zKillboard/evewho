module.exports = {
	paths: '/list/alli/corp/joined/:id/:page',
	get: getData
}

async function getData(req, res) {
	const app = req.app.app;

	let offset = 250 * (req.params.page - 1);
	if (offset < 0 || offset > 10000) return { package: { characters: [], entity_type: 'corporation' }, ttl: 86400 };

	const query = 'select h.corporation_id id, c.name, date_format(h.start_date, "%Y/%m/%d %H:%i") start_date, date_format(h.end_date, "%Y/%m/%d %H:%i") end_date from ew_corporation_alliance_history h left join ew_corporations c on h.corporation_id = c.corporation_id where h.alliance_id = ? order by h.start_date desc limit 250 offset ?';
	let result = await app.mysql.query(query, [req.params.id, offset]);

	return {
		package: { characters: result, entity_type: 'corporation' },
		view: 'history_rows.pug',
		ttl: 86400  // 1 day
	};
}
