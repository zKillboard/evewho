module.exports = f;

const characters = require('../classes/characters.js');

const todaysDayOfMonth = new Date().getDate();

const set = new Set();

async function f(app) {
    let second = Math.round(Date.now() / 1000);
    //if ((second % 60) > 30) return;

    let chars = await app.mysql.query('select character_id, name from ew_characters where lastUpdated = 0 limit 1000');

    if (chars.length == 0) chars = await app.mysql.query('select character_id, name from ew_characters where recent_change = 1 limit 1000');

    for (let i = 0; i < chars.length; i++ ) {
        if (app.bailout == true) {
            console.log('bailing');
            break;
        }

	   let second = Math.round(Date.now() / 1000);
	   if ((second % 60) > 30) break;

        let row = chars[i];
        let char_id = row.character_id;
        if (await app.redis.set('check_full:' + char_id, char_id, 'nx', 'ex', 300) == null) continue;

        while (set.size >= 5) await app.sleep(25);
        next(app, char_id);
        await app.sleep(1000);

        let round = 300;
        let now = Math.round(Date.now() / round);
        // while (now == Math.round(Date.now() / round)) await app.sleep(10);
    }

    while (set.size > 0) await app.sleep(1);
}

async function next(app, char_id) {
    try {
        set.add(char_id);

        let url = 'https://esi.evetech.net/v5/characters/' + char_id + '/';
        await app.phin(url).then(res => { characters.parse(app, res, char_id, url); }).catch(e => { characters.failed(e, char_id); });
        
    } catch (e) {
        console.log(e);
    } finally {
        set.delete(char_id);
    }
}
