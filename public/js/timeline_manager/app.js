requirejs.config({
  "baseUrl": "./js",
  "paths": {
    jquery: "lib/vendor/jquery",
    underscore: "lib/vendor/underscore-min",
    "jquery-csv": "lib/vendor/jquery.csv.min",
    "util": "lib/util",
    "backbonejs": "lib/vendor/backbone-1.3.3-min",
    "jquery-ui": "lib/vendor/jquery-ui.min",
    "split": "lib/vendor/split-1.3.5.min",
    "micro-template": "lib/vendor/micro-templating",
    "const": "lib/const",
  },
  "shim": {
    "jquery": {
      exports: "jquery",
    },
    "underscore": {
      exports: "underscore",
    },
    "jquery-csv": {
      deps: ["jquery"],
      exports: "jquery-csv",
    },
    "util": {
      exports: "util",
    },
    "backbonejs": {
      deps: ["underscore"],
      exports: "backbonejs",
    },
    "jquery-ui": {
      deps: ["jquery"],
      exports: "jquery-ui",
    },
    "split": {
      exports: "split",
    },
    "micro-template": {
      exports: "micro-template"
    },
  }
});

// Load the main app module to start the app
requirejs(["app/main"]);
