'use strict';

const del = require('del');
const { build, Platform } = require('electron-builder');
const { bundleSFX } = require('jspm');
const path = require('path');
const copyFile = require('quickly-copy-file');

const { build: buildOptions } = require('../package.json');
buildOptions.directories.app = 'bundle';

const rootPath = path.resolve(__dirname, '..');

function copyFiles(files) {
	return Promise.all(files.map(pair => copyFile(pair[0], pair[1])));
}

console.log('Removing build directories');
del([
	path.join(rootPath, 'bundle'),
	path.join(rootPath, 'dist'),
])
	.then(() => {
		console.log('Copying files');
		return copyFiles([
			[
				path.join(rootPath, 'app', 'package.json'),
				path.join(rootPath, 'bundle', 'package.json'),
			],
			[
				path.join(rootPath, 'app', 'main.js'),
				path.join(rootPath, 'bundle', 'main.js'),
			],
			[
				path.join(rootPath, 'app', 'browser', 'index-bundle.html'),
				path.join(rootPath, 'bundle', 'browser', 'index.html'),
			],
		]);
	})
	.then(() => {
		console.log('Bundling JSPM app');
		return bundleSFX('app/main.js', path.join(rootPath, 'bundle', 'browser', 'app.js'), {
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
