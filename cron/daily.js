module.exports = {
	exec: daily,
	span: 86400
}

async function daily(app) {
	let mysql = app.mysql;

	await mysql.query("update ew_alliances set corp_count = 0 where memberCount = 0");
	//    await mysql.query("update ew_corporations set recalc = 1");
	//    await mysql.query("update ew_alliances set recalc = 1");

	await mysql.query(`
  UPDATE ew_alliances
  SET memberCount = COALESCE(memberCount, 0)
`);
	await mysql.query(`
  UPDATE ew_corporations
  SET memberCount = COALESCE(memberCount, 0)
`);
	
	await mysql.query(`
  UPDATE ew_alliances
  SET
    mc_7 = COALESCE(mc_6, mc_7),
    mc_6 = COALESCE(mc_5, mc_6),
    mc_5 = COALESCE(mc_4, mc_5),
    mc_4 = COALESCE(mc_3, mc_4),
    mc_3 = COALESCE(mc_2, mc_3),
    mc_2 = COALESCE(memberCount, mc_2)
`);

	await mysql.query(`
  UPDATE ew_corporations
  SET
    mc_7 = COALESCE(mc_6, mc_7),
    mc_6 = COALESCE(mc_5, mc_6),
    mc_5 = COALESCE(mc_4, mc_5),
    mc_4 = COALESCE(mc_3, mc_4),
    mc_3 = COALESCE(mc_2, mc_3),
    mc_2 = COALESCE(memberCount, mc_2)
`);

	await mysql.query(`
  UPDATE ew_corporations
  SET diff = -1 * (COALESCE(mc_7, memberCount) - memberCount)
`);

	await mysql.query(`
  UPDATE ew_alliances
  SET diff = -1 * (COALESCE(mc_7, memberCount) - memberCount)
`);
}
