import template from './template.html!text';

const { clipboard } = require('electron');

export default [() => {
	return {
		controller: ['shadertoy', '$scope', (shadertoy, $scope) => {
			$scope.shadertoy = shadertoy;

			const text = clipboard.readText();
			if (shadertoy.isValidURL(text)) {
				$scope.url = text;
				shadertoy.goToURL(text);
			}
		}],
		restrict: 'C',
		template: template,
	};
}];
