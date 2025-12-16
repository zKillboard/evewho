'use strict';

module.exports = {
exec: f,
      span: 1
}

var m = false;
var date = undefined;

//const affLonger = 'select character_id from ew_characters where lastEmploymentChange < date_sub(now(), interval 5 year) order by lastAffUpdated limit 10000';
//const affRecent = 'select character_id from ew_characters where lastAffUpdate > date_sub(now(), interval 5 year) order by lastAffUpdated limit 10000';
const affRecent = 'select character_id from ew_characters order by lastAffUpdated limit 10000';

//const bucketLong = 'evewho:affiliates';
const bucketRecent = 'evewho:affiliates:recent';

async function f(app) {
    if (m == false) {
        try {
            m = true;

            //if (await getCount(app, bucketLong) === 0) await populate(app, affLonger, bucketLong);
            if (await getCount(app, bucketRecent) === 0) await populate(app, affRecent, bucketRecent);
        } finally {
            m = false;
        }
    }
}

async function getCount(app, bucket) {
    return parseInt(await app.redis.scard(bucket));
}

async function populate(app, query, bucket) {
    let chars = await app.mysql.query(query);
    const multi = app.redis.multi();
    
    for (let i = 0; i < chars.length; i++) {
        var row = chars[i];
        multi.sadd(bucket, row.character_id);
    }
    
    await multi.exec();
}
