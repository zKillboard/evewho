module.exports = f;

var phin = require('phin').defaults({'headers': { 'User-Agent': 'evewho.com' } });

async function f(app) {
    let promises = [];

    let chars = await app.mysql.query('select character_id, corporation_id, alliance_id, faction_id from ew_characters where lastUpdated > 0 and lastAffUpdated < date_sub(now(), interval 1 day) order by lastAffUpdated limit 1000');
    if (chars.length == 0) return;

    let char_array = [];
    let map = {};
    for (let i =0; i < chars.length; i++) {
        char_array.push(chars[i].character_id);
        map[chars[i].character_id] = chars[i];
    }
    app.mysql.query('update ew_characters set lastAffUpdated = now() where character_id in (' + char_array.join() + ')');

    let url = 'https://esi.evetech.net/v1/characters/affiliation/'
    let data = JSON.stringify(char_array);
    let params = {url: url, method: 'post', data: data};
    promises.push(phin(params).then(res => { parse(app, res, map); }).catch(e => { failed(e, corp_id); }));

    await Promise.all(promises).catch();
}

async function parse(app, res, map) {
    try {
        let json = JSON.parse(res.body);
        for (let i =0; i < json.length; i++) {
            let info = json[i];
            let prev = map[info.character_id];

            if (info.corporation_id | 0 != prev.corporation_id | 0 && info.alliance_id | 0 != prev.alliance_id | 0 && info.faction_id | 0 != info.faction_id | 0) {
                app.mysql.query('update ew_characters set lastUpdated = 0 where character_id = ?', info.character_id);
            }
        }
    } catch (e) {
        console.log(e);
    }
}
