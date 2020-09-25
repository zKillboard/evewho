module.exports = f;

const characters = require('../classes/characters.js');

const todaysDayOfMonth = new Date().getDate();

async function f(app) {
    let promises = [];

    let chars = await app.mysql.query('select character_id, name from ew_characters order by lastUpdated limit 5');
    for (let i = 0; i < chars.length; i++ ) {
        if (app.bailout == true) {
            console.log('bailing');
            break;
        }

        let row = chars[i];
        let char_id = row.character_id;

        let url = 'https://esi.evetech.net/v4/characters/' + char_id + '/';
        promises.push(app.phin(url).then(res => { characters.parse(app, res, char_id, url); }).catch(e => { characters.failed(e, char_id); }));

        let sleep = 100 + (app.error_count * 1000);
        await app.sleep(sleep); // Limit to 1/s + time for errors
    }

    await Promise.all(promises).catch();
}
