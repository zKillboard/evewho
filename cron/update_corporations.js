module.exports = f;

async function f(app) {
    let promises = [];

    let corps = await app.mysql.query('select corporation_id from ew_corporations where lastUpdated < date_sub(now(), interval 1 day) order by lastUpdated limit 600');
    for (let i = 0; i < corps.length; i++ ){
        let row = corps[i];
        let corp_id = row.corporation_id;

        let url = 'https://esi.evetech.net/v4/corporations/' + corp_id + '/';
        promises.push(app.phin(url).then(res => { parse(app, res, corp_id, url); }).catch(e => { failed(e, corp_id); }));

        let sleep = 100 + (app.error_count * 1000);
        await app.sleep(sleep); // Limit to 10/s + time for errors
    }
    await Promise.all(promises).catch();
}

async function parse(app, res, corp_id, url) {
  try {
    if (res.statusCode == 200) {
        var body = JSON.parse(res.body);

        let r = await app.mysql.query('update ew_corporations set alliance_id = ?, faction_id = ?, ceoID = ?, memberCount = ?, name = ?, ticker = ?, taxRate = ? where corporation_id = ?', [d0(body.alliance_id), d0(body.faction_id), d0(body.ceo_id), d0(body.memberCount), body.name, body.ticker, d0(body.tax_rate), corp_id]);
        if (r.changedRows > 0) {
            await app.mysql.query('update ew_corporations set recalc = 1, lastUpdated = now() where corporation_id = ?', [corp_id]);
        } else {
            await app.mysql.query('update ew_corporations set lastUpdated = now() where corporation_id = ?', [corp_id]);
        }
    } else {
        app.error_count++;
        if (res.statusCode != 502) console.log(res.statusCode + ' ' + url);
        setTimeout(function() { app.error_count--; }, 1000);
    }
  } catch (e) { 
    console.log(url + ' ' + e);
  }
}

async function failed(e, corp_id) {
    console.log(e);
}

function d0(field) {
    return (field == undefined ? 0 : field);
}
