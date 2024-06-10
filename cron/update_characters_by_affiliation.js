module.exports = {
    exec: f,
    span: 1
}

var phin = require('phin').defaults({'headers': { 'User-Agent': 'evewho.com' } });

var m = false;
var aff = 'evewho:affiliates';

async function f(app) {
    if (app.util.isDowntime()) return;

    if (m == false) {
        m = true;
        var date = new Date().getDate();
        date = (date <= 28 ) ? date % 7 : -1; // only do a full check during the first 28 days
        var oneYearAgo = Math.floor(new Date().getTime() / 1000) - (86400 * 365);
        try {
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

                // See if this character has been active in the last year, or if their mod % 7 matches today's date % 7
                var lastJoin = await app.mysql.query('select start_date from ew_history where character_id = ? order by start_date desc limit 1', char_id);
                if(lastJoin.length > 0) { // if they have no history, we should probably check them, otherwise let us see how recent it is
                    var start_date = new Date(lastJoin[0]['start_date']);
                    var start_date_timestamp = Math.floor(start_date.getTime() / 1000);
                    if (start_date_timestamp < oneYearAgo && (char_id % 7) != date) continue;
                }

                char_array.push(char_id);
                map[char_id] = chars[i];

                if (char_array.length >= 1000) break;
                if (app.bailout == true) break;
            }
            if (app.bailout == true) return;
            if (char_array.length == 0) return;
            else console.log('Checking', char_array.length, 'characters');

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

            if (info.corporation_id != prev.corporation_id || info.alliance_id != prev.alliance_id || info.faction_id != prev.faction_id) {
                if (info.corporation_id == 1000001) {
                    await app.mysql.query('update ew_characters set corporation_id = 1000001, alliance_id = 0, faction_id = 0 where character_id = ?', [char_id]);
                }
                await app.mysql.query('update ew_characters set recent_change = 1, corporation_id = ?, alliance_id = ?, faction_id = ? where character_id = ?', [info.corporation_id, info.alliance_id, info.faction_id, char_id]);

                updates_required++;
            }

            //var random = (86400 * 3) + Math.floor(Math.random() * 86400);
            //await app.mysql.query('update ew_characters set lastAffUpdated = date_add(now(), interval ' + random + ' second) where character_id = ?', char_id)
            await app.mysql.query('update ew_characters set lastAffUpdated = now() where character_id = ?', char_id)
        }
        //console.log('Affiliate check of', json.length, 'characters completed, needing updates:', updates_required);

    } catch (e) {
        console.log(e);
    }
}
