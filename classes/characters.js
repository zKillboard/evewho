
let parse = async function(app, res, char_id, url) {
    try {
        if (res.statusCode == 200) {
            var body = JSON.parse(res.body);

            let r = await app.mysql.query('update ew_characters set faction_id = ?, alliance_id = ?, corporation_id = ?, name = ?, sec_status = ? where character_id = ?', [body.faction_id || 0, body.alliance_id || 0, body.corporation_id || 0, body.name, body.security_status || 0, char_id]);
            if (r.changedRows > 0) {
                await app.mysql.query('update ew_corporations set recalc = 1 where corporation_id = ?', [body.corporation_id || 0]);
                await app.mysql.query('update ew_alliances set recalc = 1 where alliance_id = ?', [body.alliance_id || 0]);
            }
            await app.mysql.query('update ew_characters set lastUpdated = now() where character_id = ?', [char_id]);
            if (body.corporation_id > 100) await app.mysql.query('insert ignore into ew_corporations (corporation_id) values (?)', [body.corporation_id || 0]);
            if (body.alliance_id > 0) await app.mysql.query('insert ignore into ew_alliances (alliance_id) values (?)', [body.alliance_id || 0]);
        } else {
            app.error_count++;
            if (res.statusCode != 502) console.log(res.statusCode + ' ' + url);
            setTimeout(function() { app.error_count--; }, 1000);

            if (res.statusCode == 420) {
                app.bailout = true;
                setTimeout(function() { app.bailout = false; }, 60000);
            }
        }
    } catch (e) { 
        console.log(url + ' ' + e);
    }
}

let parse_corps = async function(app, res, char_id, url) {
    try {
        if (res.statusCode == 200) {
            var body = JSON.parse(res.body);
            let corp_number = 1;
            for (let i = 0; i < body.length; i++) {
                let row = body[i];
                let nextrow = (i < (body.length - 1) ? body[i + 1] : {});
                await app.mysql.query('replace into ew_history (record_id, character_id, corporation_id, start_date, end_date, corp_number) values (?, ?, ?, ?, date_sub(?, interval 1 minute), ?)', [row.record_id, char_id, row.corporation_id, row.start_date, nextrow.start_date, corp_number]);
                corp_number++;
            }
        } else {
            if (res.statusCode != 502) console.log(res.statusCode + ' ' + url);
            await app.mysql.query('update ew_characters set lastUpdated = 0 where character_id = ?', [char_id]);
        }
    } catch (e) {
        console.log(url + ' ' + e);
    }
}

let failed = async function(e, char_id) {
    console.log(e);
}


module.exports.parse = parse;
module.exports.parse_corps = parse_corps;
module.exports.failed = failed;
