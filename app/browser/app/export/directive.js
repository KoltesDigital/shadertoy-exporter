import {extend} from 'angular';
import template from './template.html!text';

const {dialog} = require('electron').remote;
const Store = require('electron-store');
const {dirname, basename, extname} = require('path');

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
			$scope.cleanDirectoryBeforehand = store.get('cleanDirectoryBeforehand', false);
			$scope.directory = store.get('directory', null);
			$scope.prefix = store.get('prefix', null);
			$scope.padding = store.get('padding', 3);
			$scope.exportGIF = store.get('exportGIF', false);
			$scope.exportMP4 = store.get('exportMP4', false);
			$scope.crf = store.get('crf', 20);

			$scope.changePreset = () => {
				if ($scope.preset)
					extend($scope, $scope.preset);
				$scope.preset = null;
			};

			$scope.selectDirectoryAndPrefix = () => {
				dialog.showSaveDialog({
					filters: [
						{ name: 'Image', extensions: ['png'] },
					],
				}, (filename) => {
					if (filename)
						return $scope.$apply(() => {
							$scope.directory = dirname(filename);
							$scope.prefix = basename(filename, extname(filename));
						});
				});
			};

			$scope.export = () => {
				if ($scope.width > 0
					&& $scope.height > 0
					&& $scope.fps > 0
					&& $scope.duration > 0
					&& $scope.directory
					&& $scope.prefix
					&& $scope.crf > 0) {
					const options = {
						width: $scope.width,
						height: $scope.height,
						fps: $scope.fps,
						start: $scope.start,
						duration: $scope.duration,
						cleanDirectoryBeforehand: $scope.cleanDirectoryBeforehand,
						directory: $scope.directory,
						prefix: $scope.prefix,
						padding: $scope.padding,
						exportGIF: $scope.exportGIF,
						exportMP4: $scope.exportMP4,
						crf: $scope.crf,
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
