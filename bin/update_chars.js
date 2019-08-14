var getJSON = require('get-json');

var days_refresh = 5;
var characters_per_second = 35;
const min_char_interval = Math.ceil(1000 / characters_per_second);
var update_char_interval = min_char_interval;

console.log('refreshing at ' + characters_per_second + '/s with an interval of ' + update_char_interval + 'ms');

module.exports = update_chars;

corps = [];

async function update_chars(mysql) {
    let rows = await mysql.query('select * from ew_characters where lastUpdated < date_sub(now(), interval 1 day) order by lastUpdated limit 1');
    if (rows == undefined || rows.length == 0) {
        setTimeout(() => { update_chars(mysql); }, 1000);
    } else {
        await mysql.query('update ew_characters set lastUpdated = now() where character_id = ?', [rows[0].character_id]);
        setTimeout(() => { update_chars(mysql); }, update_char_interval);
        update_char(mysql, rows[0]);
    }
};

async function update_char(mysql, row) {
    if (row.character_id > 0) {
        let url = 'https://esi.evetech.net/v4/characters/' + row.character_id + '/';
        try {
            let response = await getJSON(url);
            await mysql.query('update ew_characters set corporation_id = ?, alliance_id = ?, faction_id = ?, name = ?, name_phonetic = soundex(?), sec_status = ?, lastUpdated = now()  where character_id = ?', [response.corporation_id, response.alliance_id || 0, response.faction_id || 0, response.name, response.name, response.security_status, row.character_id]);
            if (corps.indexOf(response.corporation_id) == -1) {
                await mysql.query('insert ignore into ew_corporations (corporation_id) values (?)', [response.corporation_id]);
                corps.push(response.corporation_id);
            }
            //console.log(response.name);
            update_char_interval = Math.min(min_char_interval, update_char_interval - 10);
        } catch (error) {
            handleError(error, mysql, row);
        }
    }
}

async function handleError(error, mysql, row) {
    console.log(error);
    update_char_interval += Math.max(60000, update_char_interval + 1000);
    await mysql.query('update ew_characters set lastUpdated = 0 where character_id = ?', [row.character_id]);
}

function hasDifferences(row, response, compare) {
    var l = compare.length;
    for( let i =0; i < l; i++ ) {
        if (response[compare[i]] == undefined) response[compare[i]] = 0;
        if (row[compare[i]] != response[compare[i]]) {
            return true;
        }
    }
    return false;
}
