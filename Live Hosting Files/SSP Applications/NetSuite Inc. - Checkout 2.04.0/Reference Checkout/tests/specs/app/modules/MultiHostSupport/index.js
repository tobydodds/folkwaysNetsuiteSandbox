SC = {
	SESSION: {}
,	ENVIRONMENT: {
		PROFILE: {}
	}
,	getSessionInfo: function(key)
	{
		'use strict';
		var session = SC.SESSION || SC.DEFAULT_SESSION || {};
		return (key) ? session[key] : session;
	}
};

specs = [
	'tests/specs/app/modules/MultiHostSupport/module'
];