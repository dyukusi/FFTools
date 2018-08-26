var player;
var state;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('movieArea', { //ここに表示させる領域のIDを記述する
    height: '100%', //動画の高さ指定
    //width: '640', //動画の幅指定
    width: '100%', //動画の幅指定
    videoId: 'iVe2T9TafvU', //youtubeにアップした動画のID指定
    //videoId: '84GITTejyok',
    events: {
      'onReady': onPlayerReady, //プレイ準備完了時の動作
      'onStateChange': onPlayerStateChange
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

//プレイ準備完了時の動作
function onPlayerReady(event) {
  event.target.playVideo();　// 動画再生
  event.target.mute();　// ミュートにする


  var compiled = _.template($("#lodashTemplate_userData").html());
  _.times(VIDEO_DURATION, function(n) {
    $("#userInfo").append(
      compiled({
        "name": n,
        "id": n
      }));
  });



  (function polling() {

    // 再生中
    if (state == YT.PlayerState.PLAYING) {
      console.log("playing");

    }

    window.setTimeout(polling, 500);
  }());
}

onPlayerStateChange = function(event) {
  state = event.data;
}
