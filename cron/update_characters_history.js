module.exports = f;

const characters = require('../classes/characters.js');

const todaysDayOfMonth = new Date().getDate();

async function f(app) {
    let promises = [];

    let chars = await app.mysql.query('select character_id, name from ew_characters where name != "" and history_added = 0 limit 5');
    for (let i = 0; i < chars.length; i++ ){
        if (app.bailout == true) {
            console.log('bailing');
            break;
        }
        if (app.error_count > 0) break;

        let row = chars[i];
        let char_id = row.character_id;

        let corpurl = 'https://esi.evetech.net/v1/characters/' + char_id + '/corporationhistory/';
        promises.push(app.phin(corpurl).then(res => { characters.parse_corps(app, res, char_id, corpurl); }).catch(e => { characters.failed(e, char_id); }));

        let sleep = 100 + (app.error_count * 1000);
        await app.sleep(sleep); // Limit to 1/s + time for errors
    }
    await Promise.all(promises).catch();
}
