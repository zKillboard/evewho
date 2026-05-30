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
	o.corporations = [];
	const corp_count = await app.mysql.query('select count(*) corp_count from ew_corporations where alliance_id = ?', req.params.id);
	o.details.corp_count = corp_count[0].corp_count;

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
