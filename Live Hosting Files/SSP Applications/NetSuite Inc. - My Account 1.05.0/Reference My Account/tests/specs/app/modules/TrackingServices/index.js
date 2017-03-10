specs = [
	'tests/specs/app/modules/TrackingServices/module'
];

require.config({
	paths: {
		TrackingServices: 'js/src/app/modules/TrackingServices/TrackingServices'
	}
});

require(['underscore', 'jasmineTypeCheck']);