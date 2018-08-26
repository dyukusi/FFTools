require([
  'jquery',
  'underscore',
  'lib/util',
  'jquery-csv',
  'jquery-ui',
  'split',
  'const',
], function ($,
             _,
             Util,
             Jcsv,
             Jui,
             Split,
             Const
) {
  var lang = 'en'; // TODO: 多言語対応
  var langMap;
  var player;
  var state;
  var csvfile = 'timelines/omega_sigma_savage_4.csv';
  var htElement = document.getElementById("handsontable");
  var ht;

  // main process
  $(function () {

    initLang().then(function() {

      $.when(
        initHandsonTable(csvfile),
        initDragAndDropElements(),
        initSplitPane(),
        initYoutubeVideo(),
        initToolTip()
      ).then(function () {
        adjustHandsontableHeight();



        $(function() {
          $( "#tabs" ).tabs();
        });
      }).done(function () {
        console.log("initialization completed");
      }).fail(function () {
        console.log("initialization failed");
      });

    });


  });


  function initHandsonTable(timeLinePath) {
    var d = $.Deferred();

    var defaultCellSetting = {
      renderer: function (instance, td, row, col, prop, value, cellProperties) {
        var escaped = Handsontable.helper.stringify(value);
        var img;

        escaped = Util.stripTags(escaped, '<em><b><strong><a><big><img>'); //be sure you only allow certain HTML tags to avoid XSS threats (you should also remove unwanted HTML attributes)

        // TODO 特定の画像のみ表示を許可
        // TODO 各行列の横幅縦幅も情報として保持, 再現できるようにしなければならない

        td.innerHTML = escaped;
        return td;
      },
    };

    $.get(timeLinePath, 'text').done(function (data) {
      var csv = $.csv.toArrays(data);
      var colHeaders = csv.shift().splice(1);
      var rowHeaders = []
      var contents = [];

      _.each(csv, function (line) {
        var time = line[0];
        contents[time] = line.splice(1);
      })

      _.times(contents.length, function (n) {
        rowHeaders.push(Util.convertIntToMinSecStr(n));
      });

      var columns = generateColumnsSettingArray(defaultCellSetting, colHeaders.length);

      ht = new Handsontable(htElement, {
        data: contents,
        height: htElement.parentElement.offsetHeight,
        colHeaders: colHeaders,
        rowHeaders: rowHeaders,
        columns: columns,
        renderAllRows: true,
        manualColumnResize: true,
        manualRowResize: true,
        //stretchH: 'all',
        manualColumnMove: true,
        allowInsertColumn: true,
        allowInsertRow: true,

        contextMenu: {
          callback: function (key, options) {
          },
          items: {
            // TODO 現状は末尾追加しかできないので、途中追加できるようにする
            "add-column": {
              name: "add new column",
              callback: (function () {
                var colHeaders = ht.getColHeader();
                colHeaders.push("new column");
                var columns = generateColumnsSettingArray(ht.defaultCellSetting, colHeaders.length);

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

                Util.removeColumn(contents, [targetColIdx]);
                colHeaders.splice(targetColIdx, 1);

                var columns = generateColumnsSettingArray(ht.defaultCellSetting, colHeaders.length);

                ht.updateSettings({
                  data: contents,
                  colHeaders: colHeaders,
                  columns: columns,
                });
              },
            },
          }
        },


        afterSelection: function (columnPos, rowPos) {
          var videoTimeMoveTo = columnPos; // NOTE: column index = time
          player.seekTo(videoTimeMoveTo);
        },
      });

      ht.defaultCellSetting = defaultCellSetting;

      d.resolve();
    });

    return d.promise();
  }

  function initDragAndDropElements() {
    // preparation of draggable elements
    $(".draggable").draggable({
      opacity: 0.6,
      stack: "#handsontable",
      helper: 'clone',
      appendTo: 'body'
    });

    $(".draggable").click(function () {
      return false;
    });

    $("#handsontable").droppable({
      accept: ".draggable",
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

        var old = ht.getDataAtCell(row, col);

        var target = ui.draggable[0];
        if (ui.draggable[0].tagName == 'IMG') {
          var img = document.createElement('IMG');
          img.src = target.src;
          img.width = target.width;
          img.height = target.height;


          // Handsontable.dom.addEvent(img, 'mousedown', function (e){
          //   e.preventDefault(); // prevent selection quirk
          // });
          //
          // Handsontable.dom.empty(td);

          // TODO: set image
          ht.setDataAtCell(row, col, old + img.outerHTML);


        } else {
          ht.setDataAtCell(row, col, old + ui.draggable.text());
        }
      },

      over: function (event, element) {
        $(this).addClass("over"); // TODO: define over class
      },

      out: function (event, element) {
        $(this).removeClass("over");
      },

    });
    $("#handsontable").sortable();
  }

  function initSplitPane() {
    // split pane
    var split = Split(['#top', '#bottom'], {
      direction: 'vertical',
      gutterSize: 8,
      cursor: 'col-resize',
      sizes: [50, 50],
      minSize: 10,
      onDrag: adjustHandsontableHeight,
    })

    Split(['#left', '#right'], {
      sizes: [50, 50],
      gutterSize: 8,
      cursor: 'row-resize'
    })
  }

  function initYoutubeVideo() {
    player = new YT.Player('movieArea', { //ここに表示させる領域のIDを記述する
      height: '100%', //動画の高さ指定
      width: '100%', //動画の幅指定
      videoId: 'iVe2T9TafvU', //youtubeにアップした動画のID指定
      events: {
        'onReady': function (event) {
          //event.target.playVideo();　// 動画再生
          //event.target.mute();　// ミュートにする

          var previous;

          // ポーリング
          (function polling() {
            // 再生中
            if (player.getPlayerState() == YT.PlayerState.PLAYING) {
              var currentVideoTime = parseInt(player.getCurrentTime());

              if (previous != currentVideoTime) {
                // 再生中の時間のセルの背景色を変える
                ht.updateSettings({
                  cells: function (row, col, prop) {
                    if (row == currentVideoTime) {
                      var cell = ht.getCell(row, col);   // get the cell for the row and column
                      if (cell && cell.style) {
                        cell.style.backgroundColor = "#ccffcc";  // set the background color
                      }
                    }
                  },
                });



                previous = currentVideoTime;

                var tableTop = $("#handsontable").offset().top;
                var topPos = $(ht.getCell(0, 0)).offset().top - tableTop - 26;
                var targetPos = $(ht.getCell(currentVideoTime, 0)).offset().top - tableTop - 26;
                var scrollTo;

                if (targetPos > 0) scrollTo = Math.abs(topPos) + Math.abs(targetPos);
                else scrollTo = Math.abs(topPos) - Math.abs(targetPos);

                console.log("topPos: " + topPos + " targetPos: " + targetPos + " scrollTo: " + scrollTo);

                $('.wtHolder').scrollTop(scrollTo);
              }
            }

            window.setTimeout(polling, 100);
          }());
        },

        'onStateChange': function (event) {
          state = event.data;
        }
      },
      //ここからカスタマイズ
      playerVars: {
        enablejsapi: 1,
        rel: 0, //最初の動画の再生が終了（または停止）したときに、プレーヤーに関連動画を表示するかどうか　0:表示しない 1:表示する　デフォルトは1
        showinfo: 0, //上部の動画タイトルを表示について　0：タイトルを表示させない　1：タイトルを表示させる　デフォルトは1
        playlist: '6Y3bRMwBCP4', //次に流すyoutubeにアップした動画のID指定
        loop: 1, //ループをするかどうか　0:ループしない 1:ループをする　デフォルトは0
        controls: 1, //コントローラーを表示させるか　0:コントローラー無し 1:コントローラー有り　デフォルトは1
        autoplay: 0 //オートで再生させるか　0:オートで再生させない　1：オートで再生する　デフォルトは0
      }
    });
  }

// テーブルを親divの高さに調整
// TODO: 汚い上に重いので代替案を探す
  function adjustHandsontableHeight() {
    ht.updateSettings({
      height: htElement.parentElement.offsetHeight,
    });
  }

  function generateColumnsSettingArray(setting, num) {
    var cols = [];
    _.times(num, function (n) {
      cols.push(setting);
    });
    return cols;
  }

  function initToolTip() {
    $(function () {
      $(".display_tooltip").tooltip({
        track: true,
        show: false,
        hide: false,
        tooltipClass: "ui-tooltip"
      });
    });
  }

  function initLang() {
    var d = $.Deferred();

    $.getJSON("others/lang.json", function (data) {
      langMap = data;
      d.resolve();
    });

    return d.promise();
  }


});
