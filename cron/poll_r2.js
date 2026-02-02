module.exports = {
	exec: f,
	span: 1
}

const entity = require('../classes/entity.js');

let sequence = 0;

async function f(app, depth = 0) {
	if (sequence == 0) {
		var res = await app.phin({ url: 'https://r2z2.zkillboard.com/ephemeral/sequence.json', followRedirects: true, parse: 'text' });
		var raw = res.body.toString();
		var body = JSON.parse(raw);
		sequence = body.sequence;
	}

	let url = 'https://r2z2.zkillboard.com/ephemeral/' + sequence + '.json';
	try {
		var res = await app.phin({ url: url, followRedirects: true, parse: 'text' });
		var raw = res.body.toString();
		if (body.sequence_id > 0) {
			sequence = body.sequence_id + 1;
		} else {
			await app.sleep(10000);
		}
		if (body.esi) {
			let killmail = body.esi;
			await add_entities(app, killmail.victim);
			for (let i = 0; i < killmail.attackers.length; i++) {
				await add_entities(app, killmail.attackers[i]);
			}
			console.log('Processed zKill R2 killmail ID ' + killmail.killmail_id + ' at sequence ' + sequence);
		}
	} catch (e) {
		await app.sleep(10000);
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

