module.exports = daily;

async function daily(app) {
    let mysql = app.mysql;

    await mysql.query("update ew_alliances set corp_count = 0 where memberCount = 0");
    await mysql.query("update ew_corporations set recalc = 1");
    await mysql.query("update ew_alliances set recalc = 1");

    await mysql.query("update ew_alliances set mc_7 = mc_6, mc_6 = mc_5, mc_5 = mc_4, mc_4 = mc_3, mc_3 = mc_2, mc_2 = memberCount");
    await mysql.query("update ew_corporations set mc_7 = mc_6, mc_6 = mc_5, mc_5 = mc_4, mc_4 = mc_3, mc_3 = mc_2, mc_2 = memberCount");
    await mysql.query("update ew_corporations set diff = -1 * (mc_7 - memberCount)");
    await mysql.query("update ew_alliances set diff = -1 * (mc_7 - memberCount)");
}
