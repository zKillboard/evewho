#!/usr/bin/env node

var Database = require('./classes/Database.js');
var getJSON = require('get-json');
var redis = require('async-redis').createClient();
var phin = require('phin').defaults({'parse': 'json', 'headers': { 'User-Agent': 'evewho.com' } });

const app = {};

app.phin = phin;
app.redis = redis;
app.mysql = new Database({
host: 'localhost',
user: 'evewho',
password: 'evewho',
database: 'evewho'
});

let tasks = {
    './cron/daily.js': { span : 86400 },
    './cron/hourly.js': { span: 3600 },
    './cron/home.js': { span: 900 },
    './cron/populate_alliances.js': { span: 3600 }
}

setTimeout(function() { runTasks(app, tasks); }, 1);
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

        if (await app.redis.get(curKey) != 'true' && await app.redis.get(curKey) != 'true') {
            await app.redis.setex(curKey, Math.max(60, taskConfig.span || 300), 'true');
            await app.redis.setex(runKey, Math.max(60, taskConfig.span || 300), 'true');

            f = require(task);
            setTimeout(() => { runTask(task, f, app, curKey, runKey); }, 1);
        }
    }
    setTimeout(function() { runTasks(app, tasks); }, 1000);
}

async function runTask(task, f, app, curKey, runKey) {
    try {
        console.log(task + ' executing');
        await f(app);
        console.log(task + ' executed');
    } catch (e) {
        console.log(task + ' failure: ' + e);
    } finally {
        await app.redis.del(runKey);
    } 
}
