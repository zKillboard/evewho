module.exports = {
    exec: f,
    span: 60
}

var phin = require('phin').defaults({'headers': { 'User-Agent': 'evewho.com' } });

var m = false;
var aff = 'evewho:affiliates';

async function f(app) {
    if (app.util.isDowntime()) return;

    if (m == false) {
        try {
            m = true;
            let promises = [];

            let chars = await app.redis.srandmember(aff, 1000);

            let char_array = [];
            let map = {};
            for (let i =0; i < chars.length; i++) {
                char_id = parseInt(chars[i]);
                if (char_id == 'None') continue;
                await app.redis.srem(aff, char_id);
                // await app.redis.del('check_aff:' + char_id);
                // if (await app.redis.set('check_aff:' + char_id, char_id, 'nx', 'ex', 30) == null) continue;

                char_array.push(char_id);
                map[char_id] = chars[i];

                if (char_array.length >= 1000) break;
                if (app.pause420 == true) break;
            }
            if (app.pause420 == true) return;
            if (char_array.length == 0) return;
            console.log('Aff. Checking', char_array.length, 'characters');

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
        let json = JSON.parse(res.body);
        for (let i =0; i < json.length; i++) {
            let info = json[i];
            let char_id = info.character_id;
            info.alliance_id = info.alliance_id || 0;
            info.corporation_id = info.corporation_id || 0;
            info.faction_id = info.faction_id || 0;
            let prev = await app.mysql.query('select corporation_id, alliance_id, faction_id from ew_characters where character_id = ?', char_id);
            prev = prev[0];

            if (info.corporation_id != prev.corporation_id || info.alliance_id != prev.alliance_id || info.faction_id != prev.faction_id) {
                if (info.corporation_id == 1000001) {
                    await app.mysql.query('update ew_characters set corporation_id = 1000001, alliance_id = 0, faction_id = 0 where character_id = ?', [char_id]);
                }
                else await app.mysql.query('update ew_characters set recent_change = 1, history_added = 0, corporation_id = ?, alliance_id = ?, faction_id = ? where character_id = ?', [info.corporation_id, info.alliance_id, info.faction_id, char_id]);

            } else if (info.corporation_id != 1000001) {
                // Double check latest history entry matches current corporation
                var lastCorpRow = await app.mysql.query('select corporation_id from ew_history where character_id = ? order by start_date desc limit 1', char_id);
                if (lastCorpRow == undefined || lastCorpRow.length == 0) lastCorpRow = [{corporation_id: 0}];
                if (lastCorpRow[0].corporation_id != info.corporation_id) {
                    await app.mysql.query("update ew_characters set history_added = 0 where character_id = ?", char_id);
                }
            }

            await app.mysql.query('update ew_characters set lastAffUpdated = now() where character_id = ?', char_id)
        }

    } catch (e) {
        console.log(e);
    }
}
