module.exports = f;

const characters = require('../classes/characters.js');

const todaysDayOfMonth = new Date().getDate();

const set = new Set();

async function f(app) {
    return;
    let promises = [];

    let chars = await app.mysql.query('select character_id, name from ew_characters where lastUpdated = 0 and recent_change = 0 and corporation_id != 1000001 order by lastUpdated limit 10000');
    for (let i = 0; i < chars.length; i++ ) {
        if (app.bailout == true) {
            console.log('bailing');
            break;
        }

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

        let url = 'https://esi.evetech.net/v5/characters/' + char_id + '/';
        await app.phin(url).then(res => { characters.parse(app, res, char_id, url); }).catch(e => { characters.failed(e, char_id); });
    } finally {
        set.delete(char_id);
    }
}
