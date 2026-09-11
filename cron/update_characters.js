module.exports = {
    exec: f,
    span: 1
}

const characters = require('../classes/characters.js');
const { HEADERS } = require('../classes/constants.js');

async function f(app) {
	// Locked rows remain oldest until a successful refresh, so fetch extra candidates.
	let chars = await app.mysql.query('select character_id, name from ew_characters where lastUpdated <= "1981-01-01 00:00:01" and recent_change = 0 and corporation_id != 1000001 order by lastUpdated limit 50');
	const checks = [];
    for (let i = 0; i < chars.length; i++ ) {
		if (checks.length >= 10) break;
        if (app.pause420 == true) break;

        let row = chars[i];
        let char_id = row.character_id;
	    if (await app.redis.set('check:' + char_id, char_id, 'nx', 'ex', 300) == null) continue;
		checks.push(checkCharacter(app, char_id));
    }

	const results = await Promise.allSettled(checks);
	const failed = results.find(result => result.status == 'rejected');
	if (failed) throw failed.reason;
}

async function checkCharacter(app, char_id) {
	let url = 'https://esi.evetech.net/characters/' + char_id;
	const res = await fetch(url, HEADERS);
	await characters.parse(app, res, char_id, url);
}
