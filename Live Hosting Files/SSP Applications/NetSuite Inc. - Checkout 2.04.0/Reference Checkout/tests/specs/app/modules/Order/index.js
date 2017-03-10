SC = {
	SESSION: {}
,	ENVIRONMENT: {}
,	getSessionInfo: function(key)
	{
		'use strict';
		var session = SC.SESSION || SC.DEFAULT_SESSION || {};
		return (key) ? session[key] : session;
	}
};

specs = [
	'tests/specs/app/modules/Order/lo.order'
];