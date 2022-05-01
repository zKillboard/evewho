'use strict';

var aff = 'evewho:affliates';
var m = false;
var date = undefined;

async function f(app) {
    if (m == false) {
        m = true;
        try {
            let count = parseInt(await app.redis.scard(aff) || 0);
            if (count == 0) {
                var updating = await app.mysql.query('select count(*) count from ew_characters where recent_change = 1');
                if (updating[0].count > 100) {
                    console.log('awaiting ' + updating[0].count + ' character updates');
                    return await app.sleep(15000);
                }

                console.log('Starting big affiliation query');
                let chars = await app.mysql.query('select character_id from ew_characters where corporation_id != 1000001 and recent_change = 0 order by lastAffUpdated limit 10000');
                console.log('Loading', chars.length, 'characters');
                for (let i = 0; i < chars.length; i++) {
                    var row = chars[i];
                    await app.redis.sadd(aff, row.character_id);
                }
                console.log('Finished big affiliation query');
            } else {

            }
    	} finally {
                m = false;
        }
    }
}

module.exports = f;
