module.exports = f;

var phin = require('phin').defaults({'headers': { 'User-Agent': 'evewho.com' } });

async function f(app) {
    let promises = [];

    let chars = await app.mysql.query('select character_id, corporation_id, alliance_id, faction_id from ew_characters where corporation_id != 1000001 and recent_change = 0 and lastUpdated > 0 and lastAffUpdated < date_sub(now(), interval 1 day) order by lastAffUpdated limit 1000');
    if (chars.length == 0) return;

    let char_array = [];
    let map = {};
    for (let i =0; i < chars.length; i++) {
        char_id = chars[i].character_id;
        if (await app.redis.set('check:' + char_id, char_id, 'nx', 'ex', 300) == null) continue;
        char_array.push(chars[i].character_id);
        map[chars[i].character_id] = chars[i];
        if (char_array.length > 100) break;
    }
    await app.mysql.query('update ew_characters set lastAffUpdated = now() where character_id in (' + char_array.join() + ')');

    let url = 'https://esi.evetech.net/v1/characters/affiliation/'
    let data = JSON.stringify(char_array);
    let params = {url: url, method: 'post', data: data};
    promises.push(phin(params).then(res => { parse(app, res, map); }).catch(e => { characters.failed(e, 0); }));

    await Promise.all(promises).catch();
}

async function parse(app, res, map) {
    try {
        let json = JSON.parse(res.body);
        for (let i =0; i < json.length; i++) {
            let info = json[i];
            info.alliance_id = info.alliance_id | 0;
            info.corporation_id = info.corporation_id | 0;
            info.faction_id = info.faction_id | 0;
            let prev = map[info.character_id];

            if (
                ((info.corporation_id | 0) != (prev.corporation_id | 0))
             || ((info.alliance_id | 0) != (prev.alliance_id | 0)) 
             || ((info.faction_id | 0) != (info.faction_id | 0))) {
                await app.mysql.query('update ew_characters set recent_change = 1, lastUpdated = now(), corporation_id = ?, alliance_id = ?, faction_id = ? where character_id = ?', [info.corporation_id, info.alliance_id, info.faction_id, info.character_id]);
                await app.mysql.query('update ew_corporations set recalc = 1 where corporation_id = ?', info.corporation_id);
                if (info.alliance_id > 0) await app.mysql.query('update ew_alliances set recalc = 1 where alliance_id = ?', info.alliance_id);
            }
        }
    } catch (e) {
        console.log(e);
    }
}
