module.exports = f;

const characters = require('../classes/characters.js');

const todaysDayOfMonth = new Date().getDate();

async function f(app) {
    let promises = [];

    let chars = await app.mysql.query('select character_id, name from ew_characters where character_id > 1 and lastUpdated < date_sub(now(), interval 1 day) order by lastUpdated limit 2000');
    for (let i = 0; i < chars.length; i++ ){
        if (app.bailout == true) {
            console.log('bailing');
            break;
        }

        let row = chars[i];
        let char_id = row.character_id;
        if (char_id ==  111205891) { 
        }

        if (chars.name != undefined && chars.name.length > 0) {
            let history = await app.mysql.query('select start_date from  (select start_date from ew_history where character_id = ? order by corp_number desc limit 1) as subq where start_date < date_sub(now(), interval 3 year)', [char_id]);
            if (history.length > 0) {
                let mod = char_id % 28;
                if (mod != todaysDayOfMonth) {
                    await app.mysql.query('update ew_characters set lastUpdated = date_add(lastUpdated, interval 12 hour) where character_id = ?', [char_id]);
                    continue;
                }
            }
        }

        let url = 'https://esi.evetech.net/v4/characters/' + char_id + '/';
        promises.push(app.phin(url).then(res => { characters.parse(app, res, char_id, url); }).catch(e => { characters.failed(e, char_id); }));

        let corpurl = 'https://esi.evetech.net/v1/characters/' + char_id + '/corporationhistory/'
            promises.push(app.phin(corpurl).then(res => { characters.parse_corps(app, res, char_id, corpurl); }).catch(e => { characters.failed(e, char_id); }));

        let sleep = 50 + (app.error_count * 1000);
        await app.sleep(sleep); // Limit to 1/s + time for errors
    }
    await Promise.all(promises).catch();

    return false;
}
