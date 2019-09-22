#!/usr/bin/env node

var Database = require('../classes/Database.js');
var getJSON = require('get-json');
var redis = require('async-redis').createClient();
var phin = require('phin').defaults({'headers': { 'User-Agent': 'evewho.com' } });

const app = {};

app.debug = false;
app.bailout = false;
app.error_count = 0;
app.phin = phin;
app.redis = redis;
app.mysql = new Database({
host: 'localhost',
user: 'evewho',
password: 'evewho',
database: 'evewho'
});
app.sleep = function sleep(ms){ return new Promise(resolve=>{ setTimeout(resolve,ms) });}

if (process.argv[2]) {
    debug(process.argv[2]);
    return;
}

let tasks = {
    '../cron/daily.js': { span : 86400 },
    '../cron/hourly.js': { span: 3600 },
    '../cron/home.js': { span: 900 },
    '../cron/populate_alliances.js': { span: 3600 },
    '../cron/update_characters.js': { span: 1 },
    '../cron/update_corporations.js': { span: 15 },
    '../cron/update_alliances.js': { span: 15 },
    '../cron/recalculate_alliances.js': { span: 60 },
}

// Clear existing runnign keys
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

            f = require(task);
            setTimeout(() => { runTask(task, f, app, curKey, runKey); }, 1);
        }
    }
    if (app.debug == false) setTimeout(function() { runTasks(app, tasks); }, 1000);
}

async function runTask(task, f, app, curKey, runKey) {
    try {
        let ret = await f(app);
        if (ret !== false) console.log(task + ' executed ');
    } catch (e) {
        console.log(task + ' failure: ' + e);
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
    process.exit();
}
