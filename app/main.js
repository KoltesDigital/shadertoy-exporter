'use strict';

const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const { format } = require('url');

let win;

function createWindow () {
	win = new BrowserWindow({
		show: false,
	});

	win.loadURL(format({
		pathname: join(__dirname, 'browser', 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	win.once('ready-to-show', () => {
		win.maximize();
	});

	win.on('closed', () => {
		win = null;
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (win === null) {
		createWindow();
	}
});
