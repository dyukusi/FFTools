var $ = jQuery = require('jquery');
var __ = require('underscore');
require('bootstrap');
var queryString = require('query-string');
var Zooming = require('zooming');

$(function () {
  var snapshotId = $('#dummy-form-snapshot-id').val();
  const query = queryString.parse(location.search);

  if (!__.isEmpty($('#is-disable-zoom'))) {
    new Zooming({
      bgColor: 'black',
      bgOpacity: 0.5,
    }).listen('#snapshot-gear-set-image');
  }


  // var demoTrigger = document.querySelector('#snapshot-gear-set-image');
  // // var paneContainer = document.querySelector('.snapshot-' + snapshotId);
  // var paneContainer = document.querySelector('.portrait-area');
  //
  // new Drift(demoTrigger, {
  //   paneContainer: paneContainer,
  //   inlinePane: false,
  //   // hoverBoundingBox: true,
  // });
});
