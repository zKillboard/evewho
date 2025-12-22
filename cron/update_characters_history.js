module.exports = {
    exec: f,
    span: 1
}

const characters = require('../classes/characters.js');

const todaysDayOfMonth = new Date().getDate();

async function f(app) {
    let promises = [];

    let chars = await app.mysql.query('select character_id, name from ew_characters where name != "" and history_added = 0 limit 3');
    for (let i = 0; i < chars.length; i++ ){
        if (app.pause420 == true) break;
        if (app.error_count > 0) break;

        let row = chars[i];
        let char_id = row.character_id;

        let corpurl = 'https://esi.evetech.net/characters/' + char_id + '/corporationhistory/';
        promises.push(app.phin(corpurl).then(res => { characters.parse_corps(app, res, char_id, corpurl); }).catch(e => { characters.failed(e, char_id); }));

        //let sleep = 500 + (app.error_count * 1000);
        //await app.sleep(sleep);
    }
    await Promise.all(promises).catch();
}
