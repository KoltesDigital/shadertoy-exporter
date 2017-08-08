import template from './template.html!text';

const { clipboard } = require('electron');

export default [() => {
	return {
		controller: ['shadertoy', '$scope', (shadertoy, $scope) => {
			$scope.submit = () => {
				shadertoy.goToURL($scope.url);
			};

			const text = clipboard.readText();
			if (shadertoy.isValidURL(text)) {
				$scope.url = text;
				$scope.submit();
			}
		}],
		restrict: 'C',
		template: template,
	};
}];
