const utf8 = require('utf8');

module.exports = {
	paths: '/alliance/:id',
	get: getData
}

async function getData(req, res) {
	const app = req.app.app;

	const o = {};
	let details = await app.mysql.query('select * from ew_alliances where alliance_id = ?', req.params.id);
	if (details.length == 0) {
		req.params.id = utf8.encode(req.params.id.replace(/\+/g, ' '));
		details = await app.mysql.query('select alliance_id from ew_alliances where name = ?', req.params.id);
		if (details.length == 0) details = await app.mysql.query('select alliance_id from ew_alliances where name = ?', req.params.id + '.');
		if (details.length > 0) return '/alliance/' + details[0].alliance_id;

	}

	if (details.length == 0) return undefined;

	o.details = details[0];
	o.corporations = await app.mysql.query('select corporation_id id, name, memberCount, diff from ew_corporations where alliance_id = ? order by name', req.params.id);
	o.details.corp_count = o.corporations.length

	if (o.details.memberCount > 0 && o.details.executor_corp > 1) {
		const exec_corp = await app.mysql.query('select corporation_id, name from ew_corporations where corporation_id = ?', o.details.executor_corp);
		if (exec_corp.length) o.details.exec_corp_name = exec_corp[0].name;
	}

	o.title = o.details.name;

	return {
		package: o,
		view: 'alliance.pug',
		ttl: 86400  // 1 day
	};
}
