module.exports = f;

async function f(app) {
    let mysql = app.mysql;
    let redis = app.redis;

    await mysql.query("update ew_characters set name_phonetic = soundex(name) where name_phonetic is null");
    await mysql.query("update ew_corporations set name_phonetic = soundex(name) where name_phonetic is null");
    await mysql.query("update ew_alliances set name_phonetic = soundex(name) where name_phonetic is null");

    await mysql.query('delete from ew_characters where character_id = 0');
    await mysql.query('delete from ew_corporations where corporation_id = 0');
    await mysql.query('delete from ew_alliances where alliance_id = 0');

    let charsCount = await mysql.query("select count(*) count from ew_characters");
    let corpsCount = await mysql.query("select count(*) count from ew_corporations");
    let allisCount = await mysql.query("select count(*) count from ew_alliances");

    await redis.set('evewho:chars_count', charsCount[0].count);
    await redis.set('evewho:corps_count', corpsCount[0].count);
    await redis.set('evewho:allis_count', allisCount[0].count);
}
