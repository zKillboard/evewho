module.exports = {
    exec: f,
    span: 1
}

const characters = require('../classes/characters.js');
const { HEADERS } = require('../classes/constants.js');

const set = new Set();

async function f(app) {
	let chars = await app.mysql.query('select character_id, name from ew_characters where lastUpdated <= "1981-01-01 00:00:01" and recent_change = 0 and corporation_id != 1000001 order by lastUpdated limit 10');
    for (let i = 0; i < chars.length; i++ ) {
        if (app.pause420 == true) break;

        let row = chars[i];
        let char_id = row.character_id;
	    if (await app.redis.set('check:' + char_id, char_id, 'nx', 'ex', 300) == null) continue;

        while (set.size >= 5) await app.sleep(1);
        next(app, char_id);

        let sleep = 200 + (app.error_count * 1000);
        await app.sleep(sleep); // Limit to 1/s + time for errors
    }

    while (set.size > 0) await app.sleep(1);
}

async function next(app, char_id) {
    try {
        set.add(char_id);

		let url = 'https://esi.evetech.net/characters/' + char_id;
		const res = await fetch(url, HEADERS);
		await characters.parse(app, res, char_id, url);
    } finally {
        set.delete(char_id);
    }
}
