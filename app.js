var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var Database = require('./classes/Database.js');
var getJSON = require('get-json');
var redis = require('async-redis').createClient();
const app_path = __dirname;

var indexRouter = require('./routes.js');

var app = express();
app.root = __dirname;
app.redis = redis;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.enable('etag');
app.use(logger('dev'));

const server_started = Date.now();
app.use((req, res, next) => {
    res.locals.server_started = server_started;
    res.locals.googleua = process.env.googleua;
    next();
});

app.disable('x-powered-by');
app.use('/api/', require('cors')());

app.use(express.static(path.join(__dirname, 'public')));

app.use(async function(req, res, next) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let now = Date.now();
    now = now - (now % 1000);
    let key = 'ip:' + ip + ':' + now;

    res.app.redis.incr(key);
    res.app.redis.expire(key, 1000);

    let accesses = Number.parseInt(await res.app.redis.get(key));
    if (accesses > 10) {
        res.sendStatus(429);
    } else {
        next();
    }
});

app.locals.pretty = true;

app.use('/', indexRouter);
//app.use('/users', usersRouter);

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.sendStatus(404);
    next();
});

module.exports = app;

var mysql = new Database({
	host: 'localhost',
	user: 'evewho',
	password: 'evewho',
	database: 'evewho'
});
app.mysql = mysql;

//var update_chars = require('./bin/update_chars.js');
//update_chars(mysql);

//setTimeout(function() { process.exit(0); }, 60000);
setInterval(function() { checkMysql(app); }, 15000);
async function checkMysql(app) {
    try {
        let result = await app.mysql.query('select * from ew_characters limit 5');
    } catch (e) {
        console.log('Lost mysql connection');
        process.exit(1);
    }
}
