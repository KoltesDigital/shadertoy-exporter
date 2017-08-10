'use strict';

const { app, BrowserWindow } = require('electron');
const windowStateKeeper = require('electron-window-state');
const { join } = require('path');
const { format } = require('url');

let win;

function createWindow() {
	const winState = windowStateKeeper();

	win = new BrowserWindow({
		x: winState.x,
		y: winState.y,
		width: winState.width,
		height: winState.height,
		show: false,
	});

	winState.manage(win);

	win.loadURL(format({
		pathname: join(__dirname, 'browser', 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	win.once('ready-to-show', () => {
		win.show();
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
