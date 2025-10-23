module.exports = {
    exec: f,
    span: 15
}

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
        let url = 'https://esi.evetech.net/v4/alliances/' + alli_id + '/';
        promises.push(app.phin(url).then(res => { parse(app, res, alli_id, url); }).catch(e => { failed(e, alli_id); }));

        let corpurl = 'https://esi.evetech.net/v1/alliances/' + alli_id + '/corporations/'
        promises.push(app.phin(corpurl).then(res => { parse_corps(app, res, alli_id, url); }).catch(e => { failed(e, alli_id); }));

    }

    await Promise.all(promises).catch();
}

async function parse(app, res, alli_id, url) {
  try {
    if (res.statusCode == 200) {
        var body = JSON.parse(res.body);

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
        if (res.statusCode != 502) console.log(res.statusCode + ' ' + url);
        setTimeout(function() { app.error_count--; }, 1000);

        if (res.statusCode == 420) {
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
        if (res.statusCode == 200) {
            var body = JSON.parse(res.body);
            if (body.length == 0) {
                await app.mysql.query('update ew_corporations set alliance_id = 0 where alliance_id = ?', [alli_id]);
                await app.mysql.query('update ew_characters set lastAffUpdated = 0 where alliance_id = ?', [alli_id]);
            } else {
                for (let i = 0; i < body.length; i++) {
                    let corp_id = body[i];
                    await entity.add(app, 'corp', corp_id);
                    await app.mysql.query('update ew_corporations set alliance_id = ? where corporation_id = ? and alliance_id != ?', [alli_id, corp_id, alli_id]);
                }
                await app.mysql.query('update ew_corporations set alliance_id = 0 where alliance_id = ? and corporation_id not in (' + body.map((i) => parseInt(i)).join (',') + ')', alli_id);
                await app.mysql.query('update ew_characters set lastAffUpdated = 0 where alliance_id != ? and corporation_id in (' + body.map((i) => parseInt(i)).join (',') + ')', alli_id);
                await app.mysql.query('update ew_characters set lastAffUpdated = 0 where alliance_id = ? and corporation_id not in (' + body.map((i) => parseInt(i)).join (',') + ')', alli_id);
            }
        } else {
            console.log(res.statusCode + ' ' + url);
        }
    } catch (e) {
        console.log(url + ' ' + e);
    }
}

async function failed(e, alli_id) {
    console.log(e);
}
