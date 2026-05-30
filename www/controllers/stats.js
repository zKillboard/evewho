module.exports = {
	paths: '/stats/',
	get: getData
}

async function getData(req, res) {
	const app = req.app.app;

	const counts = await app.mysql.queryRow(`
		select
			(select count(*) from ew_alliances) alliance_count,
			(select count(*) from ew_corporations) corporation_count,
			(select count(*) from ew_characters) character_count
	`);

	return {
		view: 'stats.pug',
		package: {
			title: 'Stats',
			alliance_count: counts.alliance_count || 0,
			corporation_count: counts.corporation_count || 0,
			character_count: counts.character_count || 0
		},
		ttl: 3600
	};
}