// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
	config.set({
		basePath: '',
		frameworks: ['jasmine', '@angular-devkit/build-angular'],
		plugins: [
			require('karma-jasmine'),
			require('karma-chrome-launcher'),
			require('karma-jasmine-html-reporter'),
			require('karma-coverage'),
			require('@angular-devkit/build-angular/plugins/karma'),
			require('karma-teamcity-reporter')
		],
		client: {
			clearContext: false, // leave Jasmine Spec Runner output visible in browser,
			jasmine: {
				timeoutInterval: 60000
			}
		},
		jasmineHtmlReporter: {
			suppressAll: true // removes the duplicated traces
		},
		coverageReporter: {
			dir: require('path').join(__dirname, 'coverage'),
			reporters:[
				{type: 'html', dir:'coverage/'}
			],
			fixWebpackSourcePaths: true,
			check: {
				emitWarning: false,
				global: {
					statements: 29
				}
			}
		},

		reporters: ['progress', 'kjhtml', 'coverage'],
		port: 9801,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: true,
        browsers: ['Chrome', 'ChromeHeadlessCI'],
        customLaunchers: {
            ChromeHeadlessCI: {
              base: 'ChromeHeadless',
              flags: ['--no-sandbox']
            }
        },
		singleRun: false,
		browserDisconnectTimeout: 10000,
		browserDisconnectTolerance: 3,
		browserNoActivityTimeout: 60000,
		disconnectTolerance: 3
	});
};
