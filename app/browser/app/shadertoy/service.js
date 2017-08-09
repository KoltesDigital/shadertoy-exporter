const { spawn } = require('child_process');
const fs = require('fs');
const makeDir = require('make-dir');
const { join } = require('path');
const rimraf = require('rimraf-promise');

export default ['$rootScope', ($rootScope) => {
	let iframe = null;
	let loaded = false;
	let pendingProcesses = 0;
	let stopped = false;

	const logs = [];

	function actualExport(options) {
		const player = iframe.contentDocument.getElementById('player');
		const gShaderToy = iframe.contentWindow.gShaderToy;
		if (!player || !gShaderToy) return;

		let frameNumber = 0;
		const frameCount = options.duration * options.fps;
		const frameDuration = 1 / options.fps;

		function spawnFFMPEG(args, callback) {
			args.push('-loglevel', 'error');
			const ffmpeg = spawn('ffmpeg', args);

			ffmpeg.stdout.on('data', (data) => {
				console.log(data.toString());
			});

			ffmpeg.stderr.on('data', (data) => {
				console.error(data.toString());
			});

			ffmpeg.on('close', () => {
				$rootScope.$apply(() => {
					return callback();
				});
			});
		}

		function doneExporting() {
			--pendingProcesses;
		}

		let frameCountBeforeVideoExports = frameCount;

		function countVideoExports() {
			--frameCountBeforeVideoExports;
			if (!frameCountBeforeVideoExports) {
				if (options.exportGIF) {
					logs.push('Exporting GIF video');
					const filters = 'fps=' + options.fps;
					spawnFFMPEG([
						'-start_number',
						'0',
						'-i',
						join(options.directory, options.prefix + '%0' + options.padding + 'd.png'),
						'-vframes',
						frameCount,
						'-vf',
						filters + ',palettegen',
						'-y',
						join(options.directory, options.prefix + '-palette.png'),
					], () => {
						spawnFFMPEG([
							'-start_number',
							'0',
							'-i',
							join(options.directory, options.prefix + '%0' + options.padding + 'd.png'),
							'-i',
							join(options.directory, options.prefix + '-palette.png'),
							'-lavfi',
							filters + ' [x]; [x][1:v] paletteuse',
							'-vframes',
							frameCount,
							'-y',
							join(options.directory, options.prefix + '.gif'),
						], doneExporting);
					});
				}

				if (options.exportMP4) {
					logs.push('Exporting MP4 video');
					spawnFFMPEG([
						'-r',
						options.fps,
						'-f',
						'image2',
						'-s',
						options.width + 'x' + options.height,
						'-start_number',
						'0',
						'-i',
						join(options.directory, options.prefix + '%0' + options.padding + 'd.png'),
						'-vframes',
						frameCount,
						'-vcodec',
						'libx264',
						'-crf',
						options.crf,
						'-pix_fmt',
						'yuv420p',
						join(options.directory, options.prefix + '.mp4'),
					], doneExporting);
				}
			}
		}

		function pad(n) {
			n = n + '';
			return n.length >= options.padding ? n : new Array(options.padding - n.length + 1).join('0') + n;
		}

		function saveFrame() {
			const filename = join(options.directory, options.prefix + pad(frameNumber) + '.png');
			gShaderToy.mCanvas.toBlob((blob) => {
				const reader = new FileReader();
				reader.onload = () => {
					const buffer = new Buffer(reader.result);
					return fs.writeFile(filename, buffer, (err) => {
						if (err) throw err;
						return countVideoExports();
					});
				};
				return reader.readAsArrayBuffer(blob);
			});
		}

		function render(originalRender) {
			if (frameNumber + 1 >= frameCount)
				stopped = true;

			originalRender();
			saveFrame();
			++frameNumber;

			if (stopped) {
				return stop();
			}
		}

		function RequestAnimationFrame(originalRender) {
			originalRequestAnimationFrame.call(gShaderToy.mEffect, stopped ? originalRender : render.bind(this, originalRender));
		}

		function getRealTime() {
			return (options.start + frameNumber * frameDuration) * 1000;
		}

		const originalWidth = gShaderToy.mCanvas.width;
		const originalHeight = gShaderToy.mCanvas.height;
		gShaderToy.resize(options.width, options.height);

		const originalGetRealTime = iframe.contentWindow.getRealTime;
		iframe.contentWindow.getRealTime = getRealTime;

		const originalRequestAnimationFrame = gShaderToy.mEffect.RequestAnimationFrame;
		gShaderToy.mEffect.RequestAnimationFrame = RequestAnimationFrame;

		const originalIsPaused = gShaderToy.mIsPaused;
		if (gShaderToy.mIsPaused) {
			gShaderToy.pauseTime();
		}

		gShaderToy.resetTime();
		gShaderToy.mTo = 0;

		++pendingProcesses;
		logs.push('Exporting PNG images');

		if (options.exportGIF)
			++pendingProcesses;
		if (options.exportMP4)
			++pendingProcesses;

		stopped = false;

		function stop() {
			gShaderToy.resize(originalWidth, originalHeight);

			iframe.contentWindow.getRealTime = originalGetRealTime;

			gShaderToy.mEffect.RequestAnimationFrame = originalRequestAnimationFrame;

			if (originalIsPaused) {
				gShaderToy.pauseTime();
			}

			$rootScope.$apply(() => {
				--pendingProcesses;
			});
		}
	}

	function isValidURL(url) {
		return typeof url === 'string' && url.lastIndexOf('https://www.shadertoy.com/view/', 0) === 0;
	}

	function setURL(url) {
		if (pendingProcesses) return;

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
			if (!loaded || pendingProcesses) return;

			logs.length = 0;

			++pendingProcesses;
			logs.push('Creating directory ' + options.directory);
			makeDir(options.directory)
				.then(() => {
					if (options.cleanDirectoryBeforehand) {
						logs.push('Cleaning directory ' + options.directory);
						return rimraf(join(options.directory, '*'));
					}
				})
				.then(() => {
					return $rootScope.$apply(() => {
						--pendingProcesses;
						return actualExport(options);
					});
				});
		},
		isExporting: () => {
			return pendingProcesses > 0;
		},
		stop: () => {
			stopped = true;
		},
		getLogs: () => {
			return logs;
		},
	};
}];
