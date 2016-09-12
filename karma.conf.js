//jshint strict: false
module.exports = function(config) {
  config.set({

    basePath: './',

    files: [
      './node_modules/angular/angular.js',
      './node_modules/angular-mocks/angular-mocks.js',
      './node_modules/underscore/underscore.js',
      './app/js/main.js',
      './app/js/*.js',
      './tests/*.js'
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['PhantomJS'],

    plugins: [
      'karma-coverage',
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-spec-reporter'
    ],

    reporters: ['spec', 'coverage'],

    preprocessors: {
      'app/js/*.js': ['coverage']
    },

    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    }
  });
};
