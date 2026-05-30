module.exports = {
	paths: '/list/alli/corp/current/:id/:page',
	get: getData
}

async function getData(req, res) {
	const app = req.app.app;

	let offset = 250 * (req.params.page - 1);
	if (offset < 0 || offset > 10000) return { package: { characters: [], entity_type: 'corporation' }, ttl: 86400 };

	const query = `select c.corporation_id id, c.name,
	date_format(h.start_date, "%Y/%m/%d %H:%i") start_date
	from ew_corporations c
	left join ew_corporation_alliance_history h on h.record_id = (
		select max(h2.record_id)
		from ew_corporation_alliance_history h2
		where h2.corporation_id = c.corporation_id and h2.alliance_id = c.alliance_id
	)
	where c.alliance_id = ?
	order by h.start_date desc, c.name asc
	limit 250 offset ?`;

	let result = await app.mysql.query(query, [req.params.id, offset]);

	return {
		package: { characters: result, entity_type: 'corporation' },
		view: 'history_rows.pug',
		ttl: 86400  // 1 day
	};
}
