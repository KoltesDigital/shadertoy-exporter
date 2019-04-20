const makeDir = require('make-dir');
const { join } = require('path');
const rimraf = require('rimraf-promise');

import { exportPNGs, removePNGs, stop as stopExportFrames } from './export-frames';
import { exportGIF, exportMP4, stop as stopExportVideos } from './export-videos';

export default ['$rootScope', ($rootScope) => {
	let iframe = null;
	let loaded = false;
	let exporting = false;
	const logs = [];
	const errors = [];

	function addLog(log) {
		logs.push(log);
	}

	function cleanLogs() {
		logs.length = 0;
	}

	function addError(err) {
		errors.push(err);
	}

	function cleanErrors() {
		errors.length = 0;
	}

	function isValidURL(url) {
		return typeof url === 'string' && url.lastIndexOf('https://www.shadertoy.com/view/', 0) === 0;
	}

	function setURL(url) {
		if (exporting) return;

		iframe.src = null;
		loaded = false;
		iframe.onload = () => {
			$rootScope.$apply(() => {
				loaded = true;
			});
		};
		iframe.src = url;
	}

	return {
		setIframe: (element) => {
			iframe = element;
		},
		isValidURL,
		goToURL: (url) => {
			if (!isValidURL(url)) return;
			return setURL(url);
		},
		goToHomepage: () => {
			return setURL('https://www.shadertoy.com/');
		},
		isLoaded: () => {
			return loaded;
		},
		export: (options) => {
			if (!iframe) return;
			if (!loaded || exporting) return;

			const gShaderToy = iframe.contentWindow.gShaderToy;
			if (!gShaderToy) return;

			exporting = true;
			cleanLogs();
			cleanErrors();

			addLog('Creating directory ' + options.directory + '.');
			let chain = makeDir(options.directory);

			if (options.cleanDirectoryBeforehand) {
				chain = chain.then(() => {
					addLog('Cleaning directory ' + options.directory + '.');
					$rootScope.$digest();
					return rimraf(join(options.directory, '*'));
				});
			}

			chain = chain.then(() => {
				addLog('Exporting PNG images.');
				$rootScope.$digest();
				return exportPNGs(options, iframe);
			})
				.then(() => {
					const promises = [];

					if (options.exportGIF) {
						addLog('Exporting GIF video.');
						promises.push(exportGIF(options));
					}

					if (options.exportMP4) {
						addLog('Exporting MP4 video.');
						promises.push(exportMP4(options));
					}

					if (promises.length) {
						$rootScope.$digest();
						return Promise.all(promises);
					}
				});

			if (options.pngRemoveAfterwards) {
				chain = chain.then(() => {
					addLog('Removing PNG images.');
					$rootScope.$digest();
					return removePNGs(options);
				});
			}

			chain.catch(addError)
				.then(() => {
					$rootScope.$apply(() => {
						exporting = false;
					});
				});
		},
		isExporting: () => {
			return exporting;
		},
		stop: () => {
			stopExportFrames();
			stopExportVideos();
		},
		getLogs: () => {
			return logs;
		},
		getErrors: () => {
			return errors;
		},
	};
}];
