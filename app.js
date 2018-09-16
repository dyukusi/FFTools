process.on('uncaughtException', function (err) {
  console.log(err);
});

var appRoot = require('app-root-path');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

// global vars
global.Config = require('config');
global.appRoot = require('app-root-path');
global.__ = require('underscore');
global.MyUtil = require(appRoot + '/my_node_libs/util.js');
global.MyConst = require(appRoot + '/my_node_libs/const.js');
global.Q = require('q');
global.sprintf = require('sprintf-js').sprintf;
global.async = require('async');

var indexController = require('./controllers/index');
var usersController = require('./controllers/users');
var registryController = require('./controllers/registry');
var loginController = require('./controllers/login');
var timelineManagerController = require('./controllers/timeline_manager');
var apiController = require('./controllers/api');

var ContentTypeCollection = require(appRoot + '/collection/ContentTypeCollection.js').ContentTypeCollection;
var ContentCollection = require(appRoot + '/collection/ContentCollection.js').ContentCollection;
var RoleCollection = require(appRoot + '/collection/RoleCollection.js').RoleCollection;
var JobCollection = require(appRoot + '/collection/JobCollection.js').JobCollection;
var SkillCollection = require(appRoot + '/collection/SkillCollection.js').SkillCollection;

var ContentType = require(appRoot + '/models/ContentType.js').ContentType;
var Content = require(appRoot + '/models/Content.js').Content;
var Role = require(appRoot + '/models/Role.js').Role;
var Job = require(appRoot + '/models/Job.js').Job;
var Skill = require(appRoot + '/models/Skill.js').Skill;

Q.allSettled([
  ContentType.selectAll(),
  Content.selectAll(),
  Role.selectAll(),
  Job.selectAll(),
  Skill.selectAll(),
])
  .then(function (results) {
    global.ContentTypeCollection = new ContentTypeCollection(results[0].value);
    global.ContentCollection = new ContentCollection(results[1].value);
    global.RoleCollection = new RoleCollection(results[2].value);
    global.JobCollection = new JobCollection(results[3].value);
    global.SkillCollection = new SkillCollection(results[4].value);
  });


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'ffxivwebtools',
  resave: false,
  saveUninitialized: true,
  store: new RedisStore({
    host: '127.0.0.1',
    port: 6379,
    prefix: 'sid',
  }),
  cookie: {
    path: '/',
  }
}));

app.use('/', indexController);

app.use('/about', function (req, res) {
  res.render('about', {});
});

app.use('/logout', function (req, res) {
  if (req.session) {
    req.session.destroy();
  }
  res.send({success: true,});
});

app.use('/users', usersController);
app.use('/registry', registryController);
app.use('/login', loginController);
app.use('/fftimelines', timelineManagerController);
app.use('/api', apiController);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
