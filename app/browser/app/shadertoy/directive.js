export default ['shadertoy', (shadertoy) => {
	return {
		link: (scope, element) => {
			const iframe = document.createElement('iframe');
			iframe.scrolling = 'yes';

			element.append(iframe);

			shadertoy.setIframe(iframe);
		},
		restrict: 'C',
	};
}];
