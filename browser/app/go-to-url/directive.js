import template from './template.html!text';

export default [() => {
	return {
		controller: ['shadertoy', '$scope', (shadertoy, $scope) => {
			$scope.submit = () => {
				if ($scope.url)
					shadertoy.goToURL($scope.url);
			};
		}],
		restrict: 'C',
		template: template,
	};
}];
