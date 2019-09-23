module.exports = f;

async function f(app) {
    try {
        let max_char_id = await app.mysql.queryField('char_id', 'select max(character_id) char_id from ew_characters where character_id > 2112000000 and character_id < 2200000000');
        let delta = Math.floor(Math.random() * 10) + 1;
        let next_id = max_char_id + delta;

        let res = await app.phin('https://esi.evetech.net/v4/characters/' + next_id + '/');
        if (res.statusCode == 200) {
            for (let i = max_char_id + 1; i <= next_id; i++) {
                await app.mysql.query('insert ignore into ew_characters (character_id) values (?)', [i]);
            }
        }
    } catch (e) {
        // Can be ignored
    }
}
