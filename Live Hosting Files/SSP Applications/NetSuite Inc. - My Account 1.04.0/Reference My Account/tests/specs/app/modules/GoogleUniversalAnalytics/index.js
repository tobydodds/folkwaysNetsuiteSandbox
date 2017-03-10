/*jshint laxcomma:true*/
SC = {
	ENVIRONMENT: {
		PROFILE: {}
	}
,	SESSION: {
		currency: {
			code: "USD"
		}
	}
,	getSessionInfo: function(key)
	{
		var session = SC.SESSION || SC.DEFAULT_SESSION || {};
		return (key) ? session[key] : session;
	}
};

specs = [
	'tests/specs/app/modules/GoogleUniversalAnalytics/module'
];

require.config({
	paths: {
		GoogleUniversalAnalytics: 'js/src/app/modules/GoogleUniversalAnalytics/GoogleUniversalAnalytics'
	}
});

require(['underscore', 'jQuery', 'Main', 'ApplicationSkeleton']);