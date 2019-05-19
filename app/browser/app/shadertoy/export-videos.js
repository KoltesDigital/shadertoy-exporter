const { spawn } = require('child_process');
const { join } = require('path');
const rimraf = require('rimraf-promise');

const processes = [];

function spawnFFMPEG(options, args) {
	return new Promise((resolve, reject) => {
		args.push('-loglevel', 'error');
		const ffmpeg = spawn(options.ffmpegCommand, args);
		processes.push(ffmpeg);

		ffmpeg.stdout.on('data', (data) => {
			console.log(data.toString());
		});

		ffmpeg.stderr.on('data', (data) => {
			return reject(new Error(data.toString()));
		});

		ffmpeg.on('close', (code, signal) => {
			const index = processes.indexOf(ffmpeg);
			processes.splice(index, 1);

			if (code)
				return reject(new Error('ffmpeg exited with code ' + code + '.'));
			else if (signal)
				return reject(new Error('ffmpeg was stopped by signal ' + signal + '.'));
			else
				return resolve();
		});

		ffmpeg.on('error', (err) => {
			if (err.code === 'ENOENT') {
				return reject(new Error('FFMPEG command not found.'));
			}
			return reject(err);
		});
	});
}

export function exportGIF(options) {
	const filters = 'fps=' + options.fps;
	const frameCount = options.duration * options.fps;
	const inputFilename = join(options.directory, options.prefix + '%0' + options.pngPadding + 'd.png');
	const paletteFilename = join(options.directory, options.prefix + '-palette.png');
	return spawnFFMPEG(options, [
		'-y',
		'-start_number',
		'0',
		'-i',
		inputFilename,
		'-vframes',
		frameCount,
		'-vf',
		filters + ',palettegen',
		paletteFilename,
	])
		.then(() => {
			return spawnFFMPEG(options, [
				'-y',
				'-start_number',
				'0',
				'-i',
				inputFilename,
				'-i',
				paletteFilename,
				'-lavfi',
				filters + ' [x]; [x][1:v] paletteuse',
				'-vframes',
				frameCount,
				join(options.directory, options.prefix + '.gif'),
			]);
		})
		.then(() => {
			return rimraf(paletteFilename);
		});
}

export function exportMP4(options) {
	const frameCount = options.duration * options.fps;
	let args = [
		'-y',
		'-r',
		options.fps,
		'-f',
		'image2',
		'-s',
		options.width + 'x' + options.height,
		'-start_number',
		'0',
		'-i',
		join(options.directory, options.prefix + '%0' + options.pngPadding + 'd.png'),
	];
	if (options.mp4AudioPath) {
		args = args.concat([
			'-i',
			options.mp4AudioPath,
			'-map',
			'0:v:0',
			'-map',
			'1:a:0',
			'-c:a',
			'aac',
			'-strict',
			'experimental'
		]);
	}
	args = args.concat([
		'-vframes',
		frameCount,
		'-c:v',
		'libx264',
		'-crf',
		options.mp4CRF,
		'-pix_fmt',
		'yuv420p',
		'-shortest',
		join(options.directory, options.prefix + '.mp4'),
	]);
	return spawnFFMPEG(options, args);
}

export function stop() {
	processes.forEach(ffmpeg => ffmpeg.kill());
}
