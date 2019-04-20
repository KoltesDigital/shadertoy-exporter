const fs = require('fs');
const { join } = require('path');
const rimraf = require('rimraf-promise');

let stopped;

function pad(n, padding) {
	n = n + '';
	return n.length >= padding ? n : new Array(padding - n.length + 1).join('0') + n;
}

function getFilename(options, frameNumber) {
	return join(options.directory, options.prefix + pad(frameNumber, options.pngPadding) + '.png');
}

export function exportPNGs(options, iframe) {
	const gShaderToy = iframe.contentWindow.gShaderToy;

	const originalWidth = gShaderToy.mCanvas.width;
	const originalHeight = gShaderToy.mCanvas.height;

	const originalGetRealTime = iframe.contentWindow.getRealTime;

	const originalRequestAnimationFrame = gShaderToy.mEffect.RequestAnimationFrame;

	const originalIsPaused = gShaderToy.mIsPaused;

	let frameNumber = 0;
	const frameCount = options.duration * options.fps;
	let frameCountBeforeResolve = frameCount;

	let complete = false;
	stopped = false;

	let exportErr = null;

	return new Promise((resolve, reject) => {
		function saveFrame() {
			const filename = getFilename(options, frameNumber);
			return gShaderToy.mCanvas.toBlob((blob) => {
				const reader = new FileReader();
				reader.onload = () => {
					const buffer = new Buffer(reader.result);
					return fs.writeFile(filename, buffer, (err) => {
						if (err)
							return reject(err);

						--frameCountBeforeResolve;
						if (!frameCountBeforeResolve)
							return resolve();
					});
				};
				return reader.readAsArrayBuffer(blob);
			});
		}

		function render(originalRender) {
			if (stopped || frameNumber + 1 >= frameCount)
				complete = true;

			originalRender();

			if (stopped)
				return reject(new Error('Frame export was stopped.'));

			saveFrame();
			++frameNumber;
		}

		function RequestAnimationFrame(originalRender) {
			originalRequestAnimationFrame.call(gShaderToy.mEffect, complete ? originalRender : render.bind(this, originalRender));
		}

		function getRealTime() {
			return (options.start + frameNumber / options.fps) * 1000;
		}

		gShaderToy.resize(options.width, options.height);

		iframe.contentWindow.getRealTime = getRealTime;

		gShaderToy.mEffect.RequestAnimationFrame = RequestAnimationFrame;

		if (gShaderToy.mIsPaused) {
			gShaderToy.pauseTime();
		}

		gShaderToy.resetTime();
		gShaderToy.mTo = 0;
	})
		.catch((err) => {
			exportErr = err;
		})
		.then(() => {
			return new Promise((resolve, reject) => {
				gShaderToy.resize(originalWidth, originalHeight);

				iframe.contentWindow.getRealTime = originalGetRealTime;

				gShaderToy.mEffect.RequestAnimationFrame = originalRequestAnimationFrame;

				if (originalIsPaused) {
					gShaderToy.pauseTime();
				}

				if (exportErr)
					return reject(exportErr);
				else
					return resolve();
			});
		});
}

export function removePNGs(options) {
	const frameCount = options.duration * options.fps;
	const promises = [];
	for (let frameNumber = 0; frameNumber < frameCount; ++frameNumber) {
		promises.push(rimraf(getFilename(options, frameNumber)));
	}
	return Promise.all(promises);
}

export function stop() {
	stopped = true;
}
