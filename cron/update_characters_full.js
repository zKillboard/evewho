module.exports = {
    exec: f,
    span: 1
}

const characters = require('../classes/characters.js');

async function f(app) {
    if (app.util.isDowntime() || app.pause420 == true) return;

    let second = Math.round(Date.now() / 1000);

    let recents = await app.mysql.query('select character_id, name, corporation_id, recent_change from ew_characters where recent_change = 1 limit 100')
    let more =  await app.mysql.query('select character_id, name, corporation_id, recent_change from ew_characters order by lastUpdated limit 100');
    let chars = [...recents, ...more];

	let awaits = [];
    for (let i = 0; i < chars.length; i++) {
        let r = await app.mysql.query('update ew_characters set lastUpdated = now() where character_id = ?', chars[i].character_id);
        if (chars[i].corporation_id == 1000001) {
            continue;
        }
        let row = chars[i];
        let url = 'https://esi.evetech.net/characters/' + row.character_id + '/';
		awaits.push(app.phin(url).then(res => { characters.parse(app, res, row.character_id, url); }).catch(e => { console.log('error in phin', e); }));
        if (awaits.length >= 10) break;
	}
	await Promise.all(awaits);
}

