module.exports = f;

const entity = require('../classes/entity.js');

let max_char_id = undefined;

async function f(app) {
    try {
        if (max_char_id === undefined) {
            max_char_id = await app.mysql.queryField('char_id', 'select max(character_id) char_id from ew_characters where character_id > 2112000000 and character_id < 2200000000');
        }
        let delta = Math.floor(Math.random() * 10) + 1;
        let next_id = max_char_id + delta;

        let res = await app.phin('https://esi.evetech.net/v4/characters/' + next_id + '/');
        if (res.statusCode == 200) {
            for (let i = max_char_id + 1; i <= next_id; i++) {
                await entity.add(app, 'char', i);
            }
            max_char_id = next_id;
        }
    } catch (e) {
        console.log(e);
    }
}
