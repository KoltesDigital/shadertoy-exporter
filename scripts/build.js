'use strict';

const del = require('del');
const { build, Platform } = require('electron-builder');
const { bundleSFX } = require('jspm');
const { join } = require('path');
const copyFile = require('quickly-copy-file');

const { build: buildOptions } = require('../package.json');
buildOptions.directories.app = 'bundle';

const rootPath = path.resolve(__dirname, '..');

function copyFiles(files) {
	return Promise.all(files.map(pair => copyFile(pair[0], pair[1])));
}

console.log('Removing build directories');
del([
	join(rootPath, 'bundle'),
	join(rootPath, 'dist'),
])
	.then(() => {
		console.log('Copying files');
		return copyFiles([
			[
				join(rootPath, 'app', 'package.json'),
				join(rootPath, 'bundle', 'package.json'),
			],
			[
				join(rootPath, 'app', 'main.js'),
				join(rootPath, 'bundle', 'main.js'),
			],
			[
				join(rootPath, 'app', 'browser', 'index-bundle.html'),
				join(rootPath, 'bundle', 'browser', 'index.html'),
			],
		]);
	})
	.then(() => {
		console.log('Bundling JSPM app');
		return bundleSFX('app/main.js', join(rootPath, 'bundle', 'browser', 'app.js'), {
			minify: true,
		});
	})
	.then(() => {
		console.log('Building Electron app');
		return build({
			targets: Platform.current().createTarget(),
			config: buildOptions,
		});
	});
