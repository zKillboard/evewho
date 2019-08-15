var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var Database = require('./classes/Database.js');
var getJSON = require('get-json');
var redis = require('async-redis').createClient();
const app_path = __dirname;

var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();
app.root = __dirname;
app.redis = redis;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.enable('etag');
app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));

app.use(require('cors')());

app.use(express.static(path.join(__dirname, 'public')));

app.locals.pretty = true;

app.use('/', indexRouter);
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
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
