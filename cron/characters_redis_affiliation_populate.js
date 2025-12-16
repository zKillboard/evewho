'use strict';

module.exports = {
exec: f,
      span: 1
}

var m = false;
var date = undefined;

const affLonger = 'select character_id from ew_characters where lastEmploymentChange < date_sub(now(), interval 5 year);';
const affRecent = 'select character_id from ew_characters where lastEmploymentChange >= date_sub(now(), interval 5 year)';

const bucketLong = 'evewho:affiliates';
const bucketRecent = 'evewho:affiliates:recent';

async function f(app) {
    if (m == false) {
        try {
            m = true;

            if (await getCount(app, bucketLong) === 0) await populate(app, affLonger, bucketLong);
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
    const multi = app.redis.multi();
    let count = 0;
    
    return new Promise((resolve, reject) => {
        const stream = app.mysql.connection.query(query).stream();
        
        stream.on('data', (row) => {
            multi.sadd(bucket, row.character_id);
            count++;
        });
        
        stream.on('end', async () => {
            await multi.exec();
            console.log(`Populated ${count} into ${bucket}`);
            resolve();
        });
        
        stream.on('error', (err) => {
            stream.destroy();
            multi.discard();
            reject(err);
        });
    });
}
