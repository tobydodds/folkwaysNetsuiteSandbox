/*jshint laxcomma:true*/
SC = {
	SESSION: {}
,	ENVIRONMENT: {
		PROFILE: {}
	}
,	getSessionInfo: function(key)
	{
		var session = SC.SESSION || SC.DEFAULT_SESSION || {};
		return (key) ? session[key] : session;
	}
};

specs = [
	'tests/specs/app/modules/NavigationHelper/module'
];