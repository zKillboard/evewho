module.exports = {
    exec: f,
    span: 15
}

const { HEADERS } = require('../classes/constants.js');
const entity = require('../classes/entity.js');

async function f(app) {
    let promises = [];

    let allis = await app.mysql.query('select alliance_id from ew_alliances where alliance_id > 100 and lastUpdated < date_sub(now(), interval 1 day) order by lastUpdated limit 1');
    for (let i = 0; i < allis.length; i++ ){
        if (app.bailout == true || app.error_count > 0) break;
        if (app.util.isDowntime()) return;
        if (app.pause420 == true) return;

        let row = allis[i];
        let alli_id = row.alliance_id;

        await app.mysql.query('update ew_alliances set lastUpdated = now() where alliance_id = ?', alli_id);
		let url = 'https://esi.evetech.net/alliances/' + alli_id;
		const res = await fetch(url, {
			headers: {
				...HEADERS.headers,
				'X-Compatibility-Date': '2099-01-01'
			}
		});
		await parse(app, res, alli_id, url);

		let corpurl = 'https://esi.evetech.net/alliances/' + alli_id + '/corporations'
		const res2 = await fetch(corpurl, HEADERS);
		await parse_corps(app, res2, alli_id, corpurl);
    }

    await Promise.all(promises).catch();
}

async function parse(app, res, alli_id, url) {
  try {
	  if (res.status == 200) {
        var body = await res.json();

        let r = await app.mysql.query('update ew_alliances set faction_id = ?, name = ?, ticker = ?, executor_corp = ? where alliance_id = ?', [body.faction_id || 0, body.name, body.ticker, body.executor_corporation_id || 0, alli_id]);
        if (r.changedRows > 0) {
            await app.mysql.query('update ew_alliances set recalc = 1, lastUpdated = now() where alliance_id = ?', [alli_id]);
        } else {
            await app.mysql.query('update ew_alliances set lastUpdated = now() where alliance_id = ?', [alli_id]);
        }
        await entity.add(app, 'corp', body.executor_corporation_id);
        await entity.add(app, 'char', body.creator_id);
    } else {
        app.error_count++;
		  if (res.status != 502) console.log(res.status + ' ' + url);
        setTimeout(function() { app.error_count--; }, 1000);

		  if (res.status == 420) {
            app.pause420 = true;
            await app.sleep(120000);
            app.pause420 = true;
        }
    }
  } catch (e) { 
    console.log(url + ' ' + e);
  }
}

async function parse_corps(app, res, alli_id, url) {
    try {
        if (res.status == 200) {
            var body = await res.json();
            if (body.length == 0) {
                await app.mysql.query('update ew_corporations set alliance_id = 0 where alliance_id = ?', [alli_id]);
                await app.mysql.query('update ew_characters set lastAffUpdated = "1970-01-01 00:00:01" where alliance_id = ?', [alli_id]);
            } else {
                for (let i = 0; i < body.length; i++) {
                    let corp_id = body[i];
                    await entity.add(app, 'corp', corp_id);
                    await app.mysql.query('update ew_corporations set alliance_id = ? where corporation_id = ? and alliance_id != ?', [alli_id, corp_id, alli_id]);
                }
                await app.mysql.query('update ew_corporations set alliance_id = 0 where alliance_id = ? and corporation_id not in (' + body.map((i) => parseInt(i)).join (',') + ')', alli_id);
                await app.mysql.query('update ew_characters set lastAffUpdated = "1970-01-01 00:00:01" where alliance_id != ? and corporation_id in (' + body.map((i) => parseInt(i)).join (',') + ')', alli_id);
                await app.mysql.query('update ew_characters set lastAffUpdated = "1970-01-01 00:00:01" where alliance_id = ? and corporation_id not in (' + body.map((i) => parseInt(i)).join (',') + ')', alli_id);
            }
        } else {
			console.log(res.status + ' ' + url);
        }
    } catch (e) {
        console.log(url + ' ' + e);
    }
}

async function failed(e, alli_id) {
    console.log(e);
}
