var $ = jQuery = require('jquery');
const jBox = require('jbox');
const BadgerAccordion = require('badger-accordion');
const request = require('request');
require('bootstrap');
require('chosen-js');

var Swiper = require('swiper');
var previousModal;

global.rankingDetailAccordion;
global.equipmentSearchAccordion;
global.inCoolTimeForGearSetModal = false;

$(function () {
  initSwiper();
  initSearchEquipmentButton();
  initAccordions();
  initSearchGearSetButtonClickAction();
  initGearSetListInfiniteScroll();
  initRankingDetailSearchButtonClickAction();

  // init initial search result
  updateGearSetListByEquipmentId($('#gear-set-list-area').attr('data-equipment-id'), {
    page: $('#gear-set-list-area').attr('data-page'),
    gender: $('#gear-set-list-area').attr('data-gender-id'),
    race: $('#gear-set-list-area').attr('data-race-id'),
    job: $('#gear-set-list-area').attr('data-job-id'),
  });
  $('#gear-set-list-area').attr('data-equipment-id', 'all');
  $('#gear-set-list-area').attr('data-page', 0);
  $('#gear-set-list-area').attr('data-gender-id', 0);
  $('#gear-set-list-area').attr('data-race-id', 0);
  $('#gear-set-list-area').attr('data-job-id', 0);
});

function initAccordions() {
  rankingDetailAccordion = new BadgerAccordion('#ranking-detail-accordion', {});
  equipmentSearchAccordion = new BadgerAccordion('#equipment-search-accordion', {
    // openHeadersOnLoad: [0],
  });

  $('.ranking-detail-button').on('click', function () {
    var $button = $('.ranking-detail-button');
    if ($button.attr('aria-expanded') == 'true') {
      $('#accordion-status-indicator-for-detail-ranking').text("▲");
    } else {
      $('#accordion-status-indicator-for-detail-ranking').text("▼");
    }
  });
}

function initRankingDetailSearchButtonClickAction() {
  $('#ranking-detail-search-button').on('click', function () {
    var $this = $(this);
    if ($this.hasClass('disabled')) return;
    $this.addClass('disabled');

    var loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> 集計';
    if ($(this).html() !== loadingText) {
      $this.data('original-text', $(this).html());
      $this.html(loadingText);
    }

    request({
      url: MyUtil.getLocationOrigin() + '/fftrends/search_ranking_detail',
      method: 'GET',
      headers: {'Content-Type': 'application/json',},
      qs: {
        equipmentTypeId: $('#input-equipment-type-for-ranking').val(),
        serverId: $('#input-server-for-ranking').val(),
        jobId: $('#input-job-for-ranking').val(),
        genderId: $('#input-gender-for-ranking').val(),
        raceId: $('#input-race-for-ranking').val(),
      },
    }, function (error, response, body) {
      if (error) {
        console.log(error);
        return;
      }

      var data = JSON.parse(body);
      var results = data.results;

      var $tbody = $('#ranking-detail-result-table tbody');
      $tbody.empty();

      __.each(results, function (result) {
        var equipmentId = result[0];
        var equipmentTypeId = result[1];
        var equipmentNameEN = result[2];
        var equipmentNameJP = result[3];
        var count = result[4];

        // appendRankingResultRow(equipmentId, equipmentTypeId, equipmentNameEN, equipmentNameJP, count);
        var $tr = createSelectableEquipmentRow(equipmentId, equipmentTypeId, equipmentNameJP);
        $tr.append('<td>' + count + '</td>');
        $('#ranking-detail-result-table tbody').append($tr);
      });

      rankingDetailAccordion = new BadgerAccordion('#ranking-detail-accordion', {
        openHeadersOnLoad: [0],
      });

      initSearchEquipmentResultRowClickAction();

      $this.html($this.data('original-text'));
      setTimeout(function () {
        $this.removeClass('disabled');
      }, 2000);

    });
  });
}

function incrementGearSetListPage() {
  $('#gear-set-list-area').attr('data-page', Number($('#gear-set-list-area').attr('data-page')) + 1);
}

function initGearSetListInfiniteScroll() {
  var $window = $(window);
  var $document = $(document);

  $window.on("scroll", function () {
    var scrollBottom = $window.scrollTop() + $window.height();
    var documentHeight = $document.height();
    var hasNextPage = $('#gear-set-list-area').attr('data-has-next-page') == 'true';
    var isCoolTime = $('#gear-set-list-area').attr('data-is-cool-time') == 'true';

    if (hasNextPage && !isCoolTime && scrollBottom >= documentHeight) {
      $('#gear-set-list-area').attr('data-is-cool-time', true);
      setTimeout(function () {
        $('#gear-set-list-area').attr('data-is-cool-time', false);
      }, 500);

      updateGearSetListByEquipmentId($('#gear-set-list-area').attr('data-equipment-id'), {
        page: $('#gear-set-list-area').attr('data-page'),
        gender: $('#gear-set-list-area').attr('data-gender-id'),
        race: $('#gear-set-list-area').attr('data-race-id'),
        job: $('#gear-set-list-area').attr('data-job-id'),
      });
    }
  });
}

function initSearchGearSetButtonClickAction() {
  $('#search-gear-set-button').on('click', function () {
    var $this = $(this);
    if ($this.hasClass('disabled')) return;
    $this.addClass('disabled');

    var loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> 集計';
    if ($(this).html() !== loadingText) {
      $this.data('original-text', $(this).html());
      $this.html(loadingText);
    }

    var equipmentId = $('#equipment-search-accordion').attr('data-selected-equipment-id');
    var page = 0;
    var gender = $('#gearset-search-input-gender').val();
    var race = $('#gearset-search-input-race').val();
    var job = $('#gearset-search-input-job').val();

    // save as table attribute for pagination
    $('#gear-set-list-area').attr('data-equipment-id', equipmentId);
    $('#gear-set-list-area').attr('data-page', page);
    $('#gear-set-list-area').attr('data-gender-id', gender);
    $('#gear-set-list-area').attr('data-race-id', race);
    $('#gear-set-list-area').attr('data-job-id', job);

    updateGearSetListByEquipmentId(equipmentId, {
      page: page,
      gender: gender,
      race: race,
      job: job,
    })
      .done(function() {
        $this.html($this.data('original-text'));
        setTimeout(function () {
          $this.removeClass('disabled');
        }, 2000);
      });

  });
}

function adjustGearSetSearchAccordionStatusIndicatorIfNeed() {
  setTimeout(function () {
    if (equipmentSearchAccordion.getState()[0]['state'] == 'closed') {
      console.log("CLOSED");
      $('#accordion-status-indicator-for-gearset-search').text("▼");
    } else {
      console.log("OPENED");
      $('#accordion-status-indicator-for-gearset-search').text("▲");
    }
  }, 300);
}

function initSearchEquipmentButton() {
  // init display
  updateSelectedEquipmentButton('all', 0, '全ての装備');

  // init accordion
  $('#equipment-search-accordion').children('dt').children('button').on('click', function () {
    if (equipmentSearchAccordion.getState()[0]['state'] == 'closed') {
      equipmentSearchAccordion.openAll();
    } else {
      equipmentSearchAccordion.closeAll()
    }

    adjustGearSetSearchAccordionStatusIndicatorIfNeed();
  });

  // init equipment search result table
  var $tbody = $('#equipment-search-tbody');
  $tbody.append(createAllEquipmentSearchRow());
  initSearchEquipmentResultRowClickAction();

  // init equipment search button
  $('#equipment-search-button').on('click', function () {
    var searchKeyword = $('#equipment-search-keyword-input').val();
    var $tbody = $('#equipment-search-tbody');
    var targetEquipmentType = $('#input-target-equipment-type').val();

    console.log(searchKeyword);
    searchEquipmentByName(searchKeyword, targetEquipmentType)
      .then(function (equipmentInfos) {
        $tbody.empty();

        var isExceedLimit = 30 <= equipmentInfos.length;
        $tbody.append(createAllEquipmentSearchRow());

        __.each(equipmentInfos, function (info) {
          $tbody.append(createSelectableEquipmentRow(info.id, info.type_id, info.name));
        });

        if (isExceedLimit) {
          $tbody.append($('<tr><td> ... </td></tr>'));
          $tbody.append($('<tr><td class="equipment-serch-result-warning-text"> ※最大表示件数を越えたため、検索結果が省略されました. 検索ワードをより具体的なものにしてください. </td></tr>'));
        }

        equipmentSearchAccordion = new BadgerAccordion('#equipment-search-accordion', {
          openHeadersOnLoad: [0],
        });

        initSearchEquipmentResultRowClickAction();
      });
  });
}

function createAllEquipmentSearchRow() {
  return createSelectableEquipmentRow('all', 0, '全ての装備');
}

function createSelectableEquipmentRow(equipmentId, equipmentTypeId, equipmentName) {
  var $tr = $('<tr>');
  $tr.append(
    $(
      '<td class="equipment-row" data-equipment-id="' + equipmentId + '" data-equipment-type-id="' + equipmentTypeId + '">' +
      '<img src="/img/equipment/icon/' + equipmentTypeId + '/' + equipmentId + '.png" class="ranking-equipment-icon">' +
      equipmentName +
      '</td>'
    )
  );
  return $tr;
}

function initSearchEquipmentResultRowClickAction() {
  // result row
  $('.equipment-row').on('click', function () {
    var $this = $(this);
    var equipmentId = $this.attr('data-equipment-id');
    var equipmentTypeId = $this.attr('data-equipment-type-id');
    var equipmentName = $this.text().trim();

    updateSelectedEquipmentButton(equipmentId, equipmentTypeId, equipmentName);

    var genderId = $('#gear-set-list-area').attr('data-gender-id');
    var raceId = $('#gear-set-list-area').attr('data-race-id');
    var jobId = $('#gear-set-list-area').attr('data-job-id');

    // save as table attribute for pagination
    $('#gear-set-list-area').attr('data-equipment-id', equipmentId);
    $('#gear-set-list-area').attr('data-page', 0);
    $('#gear-set-list-area').attr('data-gender-id', genderId);
    $('#gear-set-list-area').attr('data-race-id', raceId);
    $('#gear-set-list-area').attr('data-job-id', jobId);

    updateGearSetListByEquipmentId(equipmentId, {
      page: 0,
      gender: genderId,
      race: raceId,
      job: jobId,
    });

    $('html,body').animate({scrollTop: $('#gear-set-area').offset().top - $('#my-navbar').height() - 10}, 'fast');
    equipmentSearchAccordion.closeAll();
    adjustGearSetSearchAccordionStatusIndicatorIfNeed();

    var headerId = $(equipmentSearchAccordion.headers[0]).attr('id');
    equipmentSearchAccordion.setState(headerId);
  });
}

function updateSelectedEquipmentButton(equipmentId, equipmentTypeId, equipmentName) {
  $('#equipment-search-accordion').attr('data-selected-equipment-id', equipmentId);

  $('#equipment-search-selected-equipment-name').text(equipmentName);
  $('#equipment-search-selected-equipment-img').attr(
    'src',
    '/img/equipment/icon/' + equipmentTypeId + '/' + equipmentId + '.png'
  );
}

function searchEquipmentByName(searchKeyword, targetEquipmentTypeId) {
  var d = $.Deferred();

  request({
    url: MyUtil.getLocationOrigin() + '/fftrends/search_equipment',
    method: 'GET',
    headers: {'Content-Type': 'application/json',},
    qs: {
      keyword: searchKeyword,
      targetEquipmentTypeId: targetEquipmentTypeId
    },
  }, function (error, response, body) {
    if (error) {
      console.log(error);
      d.reject();
      return;
    }

    var data = JSON.parse(body);
    var equipmentInfos = data.result;

    d.resolve(equipmentInfos);
  });

  return d.promise();
}

function updateGearSetListByEquipmentId(equipmentId, options) {
  var d = $.Deferred();

  request({
      url: MyUtil.getLocationOrigin() + '/fftrends/search_gearset_image',
      method: 'GET',
      headers: {'Content-Type': 'application/json',},
      qs: __.extend({
        equipment_id: equipmentId,
      }, options),
    }, function (error, response, body) {
      if (error) {
        console.log(error);
        d.reject();
        return;
      }
      var json = JSON.parse(body);

      if (options.page == 0) {
        $('#gear-set-list-area').empty();
      }

      $('#gear-set-list-area').attr('data-has-next-page', json.hasNextPage);

      __.each(json.snapshotIds, function (snapshotId) {
        var portraitImage = $('<div class="gear-set-block" value="' + snapshotId + '"><img src="/img/portrait/1/' + snapshotId + '.png" class="gear-set-image"></div>');

        $('#gear-set-list-area').append(portraitImage);
      });

      incrementGearSetListPage();
      initGearSetClickAction();
      d.resolve();
    }
  );

  return d.promise();
}

function initGearSetClickAction() {
  $('.gear-set-block').on('click', function () {
    if (inCoolTimeForGearSetModal) return;
    inCoolTimeForGearSetModal = true;

    var snapshotId = this.getAttribute('value');
    var jBoxModal = new jBox('Modal', {
      width: '90%',
      // height: '100%',
      ajax: {
        url: 'http://localhost:3000/fftrends/snapshot/' + snapshotId,
        // reload: 'strict',
        reload: true,
        data: {
          isOpenInModal: true,
        }
      },

      onCreated: function () {
        if (previousModal) {
          previousModal.destroy();
        }

        previousModal = this;
      },
      onOpen: function () {
      },
      onClose: function () {
      },

      title: '<a target="_blank" href="http://localhost:3000/fftrends/snapshot/' + snapshotId + '">新規ウィンドウで開く</a>',
    });

    jBoxModal.open();

    setTimeout(function() {
      inCoolTimeForGearSetModal = false;
    }, 1000);
  });
}

function initSwiper() {
  var swiper = new Swiper('.swiper-container', {
    slidesPerView: 4,
    spaceBetween: 30,
    // autoplay: {
    //   delay: 3000,
    //   disableOnInteraction: false,
    // },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    // responsive setting
    breakpoints: {
      1024: {
        slidesPerView: 3,
        spaceBetween: 40,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
      640: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
      }
    },

  });
}
