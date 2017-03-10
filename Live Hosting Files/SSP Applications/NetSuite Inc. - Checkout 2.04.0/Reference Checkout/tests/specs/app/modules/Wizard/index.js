SC = {
	ENVIRONMENT : {
		PROFILE : {
			isLoggedIn : 'T'
		}
	}
};

specs = [
	'tests/specs/app/modules/Wizard/router'
];

//var libs = ['underscore', 'jQuery', 'Backbone']; 

require.config({
	paths: {
		'Wizard.Router': 'js/src/app/modules/Wizard/Wizard.Router'
	,	'Wizard.Step': 'js/src/app/modules/Wizard/Wizard.Step'
	,	'Wizard.StepGroup': 'js/src/app/modules/Wizard/Wizard.StepGroup'
	,	'Wizard.View': 'js/src/app/modules/Wizard/Wizard.View'
	,	'Utils': 'js/src/core/Utils'
	,	'Application': 'js/src/app/Application'
	,	'ApplicationSkeleton': 'js/src/core/ApplicationSkeleton'
	,	'Main': 'js/src/core/Main'
	,	'StringFormat': 'js/src/core/extras/String.format'
	,	'ExtrasBackboneView': 'js/src/core/extras/Backbone.View'
	//,	'Backbone': 'js/src/core/extras/Backbone.View'
	//,	'ExtrasApplicationSkeleton.Layout.showContent': 'js/src/core/extras/ApplicationSkeleton.Layout.showContent'

	}
,	shim: {
		Utils: {
			deps: ['underscore', 'StringFormat']
		}
	//,	'ExtrasApplicationSkeleton.Layout.showContent': {deps: ['ApplicationSkeleton']}
	,	'ExtrasBackboneView': {
			deps: ['Backbone']
		}
	,	'Application': {
			//deps: ['Application', 'ApplicationSkeleton', 'Main'].concat(libs)
			deps: ['ApplicationSkeleton', 'Main', 'Backbone', 'ExtrasBackboneView']
		}
	,	'ApplicationSkeleton': {
			//deps: ['Application', 'ApplicationSkeleton', 'Main'].concat(libs)
			deps: ['Backbone']
		}
	,	'Main': {
			//deps: ['Application', 'ApplicationSkeleton', 'Main'].concat(libs)
			deps: ['Backbone']
		}
	,	'Wizard.View': {
			deps: ['Backbone', 'Utils']
		}
	,	'Wizard.Step': {
			deps: ['Backbone', 'Utils']
		}
	}
});