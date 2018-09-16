var appRoot = require('app-root-path');
var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/ffxiv/contents', function (req, res, next) {
  res.send({
    contentTypes: ContentTypeCollection.getIdToDataMap(),
    contents: ContentCollection.getIdToDataMap(),
  });
});

module.exports = router;
