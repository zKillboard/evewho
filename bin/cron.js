#!/usr/bin/env node

var Database = require('../classes/Database.js');
var getJSON = require('get-json');
var redis = require('async-redis').createClient();
var phin = require('phin').defaults({'method': 'get', 'headers': { 'User-Agent': 'evewho.com' } });

const app = {};

app.debug = false;
app.bailout = false;
app.error_count = 0;
app.phin = phin;
app.fetch = async function(url, parser, failure, options) {
    try {
        return await parser(app, await phin(url), options);
    } catch (e) {
        return failure(app, e);
    }
};
app.redis = redis;
app.mysql = new Database({
host: 'localhost',
user: 'evewho',
password: 'evewho',
database: 'evewho'
});
app.sleep = function sleep(ms){ return new Promise(resolve=>{ setTimeout(resolve,ms) });}
app.isDowntime = function () {
    var time = new Date();
    var min = time.getMinutes();
    var hour = ('0' + time.getHours()).substr(-2);
    var hi = hour + min;
    return (hi >= '1055' && hi <= '1130');
}

if (process.argv[2]) {
    debug(process.argv[2]);
    return;
}

let tasks = {
    'daily.js': { span : 86400 },
    'hourly.js': { span: 3600 },
    'home.js': { span: 900 },
    'populate_alliances.js': { span: 3600 },
    //'dustcleanup.js': {span: 1},
    'update_characters.js': {span: 1},
    'update_characters_full.js': {span: 1},
    'update_characters_by_affiliation.js': { span: 1},
    'update_characters_history.js': { span: 1 },
    'update_corporations.js': { span: 1 },
    'update_alliances.js': { span: 15 },
    'recalculate_alliances.js': { span: 15 },
    'recalculate_corporations.js': { span: 15 },
    'listen_redisq.js': { span: 60 },
    'populate_newbies.js': { span: 15 },
    'characters_redis_affiliation_populate.js': {span: 1},
}

// Clear existing running keys
setTimeout(function() { clearRunKeys(app); }, 1);
async function clearRunKeys(app) {
    let runkeys = await app.redis.keys('crinstance:running*');
    for (let i = 0; i < runkeys.length; i++) {
        await app.redis.del(runkeys[i]);
    }
    setTimeout(function() { runTasks(app, tasks); }, 1);
}

async function runTasks(app, tasks) {
    let now = Date.now();
    now = Math.floor(now / 1000);

    let arr = Object.keys(tasks);
    for (let i = 0; i < arr.length; i++ ) {
        let task = arr[i];
        let taskConfig = tasks[task];
        let currentSpan = now - (now % taskConfig.span);
        let curKey = 'crinstance:current:' + task + ':' + currentSpan;
        let runKey = 'crinstance:running:' + task;

        if (await app.redis.get(curKey) != 'true' && await app.redis.get(runKey) != 'true') {
            await app.redis.setex(curKey, taskConfig.span || 300, 'true');
            await app.redis.setex(runKey, 300, 'true');

            f = require('../cron/' + task);
            setTimeout(() => { runTask(task, f, app, curKey, runKey); }, 1);
        }
    }
    await app.sleep(Math.min(1000, Date.now() - now));
    if (app.debug == false) runTasks(app, tasks);
}

async function runTask(task, f, app, curKey, runKey) {
    try {
        await f(app);
    } catch (e) {
        console.log(task + ' failure:');
        console.log(e);
    } finally {
        await app.redis.del(runKey);
    } 
}

async function debug(task) {
    app.debug = true;
    console.log('Debugging ' + task);
    let f = require('../cron/' + process.argv[2]);
    await runTask(process.argv[2], f, app, '0', '0');
    await app.sleep(1000);
    console.log('Exiting debug');
    process.exit();
}
