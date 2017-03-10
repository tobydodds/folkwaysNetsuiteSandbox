// ApplicationSkeleton.Tracking.js
// -----------------------------------------
// Extends the application's prototype to allow multiple tracking methods.
// Also warps the Layout's showContent to track the page view each time a view is rendered.
(function ()
{
	'use strict';

	var application_prototype = SC.ApplicationSkeleton.prototype
	,	layout_prototype = application_prototype.Layout.prototype;

	_.extend(application_prototype, {
		// Application.trackers
		// Place holder for tracking modules.
		// When creating your own tracker module, be sure to push it to this array.
		trackers: []
		// Tracking
	,	track: function (method)
		{
			var self = this
				// Each method could be called with different type of parameters.
				// So we pass them all what ever they are.
			,	parameters = Array.prototype.slice.call(arguments, 1);

			_.each(this.trackers, function (tracker)
			{
				// Only call the method if it exists, the context is the application.
				tracker[method] && tracker[method].apply(self, parameters);
			});

			return this;
		}

	,	trackPageview: function (url)
		{
			return this.track('trackPageview', url);
		}

	,	trackEvent: function (event)
		{
			var GoogleUniversalAnalytics = null
			,	has_universal_analytics = false;

			this.track('trackEvent', event);

			if (event.callback)
			{
				GoogleUniversalAnalytics = require('GoogleUniversalAnalytics');
				
				has_universal_analytics = _.find(this.trackers, function (tracker)
				{
					return tracker === GoogleUniversalAnalytics;
				});
				// TODO: to be improved.
				// GoogleUniversalAnalytics has an asynchronous callback.
				// So we anly call the non async ones if UniversalAnalytics is not there.
				!has_universal_analytics && event.callback();
			}

			return this;
		}

	,	trackTransaction: function (transaction)
		{
			return this.track('trackTransaction', transaction);
		}

		// Application.addCrossDomainParameters:
		// Some tracking services require to pass special parameters when navigating to a different domain.
		// This method will be call for each of the services whenever that happens.
	,	addCrossDomainParameters: function (url)
		{
			_.each(this.trackers, function (tracker)
			{
				if (tracker.addCrossDomainParameters)
				{
					url = tracker.addCrossDomainParameters(url);
				}
			});

			return url;
		}
	});

	_.extend(layout_prototype, {

		showContent: _.wrap(layout_prototype.showContent, function (fn, view)
		{
			var application = view.application || view.options.application
				// Prefix is added so the only application that tracks the root ('/') is Shopping
				// any other application that has '/' as the home, like MyAccount
				// will track '/APPLICATION-NAME'
			,	prefix = application.name !== 'Shopping' ? '/' + application.name.toLowerCase() : '';

			application.trackPageview(prefix + '/' + Backbone.history.fragment);

			return fn.apply(this, _.toArray(arguments).slice(1));
		})
	});
})();