module.exports = function(grunt) {
  grunt.initConfig({
    cssmin: {
      compress: {
        files: {
          './min_sample.css': ['public/css/main.css', 'public/css/chosen.css'],
        }
      }
    },

    browserify : {
      new : {
        src : 'public/js/timeline_manager/new.js',
        dest : 'public/js/timeline_manager/compressed/new.min.js',
      },

      edit : {
        src : ['public/js/timeline_manager/edit.js'],
        dest : 'public/js/timeline_manager/compressed/edit.min.js',
      },

      header : {
        src : ['public/js/timeline_manager/header.js'],
        dest : 'public/js/timeline_manager/compressed/header.min.js',
      },

      fftimelines : {
        src : ['public/js/timeline_manager/fftimelines.js'],
        dest : 'public/js/timeline_manager/compressed/fftimelines.min.js',
      }
    },

    watch: {
      css: {
        files: ['public/css/*.css'],
        tasks: ['cssmin'],
      },

      new : {
        files : ['public/js/timeline_manager/new.js'],  // 監視対象のファイル
        tasks : ['browserify:new']  // 変更があったら呼ばれるタスク
      },

      edit : {
        files : ['public/js/timeline_manager/edit.js'],  // 監視対象のファイル
        tasks : ['browserify:edit']  // 変更があったら呼ばれるタスク
      },

      header : {
        files : ['public/js/timeline_manager/header.js'],  // 監視対象のファイル
        tasks : ['browserify:header']  // 変更があったら呼ばれるタスク
      },

      timelines : {
        files : ['public/js/timeline_manager/fftimelines.js'],  // 監視対象のファイル
        tasks : ['browserify:fftimelines']  // 変更があったら呼ばれるタスク
      },
    },

  });

  var pkg = grunt.file.readJSON('package.json');

  // import grunt libs
  var taskName;
  for(taskName in pkg.dependencies) {
    if(taskName.substring(0, 6) == 'grunt-') {
      grunt.loadNpmTasks(taskName);
    }
  }
  //grunt.loadNpmTasks('grunt-contrib');

  // tasks
  grunt.registerTask('default', ['cssmin', 'br']);
  grunt.registerTask('br', ['browserify']);
};
