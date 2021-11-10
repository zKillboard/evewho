module.exports = f;

var phin = require('phin').defaults({'headers': { 'User-Agent': 'evewho.com' } });

var m = false;
var aff = 'evewho:affliates';

async function f(app) {
    if (app.isDowntime()) return;

    if (m == false) {
        m = true;
        try {
            let promises = [];

            let chars = await app.redis.srandmember(aff, 1000);

            let char_array = [];
            let map = {};
            for (let i =0; i < chars.length; i++) {
                char_id = parseInt(chars[i]);
                if (char_id == 'None') continue;
                await app.redis.srem(aff, char_id);
                await app.redis.del('check_aff:' + char_id);
                if (await app.redis.set('check_aff:' + char_id, char_id, 'nx', 'ex', 30) == null) continue;
                char_array.push(char_id);
                map[char_id] = chars[i];

                if (char_array.length >= 1000) break;
            }
            if (char_array.length == 0) return;

            let url = 'https://esi.evetech.net/v1/characters/affiliation/'
            let data = JSON.stringify(char_array);
            let params = {url: url, method: 'post', data: data};
            promises.push(phin(params).then(res => { parse(app, res, map); }).catch(e => { console.log(e); }));

            await Promise.all(promises).catch();
        } finally {
            m = false;
        }
    }
}

async function parse(app, res, map) {
    try {
        var updates_required = 0;
        let json = JSON.parse(res.body);
        for (let i =0; i < json.length; i++) {
            let info = json[i];
            let char_id = info.character_id;
            info.alliance_id = info.alliance_id || 0;
            info.corporation_id = info.corporation_id || 0;
            info.faction_id = info.faction_id || 0;
            let prev = await app.mysql.query('select corporation_id, alliance_id, faction_id from ew_characters where character_id = ?', char_id);
            prev = prev[0];

            if (info.corporation_id != prev.corporation_id || info.alliance_id != prev.alliance_id) {
                await app.mysql.query('update ew_characters set recent_change = 1 where character_id = ?', [char_id]);

                updates_required++;
            }

            var random = (86400 * 3) + Math.floor(Math.random() * 86400);
            await app.mysql.query('update ew_characters set lastAffUpdated = date_add(now(), interval ' + random + ' second) where character_id = ?', char_id)
        }
        console.log('Affiliate check of', json.length, 'characters completed, needing updates:', updates_required);

    } catch (e) {
        console.log(e);
    }
}
