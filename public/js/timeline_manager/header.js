$ = jQuery = require('jquery');
MyUtil = require('./lib/util.js');
__ = require('underscore');
Q = require('q');
request = require('request');
async = require('async');
sprintf = require('sprintf-js').sprintf;
require('bootstrap');

var validator = require('validator');

$(function () {
  request({
    url: MyUtil.getLocationOrigin() + '/header',
    method: 'GET',
    headers: {'Content-Type': 'html/text',},
  }, function (error, response, body) {
    $("#header").html(body);
    $('body').css({
      "padding-top": Number($('#my-navbar').height() + 10) + "px",
    });

    if (location.pathname === "/") {
      $('#nav-about').addClass("active");
      // $('#nav-about').css('pointer-events', 'none');
    } else if (location.pathname.match("fftimelines")) {
      $('#nav-fftimelines').addClass("active");
      // $('#nav-fftimelines').css('pointer-events', 'none');
    } else if (location.pathname.match("fftrends")) {
      $('#nav-fftrends').addClass("active");
    }

    adjustPageByLoginStatus();

    // Open Login Modal Button
    $('#open-login-modal-button').on('click', function () {
      $('#login-modal').modal('show');
    });

    // Open Registry Modal Button
    $('#open-registry-modal-button').on('click', function () {
      $('#registry-modal').modal('show');
    });

    // Logout button
    $('#logout-button').on('click', function () {
      var $this = $(this);
      $this.css("cursor","pointer");

      request({
        url: MyUtil.getLocationOrigin() + '/logout',
        method: 'GET',
        headers: {'Content-Type': 'application/json',},
      }, function (error, response, body) {
        var json = JSON.parse(body);
        if (body["success"]) {

        }

        adjustPageByLoginStatus();
      });

    });


    // Login Button
    $('#login-button').on('click', function () {
      var $this = $(this);

      if ($this.hasClass('disabled')) return;
      $this.addClass('disabled');
      $("#login-wrong-email-or-password").hide();

      var email = $("#login-email-input").val();
      var password = $("#login-password-input").val();
      var isOK = true;

      // loading
      var loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Login';
      if ($(this).html() !== loadingText) {
        $this.data('original-text', $(this).html());
        $this.html(loadingText);
      }

      // Email
      if (!validator.isEmail(email)) {
        isOK = false;
        $("#login-email-input").addClass("is-invalid");
      } else {
        $("#login-email-input").removeClass("is-invalid");
        $("#login-email-input").addClass("is-valid");
      }

      // Password
      if (!validator.isLength(password, {min: 6, max: 30})) {
        isOK = false;
        $("#login-password-input").addClass("is-invalid");
      } else {
        $("#login-password-input").removeClass("is-invalid");
        $("#login-password-input").addClass("is-valid");
      }

      if (isOK) {
        request({
          url: MyUtil.getLocationOrigin() + '/login',
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          json: {
            email: email,
            password: password,
          },
        }, function (error, response, body) {
          adjustPageByLoginStatus();

          if (body["success"]) {
            $this.removeClass('disabled');
            $this.html($this.data('original-text'));
            $('#login-modal').modal('hide');
          } else {
            $("#login-wrong-email-or-password").show();
            $this.html($this.data('original-text'));
            setTimeout(function() {
              $this.removeClass('disabled');
            }, 2000);
          }
        });


      } else {
        $this.removeClass('disabled');
        $this.html($this.data('original-text'));
      }
    });

    // Registry Button
    $('#registry-button').on('click', function () {
      var $this = $(this);

      if ($this.hasClass('disabled')) return;
      $this.addClass('disabled');

      // loading
      var loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Registry';
      if ($(this).html() !== loadingText) {
        $this.data('original-text', $(this).html());
        $this.html(loadingText);
      }

      var loadstoneURL = $("#loadstone_url_input").val() + '';
      var email = $("#new_email_input").val();
      var password = $("#new_password_input").val();
      var isOK = true;

      // Loadstone URL
      if(!loadstoneURL.match("finalfantasyxiv.com/lodestone/character/[0-9]+/")) {
        isOK = false;
        $("#loadstone_url_input").addClass("is-invalid");
      } else {
        $("#loadstone_url_input").removeClass("is-invalid");
        $("#loadstone_url_input").addClass("is-valid");
      }

      // Email
      if (!validator.isEmail(email)) {
        isOK = false;
        $("#new_email_input").addClass("is-invalid");
      } else {
        $("#new_email_input").removeClass("is-invalid");
        $("#new_email_input").addClass("is-valid");
      }

      // Password
      if (!validator.isLength(password, {min: 6, max: 30})) {
        isOK = false;
        $("#new_password_input").addClass("is-invalid");
      } else {
        $("#new_password_input").removeClass("is-invalid");
        $("#new_password_input").addClass("is-valid");
      }

      if (isOK) {
        request({
          url: MyUtil.getLocationOrigin() + '/registry',
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          json: {
            loadstone_url: loadstoneURL,
            email: email,
            password: password,
          },
        }, function (error, response, body) {
          if (body["success"]) {
            $this.html("Completed");
            $('#registry-modal').modal('hide');
            $('#registration-success-modal').modal('show');
          } else {
            $this.html("Failed...");
            // TODO failed process
          }
        });

      } else {
        $this.removeClass('disabled');
        $this.html($this.data('original-text'));
      }

    });

    // my-account dropdown menu button
    $('#navbar-my-account').on('click', function () {
      var $this = $(this);

      if (!$this.hasClass('show')) {
        $this.addClass('show');
        $($this.children()[1]).addClass('show');
      } else {
        $this.removeClass('show');
        $($this.children()[1]).removeClass('show');
      }
    });

  });
});

function adjustPageByLoginStatus() {
  // check login status
  request({
    url: MyUtil.getLocationOrigin() + '/login/status',
    method: 'GET',
    headers: {'Content-Type': 'application/json',},
  }, function (error, response, body) {
    var json = JSON.parse(body);

    if (json['is_login']) {
      $('#navbar-my-account').show();
      $('#open-login-modal-button').hide();
      $('#open-registry-modal-button').hide();

      $('#login_name').text(json['name']);
      $('#my-char-img').removeClass("display-none");
      $('#my-char-img')[0].setAttribute("src", json['char_thumbnail_url']);
    } else {
      $('#navbar-my-account').hide();
      $('#open-login-modal-button').show();
      $('#open-registry-modal-button').show();

      $('#login_name').text('');
      $('#my-char-img').addClass("display-none");
      $('#my-char-img')[0].setAttribute("src", "");
    }
  });
}
