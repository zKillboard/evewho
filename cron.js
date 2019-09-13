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
        let runKey = 'crinstance:running:' + task;
        let curKey = 'crinstance:current:' + task + ':' + currentSpan;

        if (await app.redis.setnx(runKey, 'true') === 1 && await app.redis.get(curKey) === null) {
            await app.redis.expire(runKey, taskConfig.expire || 300);
            await app.redis.set(curKey, 'true');
            await app.redis.expire(curKey, taskConfig.expire || 300);

            f = require(task);
            f(app).then(
                async function() {  i
                    await app.redis.del(runKey);
                    console.log(task + ' executed');
                },
                async function(reason) {
                    await app.redis.del(runKey);
                    console.log(task + ' failed: ' + reason);
            });
        }
    }
    setTimeout(function() { runTasks(app, tasks); }, 1000);
}
