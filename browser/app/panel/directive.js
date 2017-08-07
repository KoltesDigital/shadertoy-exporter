import template from './template.html!text';

export default [() => {
	return {
		controller: ['shadertoy', '$scope', (shadertoy, $scope) => {
			$scope.shadertoy = shadertoy;
		}],
		restrict: 'C',
		template: template,
	};
}];
