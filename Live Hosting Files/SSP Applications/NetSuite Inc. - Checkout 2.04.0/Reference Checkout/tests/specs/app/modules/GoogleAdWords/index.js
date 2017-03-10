SC = {
	ENVIRONMENT: {}
};

specs = [
	'tests/specs/app/modules/GoogleAdWords/module'
];

require.config({
	paths: {
		GoogleAdWords: 'js/src/app/modules/GoogleAdWords/GoogleAdWords'
	}
});

require(['underscore', 'jQuery', 'Main', 'ApplicationSkeleton']);