require('bootstrap');
require('chosen-js');
var TwitterWidgetsLoader = require('twitter-widgets');
var hasNext = true;
var requestListCount = 0;
var contentIdToDataMap = null;
var contentTypeIdToDataMap = null;

$(function () {
  async.waterfall([
    function (callback) {
      request({
          url: MyUtil.getLocationOrigin() + '/api/ffxiv/contents',
          method: 'GET',
          headers: {'Content-Type': 'application/json',},
        }, function (error, response, body) {

          if (error) {
            callback({error: error,});
          }
          var json = JSON.parse(body);
          contentIdToDataMap = json["contents"];
          contentTypeIdToDataMap = json["contentTypes"];


          callback(null);
        }
      );
    },
    function (callback) {
      initSearchButton();
      initInfiniteScrollProcess();
      initChosen();
      initNewButton();
      initNewTimelineCreateButton();

      // adjust table width
      var scbarWidth = getScrollbarWidth();
      $("#timeline_list thead").width($('#timeline_list').width() - scbarWidth);

      $(window).resize(function () {
        $("#timeline_list thead").width($('#timeline_list').width() - scbarWidth);
      });

      var start = $('#timeline_list table')[0].rows.length;
      updateTimelineList(start - 1, { // -1 considers header row
        order_by: 'updated_at',
      });

      // adjsut Twitter Timeline height then load
      $('#twitter-timeline').attr("data-height", $('#timeline_list').height() - $('#twitter-follow-button').height() - 5);
      TwitterWidgetsLoader.load();

      callback(null);
    },
  ], function (error) {
    console.log("initialization completed");
  });

});

function initNewTimelineCreateButton() {
  $('#new-timeline-create-button').on('click', function () {
    var $this = $(this);
    var $inputContentId = $('#new-timeline-select-content');
    var $inputTitle = $('#new-timeline-title-input');
    var $inputYoutubeVideoId = $('#new-timeline-youtube-video-id-input');
    var $inputAdminPassword = $('#new-timeline-admin-password-input');


    if ($this.hasClass('disabled')) return;
    $this.addClass('disabled');

    var loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Search';
    if ($(this).html() !== loadingText) {
      $this.data('original-text', $(this).html());
      $this.html(loadingText);
    }

    // var lang_en = $('#new-timeline-checkbox-en').prop('checked');
    // var lang_jp = $('#new-timeline-checkbox-jp').prop('checked');

    request({
      url: MyUtil.getLocationOrigin() + '/fftimelines/new',
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      json: {
        title: $inputTitle.val(),
        youtube_video_id: $inputYoutubeVideoId.val(),
        content_id: $inputContentId.val(),
        admin_password: $inputAdminPassword.val(),
      },
    }, function (error, response, body) {
      if (error) {
        throw new Error(error);
      }

      if (body['success']) {
        window.location.href = '/fftimelines/edit/' + body['id_hash'];
      } else {
        var validationErrors = body['validation_errors'];

        // TODO: dirty implement
        var errorTypeIdToInputMap = {
          1: $inputYoutubeVideoId,
          2: $inputAdminPassword,
          3: $inputContentId,
          4: $inputTitle
        };

        // init
        __.each(errorTypeIdToInputMap, function ($input, errorTypeId) {
          $input.addClass("is-valid");
          $input.removeClass("is-invalid");
        });

        // add feedback
        __.each(validationErrors, function(errorTypeId) {
          errorTypeIdToInputMap[errorTypeId].addClass("is-invalid");
          errorTypeIdToInputMap[errorTypeId].removeClass("is-valid");
        });

        $this.html($this.data('original-text'));

        setTimeout(function () {
          $this.removeClass('disabled');
        }, 2000);
      }

    });

  });

}

function initNewButton() {
  $('#new-button').on('click', function () {
    var $this = $(this);

    if ($this.hasClass('disabled')) return;
    $this.addClass('disabled');

    var loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Search';
    if ($(this).html() !== loadingText) {
      $this.data('original-text', $(this).html());
      $this.html(loadingText);
    }

    request({
      url: MyUtil.getLocationOrigin() + '/login/status',
      method: 'GET',
      headers: {'Content-Type': 'application/json',},
    }, function (error, response, body) {
      var json = JSON.parse(body);

      if (json['is_login']) {
        $('#new-timeline-modal').modal('show');
      } else {
        var $needLoginAlert = $('#need-login-alert');
        $needLoginAlert.show();
        console.log("showed")

        setTimeout(function () {
          $needLoginAlert.fadeOut(500);
        }, 5000);
      }

    });

    $this.html($this.data('original-text'));
    setTimeout(function () {
      $this.removeClass('disabled');
    }, 3000);

  });

}

function initSearchButton() {
  $('#search-button').on('click', function () {
    var $this = $(this);

    if ($this.hasClass('disabled')) return;
    $this.addClass('disabled');

    var searchKeyword = $("#search-keyword").val();
    var searchContentID = $("#search-content").val();
    var searchOrder = $("#search-order").val();

    var loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Search';
    if ($(this).html() !== loadingText) {
      $this.data('original-text', $(this).html());
      $this.html(loadingText);
    }

    $('#timeline_list tr:gt(0)').remove();
    requestListCount = 0;

    updateTimelineList(0, {
      title: searchKeyword,
      content_id: searchContentID,
      order_type: searchOrder,
      user_id: null,
    })
      .then(function () {
        $this.html($this.data('original-text'));

        setTimeout(function () {
          $this.removeClass('disabled');
        }, 3000);
      });
  });
}

function initChosen() {
  $("#search-content").chosen({
    search_contains: true,
    width: "100%",
  });

  $("#search-order").chosen({
    disable_search_threshold: 50,
    search_contains: true,
    width: "100%",
  });

  $("#new-timeline-select-content").chosen({
    search_contains: true,
    height: "10%",
    width: "100%",
  });
}

function initInfiniteScrollProcess() {
  var $tbody = $('#timeline_list_tbody');

  $tbody.on("scroll", function () {
    var start = $('#timeline_list table')[0].rows.length;
    var tbodyEle = $tbody[0];
    var scrollPosition = tbodyEle.offsetHeight + tbodyEle.scrollTop;
    var tbodyHeight = tbodyEle.scrollHeight;

    if (hasNext && tbodyHeight < scrollPosition) {
      var searchKeyword = $("#search-keyword").val();
      var searchContentID = $("#search-content").val();
      var searchOrder = $("#search-order").val();

      updateTimelineList(start - 1, {
        title: searchKeyword,
        content_id: searchContentID,
        order_type: searchOrder,
        user_id: null,
      });
    }

  });
}

function updateTimelineList(start, qs) {
  var d = Q.defer();

  request({
    url: MyUtil.getLocationOrigin() + '/fftimelines/search',
    method: 'GET',
    headers: {'Content-Type': 'application/json',},
    qs: __.extend({
      start: start,
    }, qs),
  }, function (error, response, body) {
    var json = JSON.parse(body);
    var timelines = json["timelines"];
    hasNext = json["has_next"];

    if (!__.isEmpty(timelines)) {
      requestListCount++;
    }

    __.each(timelines, function (tl) {
      var user = tl["user"];

      var idHash = tl["id_hash"];
      var userId = user["id"];
      var creatorName = user["name"];
      var charThumbnailUrl = user["char_thumbnail_url"];
      var contentId = tl["content_id"];
      var title = tl["title"];
      var language = tl["language"];
      var views = tl["views"];
      var favorite = tl["favorite"];
      var updatedAt = tl["updated_at"];

      appendTimelineTableRow(idHash, title, contentId, userId, creatorName, charThumbnailUrl, views, favorite, updatedAt);
    });

    $('.made-by-row').on('click', function () {
      var userId = this.getAttribute("value");

      $('#timeline_list tr:gt(0)').remove();
      requestListCount = 0;

      updateTimelineList(0, {
        user_id: userId,
        order_by: 'updated_at',
      });
    });

    $('.list-title-row').on('click', function () {
      var timelineIdHash = this.firstChild.getAttribute("value");
      window.open('/fftimelines/edit/' + timelineIdHash);
    });

    d.resolve();
  });

  return d.promise;
}

function getScrollbarWidth() {
  var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div></div>');
  $('body').append(div);
  var w1 = $('div', div).innerWidth();
  div.css('overflow-y', 'auto');
  var w2 = $('div', div).innerWidth();
  $(div).remove();
  return (w1 - w2);
}

function appendTimelineTableRow(idHash, title, contentId, userId, creatorName, charThumbnailUrl, views, favorites, updatedAt) {
  var date = new Date(updatedAt);
  var rowDesign = requestListCount % 2 != 0 ? 'table-active' : 'table-active-2';
  var contentData = contentIdToDataMap[contentId];
  var contentTypeData = contentTypeIdToDataMap[contentData["type_id"]];

  // content row
  var iconPath = contentData["icon_path"] || contentTypeData["icon_path"];
  var contentTypeImgHTML = sprintf(
    '<img class="content-type-img" src="%s">',
    iconPath
  );
  var contentRow = $('<td class="col-3">' + contentTypeImgHTML + contentData["title_en"] + '</td>');

  // Title Row
  var titleRowTextHTML = sprintf(
    "<span value=\"%s\">%s</span>",
    idHash, title
  );
  var titleRow = $('<td class="col-5 list-title-row">' + titleRowTextHTML + '</td>');

  // made by row
  var madeByImgHTML = sprintf(
    '<img class="made-by-img" src="%s">',
    charThumbnailUrl
  );
  var madeByRow = $('<td class="col-2 made-by-row" value="' + userId + '">' + madeByImgHTML + '' + creatorName + '</td>');

  var tr = $('<tr>', {
    class: rowDesign + ' d-flex',
  });

  var updatedString = (function(date) {
    var now = new Date();
    var diffHour = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHour) {
      if (diffHour < 24) return diffHour + 'h ago'
      else return date.toLocaleDateString();
    }

    return 'within 1h';
  }(date));

  tr.append(contentRow);
  tr.append(titleRow);
  tr.append(madeByRow);
  $('<td>', {class: "col-1",}).text(views).appendTo(tr);
  $('<td>', {class: "col-1",}).text(updatedString).appendTo(tr);

  tr.appendTo('#timeline_list_tbody').hide().fadeIn(300);
}

function isToday(date) {
  var today = new Date();
  return date.getFullYear() == today.getFullYear()
    && date.getMonth() == today.getMonth()
    && date.getDate() == today.getDate()
    ;
}
