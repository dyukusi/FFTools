var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('timeline_manager/index', { title: 'FFXIV Timeline Manager' });
});

router.get('/edit', function(req, res, next) {
    res.render('timeline_manager/index', { title: 'FFXIV Timeline Manager' });
});


module.exports = router;
