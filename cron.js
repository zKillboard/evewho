var Database = require('./classes/Database.js');
var getJSON = require('get-json');
var redis = require('async-redis').createClient();

const app = {};

app.redis = redis;
app.mysql = new Database({
    host: 'localhost',
    user: 'evewho',
    password: 'evewho',
    database: 'evewho'
});

console.log('started');

let tasks = [  
    './cron/daily.js',
    './cron/hourly.js',
    './cron/home.js'
];

for (let i = 0; i < tasks.length; i++ ) {
    let task = tasks[i];
    console.log(task);
    setTimeout(function() { require(task)(app); }, 1);
}
