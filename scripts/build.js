'use strict';

const { build, Platform } = require('electron-builder');
const { writeFile } = require('fs');
const { bundleSFX } = require('jspm');
const { join, resolve } = require('path');
const copyFile = require('quickly-copy-file');
const rimraf = require('rimraf-promise');

const packageJson = require('../package.json');
const buildOptions = packageJson.build;
buildOptions.directories.app = 'bundle';

delete packageJson.build;
delete packageJson.devDependencies;
delete packageJson.jspm;
delete packageJson.scripts;
packageJson.main = 'main.js';

const rootPath = resolve(__dirname, '..');

function copyFiles(files) {
	return Promise.all(files.map(pair => copyFile(pair[0], pair[1])));
}

console.log('Cleaning build directories');
return Promise.all([
	rimraf(join(rootPath, 'bundle', '*')),
	rimraf(join(rootPath, 'dist', '*')),
])
.then(() => {
	console.log('Copying files to bundle');
	return copyFiles([
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
	console.log('Generating bundle/package.json');
	return new Promise((resolve, reject) => {
		return writeFile(join(rootPath, 'bundle', 'package.json'), JSON.stringify(packageJson), (err) => {
			if (err)
				return reject(err);
			else
				return resolve();
		});
	});
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
		config: buildOptions,
		targets: Platform.current().createTarget(),
		publish: "never",
	});
});
