import { extend } from 'angular';
import template from './template.html!text';

const { shell } = require('electron');
const { dialog } = require('electron').remote;
const Store = require('electron-store');
const { basename, dirname, extname, join } = require('path');

const store = new Store({
	name: 'directive.export',
});

export default [() => {
	return {
		controller: ['shadertoy', '$scope', (shadertoy, $scope) => {
			$scope.presets = [
				{
					name: '500 x 500 @ 30',
					width: 500,
					height: 500,
					fps: 30,
				},
				{
					name: '1280 x 720 @ 30',
					width: 1280,
					height: 720,
					fps: 30,
				},
				{
					name: '1920 x 1080 @ 60',
					width: 1920,
					height: 1080,
					fps: 60,
				},
			];

			$scope.width = store.get('width', $scope.presets[0].width);
			$scope.height = store.get('height', $scope.presets[0].height);
			$scope.fps = store.get('fps', $scope.presets[0].fps);
			$scope.start = store.get('start', 0);
			$scope.duration = store.get('duration', 1);

			$scope.directory = store.get('directory', null);
			$scope.prefix = store.get('prefix', null);
			$scope.cleanDirectoryBeforehand = store.get('cleanDirectoryBeforehand', false);
			$scope.openDirectoryAfterwards = store.get('openDirectoryAfterwards', false);

			$scope.ffmpegCommand = store.get('ffmpegCommand', 'ffmpeg');

			$scope.pngPadding = store.get('pngPadding', 3);
			$scope.pngRemoveAfterwards = store.get('pngRemoveAfterwards', false);

			$scope.exportGIF = store.get('exportGIF', false);

			$scope.exportMP4 = store.get('exportMP4', false);
			$scope.mp4CRF = store.get('mp4CRF', 20);
			$scope.mp4AudioPath = store.get('mp4AudioPath', null);

			$scope.changePreset = () => {
				if ($scope.preset)
					extend($scope, $scope.preset);
				$scope.preset = null;
			};

			$scope.selectDirectoryAndPrefix = () => {
				dialog.showSaveDialog({
					buttonLabel: 'Select',
					defaultPath: $scope.directory && $scope.prefix && join($scope.directory, $scope.prefix),
					filters: [
						{ name: 'Image', extensions: ['png'] },
					],
				}, (path) => {
					if (path)
						return $scope.$apply(() => {
							$scope.directory = dirname(path);
							$scope.prefix = basename(path, extname(path));
						});
				});
			};

			$scope.openDirectory = () => {
				shell.openItem($scope.directory);
			};

			$scope.selectFFMPEGCommand = () => {
				dialog.showOpenDialog({
					buttonLabel: 'Select',
					defaultPath: $scope.ffmpegCommand,
					properties: [ 'openFile'],
				}, (paths) => {
					if (paths && paths.length)
						return $scope.$apply(() => {
							$scope.ffmpegCommand = paths[0];
						});
				});
			};

			$scope.mp4SelectAudio = () => {
				dialog.showOpenDialog({
					buttonLabel: 'Select',
					defaultPath: $scope.mp4AudioPath,
					properties: [ 'openFile'],
				}, (paths) => {
					if (paths && paths.length)
						return $scope.$apply(() => {
							$scope.mp4AudioPath = paths[0];
						});
				});
			};

			$scope.mp4OpenAudio = () => {
				if ($scope.mp4AudioPath) {
					shell.openItem($scope.mp4AudioPath);
				}
			};

			$scope.mp4RemoveAudio = () => {
				$scope.mp4AudioPath = null;
			};

			$scope.export = () => {
				if ($scope.width > 0
					&& $scope.height > 0
					&& $scope.fps > 0
					&& $scope.duration > 0
					&& $scope.directory
					&& $scope.prefix
					&& (!$scope.exportMP4 || $scope.mp4CRF > 0)) {
					const options = {
						width: $scope.width,
						height: $scope.height,
						fps: $scope.fps,
						start: $scope.start,
						duration: $scope.duration,

						directory: $scope.directory,
						prefix: $scope.prefix,
						cleanDirectoryBeforehand: $scope.cleanDirectoryBeforehand,
						openDirectoryAfterwards: $scope.openDirectoryAfterwards,

						ffmpegCommand: $scope.ffmpegCommand,

						pngPadding: $scope.pngPadding,
						pngRemoveAfterwards: $scope.pngRemoveAfterwards,

						exportGIF: $scope.exportGIF,

						exportMP4: $scope.exportMP4,
						mp4CRF: $scope.mp4CRF,
						mp4AudioPath: $scope.mp4AudioPath,
					};
					store.set(options);
					return shadertoy.export(options);
				}
			};
		}],
		restrict: 'C',
		template: template,
	};
}];
