
let parse = async function(app, res, char_id, url) {
	try {
		if (res.status == 404) {
			await app.mysql.query('update ew_characters set lastUpdated = now(), recent_change = 0 where character_id = ?', [char_id]);
		}
        else if (res.status == 200) {
			var body = await res.json();

            await app.mysql.query('update ew_characters set lastUpdated = now(), recent_change = 0 where character_id = ?', [char_id]);
            let r = await app.mysql.query('update ew_characters set name = ?, sec_status = ? where character_id = ?', [body.name, body.security_status || 0, char_id]);
            if (r.changedRows > 0) {
                await app.mysql.query('update ew_characters set history_added = 0 where character_id = ?', [char_id]);
                await app.mysql.query('update ew_corporations set recalc = 1 where corporation_id = ?', [body.corporation_id || 0]);
                await app.mysql.query('update ew_alliances set recalc = 1 where alliance_id = ?', [body.alliance_id || 0]);
                // console.log('Updating: ', char_id, body.name);
            }
            if (body.corporation_id > 100) await app.mysql.query('insert ignore into ew_corporations (corporation_id) values (?)', [body.corporation_id || 0]);
            if (body.alliance_id > 10000) await app.mysql.query('insert ignore into ew_alliances (alliance_id) values (?)', [body.alliance_id || 0]);
        } else {
            app.error_count++;
            setTimeout(function() { app.error_count--; }, 1000);
			if (res.status == 404) {
                var body = JSON.parse(res.body);
                if (body.error == 'Character has been deleted!') {
                    let r = await app.mysql.query('update ew_characters set history_added = 1, lastUpdated = now(), recent_change = 0, faction_id = 0, alliance_id = 0, corporation_id = 1000001 where character_id = ?', [char_id]);
                    return await app.sleep(10000);
                }
            }
			if (res.status == 404) {
                // Get the name, if we have a name then this is a false 404, otherwise remove it
                let name = await app.mysql.queryField('name', 'select name from ew_characters where character_id = ?', [char_id]);
                if (name !== null && name !== undefined && name.length > 0) return;
                console.log('Received valid 404 for ' + char_id);
                await app.mysql.query('delete from ew_characters where character_id = ?', [char_id]);
            }
			if (res.status != 502) console.log(res.status + ' ' + url);

			if (res.status == 420) {
                app.pause420 = true;
                await app.sleep(120000);
                app.pause420 = false;
            }
        }
    } catch (e) { 
		console.error(url, res.status, e);
    }
}

let corps_set = new Set();
setInterval(() => corps_set.clear(), 9600);
let parse_corps = async function (app, res, row, url) {
	let char_id = row.character_id;
	try {
        if (res.status == 200) {
			var raw = await res.text();
			var body = JSON.parse(raw);

            await app.mysql.query('delete from ew_history where character_id = ?', [char_id]);
            for (let i = 0; i < body.length; i++) {
                let row = body[i];
                if (!corps_set.has(row.corporation_id)) {
                    await app.mysql.query('insert ignore into ew_corporations (corporation_id) values (?)', [row.corporation_id]);
                    corps_set.add(row.corporation_id);
                }
                // Convert ISO 8601 datetime to MySQL datetime format
                const startDate = row.start_date ? row.start_date.replace('T', ' ').replace('Z', '') : null;
                await app.mysql.query('replace into ew_history (record_id, character_id, corporation_id, start_date) values (?, ?, ?, ?)', [row.record_id, char_id, row.corporation_id, startDate]);
			}
			await app.mysql.query('with x as (select record_id, lead(start_date) over (partition by character_id order by record_id) next_start_date from ew_history where character_id = ?) update ew_history h join x on x.record_id = h.record_id set h.end_date = x.next_start_date where h.character_id = ? and not (h.end_date <=> x.next_start_date);', [char_id, char_id]);
			if (row.corporation_id == 1000001) {
				await app.mysql.query('update ew_history set end_date = start_date where end_date is null and character_id = ?', [char_id]);
			}
            await app.mysql.query('update ew_characters set history_added = 1 where character_id = ?', [char_id]);
        } else {
			if (res.status != 502) console.log(res.status + ' ' + url);
        }
    } catch (e) {
            app.error_count++;
            setTimeout(function() { app.error_count--; }, 1000);
			console.error(url, res.status, e);
    }
}

let failed = async function(e, char_id) {
    console.error(char_id, e);
}


module.exports.parse = parse;
module.exports.parse_corps = parse_corps;
module.exports.failed = failed;
