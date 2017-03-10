// Session.js
// -------------
// 
define('Session', function ()
{
	'use strict';

	return {

		get: function(path, default_value)
		{
			return _.getPathFromObject(SC.getSessionInfo(), path, default_value);
		}

	,	set: function(path, value)
		{
			SC.getSessionInfo()[path] = value;
		}

	,	getSearchApiParams: function()
		{
			var search_api_params = {};

			// Locale
			var locale = this.get('language.locale', '');
			if (~locale.indexOf('_'))
			{
				var locale_tokens = locale.split('_');
				search_api_params.language = locale_tokens[0];
				search_api_params.country = locale_tokens[1];
			}
			else
			{
				search_api_params.language = locale;
			}

			// Currency
			search_api_params.currency = this.get('currency.code', '');

			// Price Level
			search_api_params.pricelevel = this.get('priceLevel', '');

			// No cache
			if (_.parseUrlOptions(location.search).nocache === 'T')
			{
				search_api_params.nocache = 'T';
			}

			return search_api_params;
		}

	};

});
