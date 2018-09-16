var $ = jQuery = require('jquery');
var __ = require('underscore');
var request = require('request');
var YouTubeIframeLoader = require('youtube-iframe');
var MyUtil = require('./lib/util.js');
var Handsontable = require('handsontable');
require('chosen-js');
require('lightbox2');
require('jquery-ui-dist/jquery-ui.min.js');
require('bootstrap');

var timelineIdHash = location.pathname.split("/").pop();
var player;
var state;
var htElement = document.getElementById("handsontable");

// main process
$(function () {
  var options = {
    url: MyUtil.getLocationOrigin() + '/fftimelines/get/' + timelineIdHash,
    method: 'GET',
    headers: {'Content-Type': 'application/json',},
  };

  request(options, function (error, response, body) {
    var data = JSON.parse(body);

    $.when(
      initSplitPane(),
      initDragAndDropElements(),
      initYoutubeVideo(data["youtube_video_id"]),
      initDialog(),
    ).then(function () {
      initHandsonTable(data["headers"], data["video_length"], data["timeline_array"]);
      adjustHandsontableHeight();

      initSubmitModal();
      initSubmitButton();
      initEditMaterialsPane();
      initDeleteTimelineButton();

      initOpenReportModalButton();
      initOpenDeleteTimelineModalButton();
      initReportTimelineButton();
      initConfirmMovePageDialog();

      $(function () {
        $("#tabs").tabs();
      });
    }).done(function () {
      initToolTip();
      console.log("initialization completed");
    }).fail(function () {
      console.log("initialization failed");
    });
  });

});

function initConfirmMovePageDialog() {
  $(window).on('beforeunload', function(){
    return true;
  });
}


function initOpenReportModalButton() {
  $('#open-report-modal-button').on('click', function() {
    $('#report-modal').modal('show');
    $('#report-modal-title').text('Report form about \'' + timelineIdHash + '\'');
  });
}

function initReportTimelineButton() {
  $('#report-timeline-button').on('click', function() {
    var $this = $(this);
    var email = $('#report-email-input').val();
    var text = $('#report-text-input').val();

    if ($this.hasClass('disabled')) return;
    $this.addClass('disabled');

    var loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Deleting...';
    if ($this.html() !== loadingText) {
      $this.data('original-text', $this.html());
      $this.html(loadingText);
    }

    request({
      url: MyUtil.getLocationOrigin() + '/fftimelines/report/' + timelineIdHash,
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      json: {
        email: email,
        text: text
      },
    }, function (error, response, body) {
      if (body["success"]) {
        var $successAlert = $('#report-success-alert');
        $('#report-modal').modal('hide');
        $this.html($this.data('original-text'));

        $successAlert.show();

        setTimeout(function() {
          $this.removeClass('disabled');
        }, 5000);

        setTimeout(function() {
          $successAlert.fadeOut(500);
        }, 5000);
      } else {
        $this.removeClass('disabled');
        $this.html($this.data('original-text'));
      }
    });
  });

}




function initOpenDeleteTimelineModalButton() {
  $('#open-delete-timeline-modal-button').on('click', function() {

    request({
      url: MyUtil.getLocationOrigin() + '/fftimelines/check_owner/' + timelineIdHash,
      method: 'GET',
      headers: {'Content-Type': 'application/json',},
    }, function (error, response, body) {
      var data = JSON.parse(body);

      if (data["is_owner"]) {
        $('#delete-timeline-modal-for-owner').modal('show');
      } else {
        $('#delete-timeline-modal-for-guest').modal('show');
      }
    });

  });
}

function initDeleteTimelineButton() {

  $('#delete-timeline-button').on('click', function() {
    var $this = $(this);
    var $passwordInput = $('#timeline-admin-password-input-for-delete');
    var inputtedAdminPassword = $passwordInput.val();

    if ($this.hasClass('disabled')) return;
    $this.addClass('disabled');

    var loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Deleting...';
    if ($this.html() !== loadingText) {
      $this.data('original-text', $this.html());
      $this.html(loadingText);
    }

    request({
      url: MyUtil.getLocationOrigin() + '/fftimelines/delete/' + timelineIdHash,
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      json: {
        tl_admin_password: inputtedAdminPassword,
      },
    }, function (error, response, body) {
      if (body["success"]) {
        $('#delete-timeline-modal-for-owner').modal('hide');
        window.location.href = '/fftimelines/';
      } else {
        $this.removeClass('disabled');
        $this.html($this.data('original-text'));
      }
    });
  });

}

function initEditMaterialsPane() {
  $('#edit-materials').height($('#right').innerHeight() - $('#edit-navbar').innerHeight());
}

function initHandsonTable(colHeaders, videoLength, timelineArray) {
  var d = $.Deferred();

  var defaultCellSetting = {
    renderer: function (instance, td, row, col, prop, value, cellProperties) {
      var escaped = Handsontable.helper.stringify(value);
      var img;

      escaped = MyUtil.stripTags(escaped, '<em><b><strong><a><big><img>'); //be sure you only allow certain HTML tags to avoid XSS threats (you should also remove unwanted HTML attributes)

      // TODO 特定の画像のみ表示を許可
      // TODO 各行列の横幅縦幅も情報として保持, 再現できるようにしなければならない

      td.innerHTML = escaped;
      return td;
    },
  };

  var rowHeaders = [];
  __.times(videoLength, function (n) {
    rowHeaders.push(MyUtil.convertIntToMinSecStr(n));
  });

  var columns = generateColumnsSettingArray(defaultCellSetting, colHeaders.length);

  var colHeaderTexts = __.map(colHeaders, function (colHeader) {
    return colHeader["text"];
  });

  ht = new Handsontable(htElement, {
    data: timelineArray,
    height: $('#bottom').height() - 0,
    // height: '100%',
    width: '100%',
    colHeaders: colHeaderTexts,
    rowHeaders: rowHeaders,
    columns: columns,
    renderAllRows: true,
    manualColumnResize: true,
    // manualColumnMove: true,
    manualRowResize: true,
    // stretchH: 'all',

    allowInsertColumn: true,
    allowInsertRow: true,

    // currentRowClassName: 'my-selected-row',
    // currentColClassName: 'my-selected-row',

    contextMenu: {
      callback: function (key, options) {
      },
      items: {
        "rename-header": {
          name: "rename",
          callback: (function (optionName, selected) {
            var targetColIdx = selected[0].start.col;
            var currentName = ht.getColHeader()[targetColIdx];
            $("#col-header-name-input").val(currentName);

            var colHeadeRenameDialog = $("#col-header-rename-dialog").dialog({
              autoOpen: false,
              // height: 400,
              // width: 350,
              modal: true,
              buttons: {
                "OK": function () {
                  console.log("OK!!!!!!!");

                  var newName = $('#col-header-name-input').val();
                  var newHeader = ht.getColHeader();

                  newHeader[colHeadeRenameDialog.targetColIdx] = newName;

                  ht.updateSettings({
                    colHeaders: newHeader,
                  });

                  $('#col-header-name-input').val("");

                  colHeadeRenameDialog.dialog("close");
                },
                Cancel: function () {
                  colHeadeRenameDialog.dialog("close");
                }
              },
              close: function () {
                // form[0].reset();
                // allFields.removeClass( "ui-state-error" );
              }
            });

            colHeadeRenameDialog.targetColIdx = targetColIdx;

            colHeadeRenameDialog.dialog("open");
          }),
        },
        // TODO 現状は末尾追加しかできないので、途中追加できるようにする
        "add-column": {
          name: "add new column",
          callback: (function () {
            var colHeaders = ht.getColHeader();
            colHeaders.push("New Column");
            var columns = generateColumnsSettingArray(ht.defaultCellSetting, colHeaders.length);
            //

            ht.updateSettings({
              colHeaders: colHeaders,
              columns: columns,
            });
          }),
        },
        "remove-column": {
          name: "remove column",
          callback: function (optionName, selected) {
            var colHeaders = ht.getColHeader();
            var targetColIdx = selected[0].start.col;
            var data = ht.getData();
            var colWidths = [];
            __.times(ht.countCols(), function (col) {
              colWidths.push(ht.getColWidth(col));
            });

            MyUtil.removeColumn(data, [targetColIdx]);
            colHeaders.splice(targetColIdx, 1);
            colWidths.splice(targetColIdx, 1);

            var columns = generateColumnsSettingArray(ht.defaultCellSetting, colHeaders.length);

            ht.updateSettings({
              data: data,
              colHeaders: colHeaders,
              columns: columns,
              manualColumnResize: colWidths,
            });
          },
        },
      }
    },

    afterSelection: function (columnPos, rowPos) {
      var videoTimeMoveTo = columnPos; // NOTE: column index = time
      player.seekTo(videoTimeMoveTo);
    },

    afterChange: function () {
      initToolTip();
    }
  });

  // adjust column header widths
  var rowHeaderWidth = getRowHeaderWidth();
  var colHeaderWidths = __.map(colHeaders, function (colHeader) {
    var columnWidthPercentage = colHeader["column_width_percentage"];
    return rowHeaderWidth * (columnWidthPercentage / 100);
  });

  ht.updateSettings({
    manualColumnResize: colHeaderWidths,
  });

  ht.defaultCellSetting = defaultCellSetting;

  d.resolve();
  return d.promise();
}

function initDragAndDropElements() {
  // preparation of draggable elements
  $(".my-draggable").draggable({
    opacity: 0.6,
    stack: "#handsontable",
    helper: 'clone',
    appendTo: 'body'
  });

  $(".my-draggable").click(function () {
    return false;
  });

  $("#handsontable").droppable({
    accept: ".my-draggable",
    drop: function (event, ui) {
      // Hide the helper, so that we can use .elementFromPoint
      // to grab the item beneath the cursor by coordinate
      ui.helper.hide();
      var $destination = $(document.elementFromPoint(event.clientX, event.clientY));

      // Grab the parent tr, then the parent tbody so that we
      // can use their index to find the row and column of the
      // destination object
      var $tr = $destination.closest('tr');
      var $tbody = $tr.closest('tbody');

      // -1 means considering col header
      var col = $tr.children().index($destination) - 1; // TODO: header num should be got by dynamically
      var row = $tbody.children().index($tr);

      if (col < 0 || row < 0) return;

      var old = ht.getDataAtCell(row, col) || "";

      var $target = ui.draggable;

      if (ui.draggable[0].tagName == 'IMG') {
        var img = $('<img>', {
          src: $target.attr('src'),
          width: $target.width(),
          height: $target.height(),
          class: 'display_tooltip',
          title: $target.data('originalTitle'),
          'data-original-title': $target.data('originalTitle'),
        });

        ht.setDataAtCell(row, col, old + img.prop('outerHTML'));
      } else {
        ht.setDataAtCell(row, col, old + ui.draggable.text());
      }
    },
  });

}

function initSplitPane() {
  // split pane
  var split = Split(['#top', '#bottom'], {
    direction: 'vertical',
    gutterSize: 8,
    cursor: 'col-resize',
    sizes: [50, 50],
    minSize: 10,
    onDragEnd: adjustHandsontableHeight,
  })

  Split(['#left', '#right'], {
    sizes: [50, 50],
    gutterSize: 8,
    cursor: 'row-resize'
  })
}

function initYoutubeVideo(videoId) {
  YouTubeIframeLoader.load(function (YT) {
    player = new YT.Player('movieArea', { //ここに表示させる領域のIDを記述する
      height: '100%',
      width: '100%',
      videoId: videoId,
      events: {
        'onReady': function (event) {
          //event.target.playVideo();　// 動画再生
          //event.target.mute();　// ミュートにする

          var previous;
          var rowHeaders = $('.rowHeader');

          // ポーリング
          (function polling() {
            // 再生中
            if (player.getPlayerState() == YT.PlayerState.PLAYING) {
              var currentVideoTime = parseInt(player.getCurrentTime());

              if (previous != currentVideoTime) {
                // 再生中の時間のセルの背景色を変える
                ht.updateSettings({
                  renderAllRows: true,
                  cells: function (row, col, prop) {
                    if (row == currentVideoTime) {
                      var cell = ht.getCell(row, col);
                      if (cell && cell.style) {
                        // background
                        $(cell).css("backgroundColor", "black");

                        // border
                        $(cell).css("border-top", "1px solid red");
                        $(cell).css("border-bottom", "1px solid red");
                        if (col == 0) $(cell).css("border-left", "1px solid red");
                        if (col == ht.countCols() - 1) $(cell).css("border-right", "1px solid red");

                      }
                    }
                  },
                });

                var currentRowHeader = $(rowHeaders[currentVideoTime + 1]);
                currentRowHeader.addClass('current-row-header');

                previous = currentVideoTime;

                // scroll position adjustment
                var targetCell = $(ht.getCell(currentVideoTime, 0));
                var previousCell = $(ht.getCell(currentVideoTime - 1, 0));
                var headerCells = $('#handsontable thead th');

                var scrollTo = targetCell.position().top - previousCell.outerHeight() - headerCells.outerHeight();

                $('#handsontable .wtHolder').scrollTop(scrollTo);
              }
            }

            window.setTimeout(polling, 100);
          }());
        },

        'onStateChange': function (event) {
          state = event.data;
          initToolTip();
        }
      },
      //ここからカスタマイズ
      playerVars: {
        enablejsapi: 1,
        rel: 0, //最初の動画の再生が終了（または停止）したときに、プレーヤーに関連動画を表示するかどうか　0:表示しない 1:表示する　デフォルトは1
        showinfo: 0, //上部の動画タイトルを表示について　0：タイトルを表示させない　1：タイトルを表示させる　デフォルトは1
        // playlist: '6Y3bRMwBCP4', //次に流すyoutubeにアップした動画のID指定
        loop: 1, //ループをするかどうか　0:ループしない 1:ループをする　デフォルトは0
        controls: 1, //コントローラーを表示させるか　0:コントローラー無し 1:コントローラー有り　デフォルトは1
        autoplay: 0 //オートで再生させるか　0:オートで再生させない　1：オートで再生する　デフォルトは0
      }
    });
  });

}

function adjustHandsontableHeight() {
  ht.updateSettings({
    height: $('#bottom').height(),
    // height: '100%',
    width: '100%',
  });

  initEditMaterialsPane();
}

function generateColumnsSettingArray(setting, num) {
  var cols = [];
  __.times(num, function (n) {
    cols.push(setting);
  });
  return cols;
}

function initToolTip() {
  $(".display_tooltip").tooltip({
    track: true,
    show: false,
    hide: false,
    tooltipClass: "ui-tooltip"
  });
  console.log("tooltip");
}

function initDialog() {
  var d = $.Deferred();

  $("#col-header-rename-dialog").hide();

  d.resolve();
  return d.promise();
}

function initSubmitModal() {
  $('#open-submit-modal-button').on('click', function () {
    var $button = $(this);

    request({
      url: MyUtil.getLocationOrigin() + '/fftimelines/check_owner/' + timelineIdHash,
      method: 'GET',
      headers: {'Content-Type': 'application/json',},
    }, function (error, response, body) {
      var data = JSON.parse(body);

      if (data["is_owner"]) {
        submitTimeline($button);
      } else {
        $('#submit-modal-for-guest').modal('show');
      }
    });


  });
}

function initSubmitButton() {
  // for GUEST
  $('#submit-timeline-for-guest').on('click', function () {
    submitTimeline($(this));
  });
}

function submitTimeline(button) {
  var $this = button;
  var $passwordInput = $('#timeline-admin-password-input');

  if ($this.hasClass('disabled')) return;
  $this.addClass('disabled');

  var loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Submitting...';
  if ($this.html() !== loadingText) {
    $this.data('original-text', $this.html());

    $this.html(loadingText);
  }

  var password = $passwordInput.val();
  var colWidthPercentages = (function () {
    var rowHeaderWidth = getRowHeaderWidth();
    var colWidths = [];
    __.times(ht.countCols(), function (col) {
      colWidths.push(ht.getColWidth(col));
    });

    var result = __.map(colWidths, function (colWidth) {
      return Math.floor((colWidth / rowHeaderWidth) * 100);
    });

    return result;
  }());

  request({
    url: MyUtil.getLocationOrigin() + '/fftimelines/edit/' + timelineIdHash,
    method: 'POST',
    headers: {'Content-Type': 'application/json',},
    json: {
      col_header: ht.getColHeader(),
      col_width_percentages: colWidthPercentages,
      timeline: ht.getData(),
      tl_admin_password: password,
    },
  }, function (error, response, body) {
    if (body["success"]) {
      var $successAlert = $('#submit-success-alert');
      $('#submit-modal-for-guest').modal('hide');
      $this.html($this.data('original-text'));

      setTimeout(function() {
        $this.removeClass('disabled');
      }, 5000);

      $successAlert.show();
      setTimeout(function() {
        $successAlert.fadeOut(500);
      }, 5000);
    } else {
      $passwordInput.addClass("is-invalid");

      $this.removeClass('disabled');
      $this.html($this.data('original-text'));
    }
  });
}

function getRowHeaderWidth() {
  return $($('#handsontable .htCore')[2]).outerWidth();
}