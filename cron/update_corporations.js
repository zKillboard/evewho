module.exports = {
    exec: f,
    span: 1
}

const { HEADERS } = require('../classes/constants.js');
const entity = require('../classes/entity.js');

async function f(app) {
    let corps = await app.mysql.query('select corporation_id from ew_corporations order by lastUpdated limit 5');
    for (let i = 0; i < corps.length; i++ ){
        if (app.bailout == true || app.pause420 == true) break;
        if (app.error_count > 0) break;
        if (app.util.isDowntime()) break;

        let row = corps[i];
        let corp_id = row.corporation_id;
        await app.mysql.query('update ew_corporations set lastUpdated = now() where corporation_id = ?', corp_id);
		if (await app.redis.set('check:' + corp_id, corp_id, 'nx', 'ex', 300) == null) { console.log('skipping corp', corp_id); continue; }

		let url = 'https://esi.evetech.net/corporations/' + corp_id;
		const res = await fetch(url, HEADERS);
		
		await parse(app, res, corp_id, url);

        await app.sleep(1000);
    }
}

async function parse(app, res, corp_id, url) {
    try {
        if (res.status == 200) {
            var body = await res.json();

            let r = await app.mysql.query('update ew_corporations set alliance_id = ?, faction_id = ?, ceoID = ?, memberCount = ?, name = ?, ticker = ?, taxRate = ? where corporation_id = ?', [body.alliance_id || 0, body.faction_id || 0, body.ceo_id || 0, body.memberCount || 0, body.name, body.ticker, body.tax_rate || 0, corp_id]);
            await app.mysql.query('update ew_corporations set recalc = ?, lastUpdated = now() where corporation_id = ?', [(r.changedRows > 0 ? 1 : 0), corp_id]);

            await entity.add(app, 'alli', body.alliance_id);
            await entity.add(app, 'char', body.creator_id);
            await entity.add(app, 'char', body.ceo_id);

            await syncAllianceHistory(app, corp_id);
        } else {
            app.error_count++;
			if (res.status != 502) console.log(res.status + ' ' + url);
            setTimeout(function() { app.error_count--; }, 1000);

			if (res.status == 420) {
                app.pause420 = true;
                await app.sleep(120000);
                app.pause420 = false;
            }
        }
    } catch (e) { 
        console.log(url + ' ' + e);
    }
}

async function syncAllianceHistory(app, corp_id) {
    const url = 'https://esi.evetech.net/corporations/' + corp_id + '/alliancehistory';
    const res = await fetch(url, HEADERS);

    try {
        if (res.status == 200) {
            const body = await res.json();
            for (let i = 0; i < body.length; i++) {
                const row = body[i];
                if (!row.alliance_id) continue;
                const startDate = row.start_date ? row.start_date.replace('T', ' ').replace('Z', '') : null;
                await app.mysql.query(
                    'replace into ew_corporation_alliance_history (corporation_id, record_id, alliance_id, is_deleted, start_date) values (?, ?, ?, ?, ?)',
                    [corp_id, row.record_id, row.alliance_id, row.is_deleted ? 1 : 0, startDate]
                );
            }

            await app.mysql.query(
                'with x as (select record_id, lead(start_date) over (partition by corporation_id order by record_id) next_start_date from ew_corporation_alliance_history where corporation_id = ?) update ew_corporation_alliance_history h join x on x.record_id = h.record_id set h.end_date = x.next_start_date where h.corporation_id = ? and not (h.end_date <=> x.next_start_date);',
                [corp_id, corp_id]
            );
        } else {
            if (res.status != 502) console.log(res.status + ' ' + url);
            if (res.status == 420) {
                app.pause420 = true;
                await app.sleep(120000);
                app.pause420 = false;
            }
        }
    } catch (e) {
        app.error_count++;
        setTimeout(function() { app.error_count--; }, 1000);
        console.error(url, res.status, e);
    }
}

async function failed(e, corp_id) {
    console.log(e);
}
