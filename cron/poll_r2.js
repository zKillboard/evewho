module.exports = {
	exec: f,
	span: 99
}

const entity = require('../classes/entity.js');
const { HEADERS } = require('../classes/constants.js');

let sequence = 0;

async function f(app) {
	if (sequence == 0) {
		const res = await fetch('https://r2z2.zkillboard.com/ephemeral/sequence.json', HEADERS);

		var body = await res.json();
		sequence = body.sequence;
	}

	let status;
	try {
		do {
			const url = `https://r2z2.zkillboard.com/ephemeral/${sequence}.json`;
			console.log(url);
			const res = await fetch(url, HEADERS);
			status = res.status;
			const body = await res.json();

			if (body.sequence_id > 0) {
				sequence = body.sequence_id + 1;
			}
			if (body.esi) {
				let killmail = body.esi;
				await add_entities(app, killmail.victim);
				for (let i = 0; i < killmail.attackers.length; i++) {
					await add_entities(app, killmail.attackers[i]);
				}
				await app.sleep(100); // ensure we stay under rate limits
			}
		} while (status == 200);
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

