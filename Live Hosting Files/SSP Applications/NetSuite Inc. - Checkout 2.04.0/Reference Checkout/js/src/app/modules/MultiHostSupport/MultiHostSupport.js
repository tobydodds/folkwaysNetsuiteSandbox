// MultiHostSupport.js
// -------------------
// Handles the change event of the currency selector combo
define('MultiHostSupport', function ()
{
	'use strict';

	return {
		// redirects to a specific location
		// note: needed for unit tests
		setHref: function (url)
		{
			window.location.href = location.protocol + '//' + url;
		}
	,	setSearch: function (search)
		{
			window.location.search = search;
		}
	,	getCurrentPath: function ()
		{
			return location.pathname;
		}
	,	mountToApp: function (application)
		{
			// Adds the event listener
			_.extend(application.getLayout().events, {'change select[data-toggle="host-selector"]' : 'setHost'});
			_.extend(application.getLayout().events, {'change select[data-toggle="language-selector"]' : 'setLang'});

			var self = this;
			// Adds the handler function
			_.extend(application.getLayout(),
			{
				setHost: function (e)
				{
					var host = jQuery(e.target).val()
					,	url;

					if (Backbone.history._hasPushState)
					{
						// Seo Engine is on, send him to the root
						url = host;
					}
					else
					{
						// send it to the current path, it's probably a test site
						url = host + self.getCurrentPath();
					}

					// add session parameters to target host
					url = SC.Utils.addParamsToUrl(url, SC.Utils.getSessionParams(application.getConfig('siteSettings.touchpoints.login')));

					// redirects to url
					self.setHref(url);
				}
			,	setLang: function (e)
				{
					var selected_host = jQuery(e.target).val()
					,	available_hosts = SC.ENVIRONMENT.availableHosts
					,	selected_language;

					for(var i = 0; i < available_hosts.length; i++)
					{
						var host = available_hosts[i]
						,	lang = _(host.languages).findWhere({host: selected_host});

						if (lang && lang.locale)
						{
							selected_language = lang;
							break;
						}
					}

					// use the param **"lang"** to pass this to the ssp environment
					if (selected_language && selected_language.locale)
					{
						var current_search = SC.Utils.parseUrlOptions(window.location.search);

						current_search.lang = selected_language.locale;

						var search =  _.reduce(current_search, function (memo, val, name)
						{
							return val ? memo + name + '=' + val + '&' : memo;
						}, '?');

						self.setSearch(search);

						return search;
					}
				}
			});
		}
	};
});
