module.exports = {
	priority: 9999,
	paths: '/:path(*)',
	get: getData
}

async function getData(req, res) {
	return {
		status_code: 404,
		view: '404.pug',
		package: {
			title: 'Not Found',
			requested_path: req.originalUrl
		},
		ttl: 60
	};
}
