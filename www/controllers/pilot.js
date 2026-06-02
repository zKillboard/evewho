const utf8 = require('utf8');

module.exports = {
	paths: '/pilot/:name',
	get: get
}

async function get(req, res) {
	const app = req.app.app;

	// Handle URL-encoded names (e.g., "John+Doe" -> "John Doe")
	const name = utf8.encode(req.params.name.replace(/\+/g, ' '));
	
	const charaacter = await app.mysql.query('SELECT * FROM ew_characters WHERE name = ? order by corporation_id desc', [name]);
	if (charaacter.length === 0) {
		return {
			status_code: 404,
			view: '404.pug',
			package: { title: 'Not Found', requested_path: req.originalUrl }
		};
	}
	return {
		redirect: '/character/' + charaacter[0].character_id
	}
}