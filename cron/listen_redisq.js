module.exports = {
	exec: f,
	span: 1
}

const entity = require('../classes/entity.js');

async function f(app) {
	let url = 'https://zkillredisq.stream/listen.php?queueID=' + process.env.redisqID;
	try {
		var res = await app.phin({ url: url, followRedirects: true, parse: 'text' });
		var raw = res.body.toString();
		var body = JSON.parse(raw);
		if (body.package !== null) {
			if (body.package.killmail === undefined) {
				res = await fetch(body.package.zkb.href);
				body.package.killmail = await res.json();
				console.log(body.package);
			}
			await add_entities(app, body.package.killmail.victim);
			for (let i = 0; i < body.package.killmail.attackers.length; i++) {
				await add_entities(app, body.package.killmail.attackers[i]);
			}
		}
	} catch (e) {
		console.log(e);
	}
}

async function add_entities(app, block) {
	await add_entity(app, 'alli', block.alliance_id);
	await add_entity(app, 'corp', block.corporation_id);
	await add_entity(app, 'char', block.character_id);
}

async function add_entity(app, type, id) {
	await entity.add(app, type, id);
}

