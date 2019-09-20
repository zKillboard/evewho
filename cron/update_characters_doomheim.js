module.exports = f;

const characters = require('../classes/characters.js');

async function f(app) {
    let promises = [];

    let chars = await app.mysql.query('select character_id from ew_characters where character_id > 0 and corporation_id = 1000001 and lastUpdated < date_sub(now(), interval 30 day) order by lastUpdated limit 60');
    for (let i = 0; i < chars.length; i++ ){
        if (app.bailout == true) break;

        let row = chars[i];
        let char_id = row.character_id;

        let url = 'https://esi.evetech.net/v4/characters/' + char_id + '/';
        promises.push(app.phin(url).then(res => { characters.parse(app, res, char_id, url); }).catch(e => { characters.failed(e, char_id); }));

        let corpurl = 'https://esi.evetech.net/v1/characters/' + char_id + '/corporationhistory/'
        promises.push(app.phin(corpurl).then(res => { characters.parse_corps(app, res, char_id, corpurl); }).catch(e => { characters.failed(e, char_id); }));

        let sleep = 1000 + (app.error_count * 1000);
        await app.sleep(sleep); // Limit to 1/s + time for errors
    }
    await Promise.all(promises).catch();

    return false;
}
