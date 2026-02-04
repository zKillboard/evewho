module.exports = {
    exec: f,
    span: 1
}
const { HEADERS } = require('../classes/constants.js');
const characters = require('../classes/characters.js');

async function f(app) {
    if (app.util.isDowntime() || app.pause420 == true) return;

    let recents = await app.mysql.query('select character_id, name, corporation_id, recent_change from ew_characters where recent_change = 1 limit 10')
    let more =  await app.mysql.query('select character_id, name, corporation_id, recent_change from ew_characters order by lastUpdated limit 10');
    let chars = [...recents, ...more];

	let awaits = [];
    for (let i = 0; i < chars.length; i++) {
        await app.mysql.query('update ew_characters set lastUpdated = now() where character_id = ?', chars[i].character_id);
        if (chars[i].corporation_id == 1000001) {
            continue;
        }
		
		let url = 'https://esi.evetech.net/characters/' + chars[i].character_id;
		const res = await fetch(url, {
			headers: {
				...HEADERS.headers,
				'X-Compatibility-Date': '2099-01-01'
			}
		});

		awaits.push(characters.parse(app, res, chars[i].character_id, url));		
	}
	await Promise.all(awaits);
}

