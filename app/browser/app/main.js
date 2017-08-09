import './style.css!';
import 'bootstrap/css/bootstrap.css!';
import angular from 'angular';

import ShadertoyService from './shadertoy/service';

import ExportDirective from './export/directive';
import ExportingDirective from './exporting/directive';
import GoToURLDirective from './go-to-url/directive';
import PanelDirective from './panel/directive';
import ShadertoyDirective from './shadertoy/directive';

angular
	.module('app', [])
	.factory('shadertoy', ShadertoyService)
	.directive('export', ExportDirective)
	.directive('exporting', ExportingDirective)
	.directive('goToUrl', GoToURLDirective)
	.directive('panel', PanelDirective)
	.directive('shadertoy', ShadertoyDirective)
;
