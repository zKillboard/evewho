module.exports = {
    exec: f,
    span: 1
}

const characters = require('../classes/characters.js');

const todaysDayOfMonth = new Date().getDate();

const set = new Set();

var m = false;

async function f(app) {
    if (app.util.isDowntime()) return;

    if (m == false) {
        m = true;
        var justAnyone = false;

        try {
            let second = Math.round(Date.now() / 1000);

            let chars = await app.mysql.query('select character_id, name from ew_characters where lastUpdated = 0 limit 100');
            if (chars.length == 0) chars = await app.mysql.query('select character_id, name from ew_characters where recent_change = 1 limit 100');

            for (let i = 0; i < chars.length; i++ ) {
                while (app.error_count > 0) await app.sleep(1000);
                if (app.bailout == true) {
                    console.log('bailing');
                    break;
                }

                if (chars[i].corporation_id == 1000001) {
                    await app.mysql.query('update ew_characters set lastUpdated = now(), recent_change = 0 where character_id = ?', chars[i].character_id);
                    continue;
                }

                next(app, chars[i].character_id);
                await app.sleep(100);
                while (set.size > 10) await app.sleep(10);
            }

            while (set.size > 0) await app.sleep(10);
        } finally {
            m = false;
        }
    }
}

async function next(app, char_id) {
    try {
        set.add(char_id);

        let url = 'https://esi.evetech.net/v5/characters/' + char_id + '/';
        await app.phin(url).then(res => { characters.parse(app, res, char_id, url); }).catch(e => { console.log('error in phin', e); });
        
    } catch (e) {
        console.log(e);
    } finally {
        set.delete(char_id);
    }
}
