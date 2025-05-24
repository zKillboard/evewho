module.exports = {
    exec: f,
    span: 15
}

async function f(app) {
    let allis = await app.mysql.query('select * from ew_alliances where recalc = 1 limit 1000');
    for (let i = 0; i < allis.length; i++) {
        let alli = allis[i];

        let row = await app.mysql.queryRow('select count(*) count, avg(sec_status) avg_sec_status, count(distinct corporation_id) corp_count from ew_characters where alliance_id = ?', [alli.alliance_id]);

        await app.mysql.query('update ew_alliances set corp_count = ?, memberCount = ?, avg_sec_status = ?, diff = -1 * (mc_7 - ?), recalc = 0 where alliance_id = ?', [row.corp_count, row.count, row.avg_sec_status, row.count, alli.alliance_id]);
    }
}
