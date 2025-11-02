module.exports = {
	paths: '/alli/',
	get: getData
}


const arrs = ['alli:most_corporations', 'alli:top_10_alliances', 'alli:shrinking_alliances', 'alli:growing_alliances', 'alli:pirate_alliances', 'alli:carebear_alliances', 'alli:dead_alliances', 'alli:newest_alliances'];

async function getData(req, res) {
	const app = req.app.app;

	const o = {};
	for (let i = 0; i < arrs.length; i++) {
		const key = arrs[i];
		const value = await JSON.parse(await app.redis.get(key));
		o[key.replace('alli:', '')] = value;
	}
	o.title = 'Alliances';
	return {
		package: o,
		view: 'allis.pug',
		ttl: 86400
	};
}
