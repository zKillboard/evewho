module.exports = {
	paths: '/character/:id',
	get: getData
}


const utf8 = require('utf8');

async function getData(req, res) {
	const app = req.app.app;

	const o = {};
	let details = await app.mysql.query('select ch.character_id, ch.name, ch.corporation_id, corp.name corp_name, ch.alliance_id, al.name alli_name from ew_characters ch left join ew_corporations corp on ch.corporation_id = corp.corporation_id left join ew_alliances al on ch.alliance_id = al.alliance_id where character_id = ?', req.params.id);

	if (details.length == 0) {
		req.params.id = utf8.encode(req.params.id.replace(/\+/g, ' '));
		details = await app.mysql.query('select character_id from ew_characters where name = ?', req.params.id);
		if (details.length == 0) details = await app.mysql.query('select character_id from ew_characters where name = ?', req.params.id + '.');
		if (details.length > 0) return '/character/' + details[0].character_id;
	}

	if (details.length == 0) {
		return {
			status_code: 404,
			view: '404.pug',
			package: { title: 'Not Found', requested_path: req.originalUrl },
			ttl: 60
		};
	}

	o.details = details[0];
	o.history = await app.mysql.query(
		`select eh.corporation_id id,
		ec.name,
		date_format(eh.start_date, "%Y/%m/%d %H:%i") start_date,
		date_format(eh.end_date, "%Y/%m/%d %H:%i") end_date,
		group_concat(
			distinct case
				when cah.alliance_id > 0 then concat(cah.alliance_id, ':', coalesce(al.name, ''))
				else null
			end
			order by cah.start_date
			separator '||'
		) alliances
		from ew_history eh
		left join ew_corporations ec on eh.corporation_id = ec.corporation_id
		left join ew_corporation_alliance_history cah on cah.corporation_id = eh.corporation_id
			and (eh.end_date is null or cah.start_date < eh.end_date)
			and (cah.end_date is null or cah.end_date > eh.start_date)
		left join ew_alliances al on al.alliance_id = cah.alliance_id
		where eh.character_id = ?
		group by eh.record_id, eh.corporation_id, ec.name, eh.start_date, eh.end_date
		order by eh.record_id desc`,
		req.params.id
	);

	o.history = o.history.map((row) => {
		if (!row.alliances) {
			row.alliances = [];
			return row;
		}

		row.alliances = row.alliances
			.split('||')
			.filter(Boolean)
			.map((entry) => {
				const splitAt = entry.indexOf(':');
				if (splitAt === -1) return null;

				const alliance_id = Number(entry.slice(0, splitAt));
				const name = entry.slice(splitAt + 1) || 'Alliance ' + alliance_id;
				if (!Number.isFinite(alliance_id) || alliance_id <= 0) return null;

				return { id: alliance_id, name: name };
			})
			.filter(Boolean);

		return row;
	});

	if (details[0].corporation_id == 1000001) {
		o.history.unshift({ id: 1000001, name: 'Doomheim (character recycled)' });
	}

	o.title = o.details.name;

	return {
		package: o,
		view: 'character.pug',
		ttl: 86400  // 1 day
	};
}
