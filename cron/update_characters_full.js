module.exports = f;

const characters = require('../classes/characters.js');

const todaysDayOfMonth = new Date().getDate();

const set = new Set();

var m = false;

async function f(app) {
    if (app.isDowntime()) return;

    if (m == false) {
        m = true;
        var justAnyone = false;
        var numCalls = 0;

        try {
            let second = Math.round(Date.now() / 1000);
            //if ((second % 60) > 30) return;

            let chars = await app.mysql.query('select character_id, name from ew_characters where lastUpdated = 0 limit 10');

            if (chars.length == 0) chars = await app.mysql.query('select character_id, name from ew_characters where recent_change = 1 limit 10');

            if (chars.length == 0) {
                justAnyone = true;
                chars = await app.mysql.query('select character_id, name from ew_characters where corporation_id != 1000001 order by lastUpdated limit 1000');
            }


            for (let i = 0; i < chars.length; i++ ) {
                if (app.bailout == true) {
                    console.log('bailing');
                    break;
                }

                chars[i].name = chars[i].name || "";
                if (justAnyone == true && chars[i].name.indexOf(' Citizen ') !== -1) {
                    await app.mysql.query('update ew_characters set lastUpdated = now() where character_id = ?', chars[i].character_id);
                    console.log('skipping ' + i);
                    continue;
                }

                next(app, chars[i].character_id);
                await app.sleep(50);
                numCalls++;
                if (numCalls >= 10) break;
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
        await app.phin(url).then(res => { characters.parse(app, res, char_id, url); }).catch(e => { console.log(e); });
        
    } catch (e) {
        console.log(e);
    } finally {
        set.delete(char_id);
    }
}
