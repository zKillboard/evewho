module.exports = daily;

async function daily(app) {
    let mysql = app.mysql;

    await mysql.query("update ew_alliances set corp_count = 0 where memberCount = 0");
    await mysql.query("update ew_corporations set recalc = 1");
    await mysql.query("update ew_alliances set recalc = 1");

    setTimeout(function() { daily(app); }, 86400000);
    console.log('daily done...');
}
