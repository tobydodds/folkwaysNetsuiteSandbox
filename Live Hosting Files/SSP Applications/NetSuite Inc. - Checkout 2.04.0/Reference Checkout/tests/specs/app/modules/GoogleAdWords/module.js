define(['GoogleAdWords'], function (GoogleAdWords)
{
	'use strict';

	return describe('GoogleAdWords Module', function ()
	{
		describe('setAccount', function ()
		{
			var valid_settings = {
					id: 123
				,	label: 'abc'
				,	value: 1
				};

			it('sets the adwords configuration', function ()
			{
				var config = null;

				GoogleAdWords.setAccount(valid_settings);

				config = GoogleAdWords.config;

				expect(config.id).toBe(123);
				expect(config.label).toBe('abc');
				expect(config.value).toBe(1);
			});

			it('and returns the GoogleAdWords module', function ()
			{
				expect(GoogleAdWords.setAccount(valid_settings)).toEqual(GoogleAdWords);
			});
		});

		describe('mountToApp', function ()
		{
			var application = null;

			beforeEach(function ()
			{
				application = SC.Application('Test');

				_.extend(application,
				{
					Configuration: {
						tracking: {
							googleAdWordsConversion: {
								id: 123
							,	label: 'abc'
							,	value: 1
							}
						}
					}
				,	trackers: []
				});
			});

			it('sets the account', function ()
			{
				spyOn(GoogleAdWords, 'setAccount').andCallThrough();

				GoogleAdWords.mountToApp(application);

				expect(GoogleAdWords.setAccount).toHaveBeenCalledWith({
					id: 123
				,	label: 'abc'
				,	value: 1
				});
			});

			it('and pushes itself to the list of trackers', function ()
			{
				expect(application.trackers).not.toContain(GoogleAdWords);

				GoogleAdWords.mountToApp(application);

				expect(application.trackers).toContain(GoogleAdWords);
			});

			it('if its configured in the application', function ()
			{
				spyOn(GoogleAdWords, 'setAccount');

				delete application.Configuration.tracking.googleAdWordsConversion;

				GoogleAdWords.mountToApp(application);

				expect(GoogleAdWords.setAccount).not.toHaveBeenCalled();
				expect(application.trackers).not.toContain(GoogleAdWords);
			});
		});

		describe('trackTransaction', function ()
		{
			var application = null
			,	tracking_pixel = null
			,	$el = jQuery('<div/>');

			beforeEach(function ()
			{
				application = SC.Application('Test');

				application.getLayout().currentView = {
					$el: $el
				};
			});

			it('appends the tracking pixel to the dom', function ()
			{
				expect($el.children().length).toEqual(0);

				GoogleAdWords.trackTransaction.apply(application);

				tracking_pixel = $el.children()[0];

				expect(tracking_pixel.nodeName.toLowerCase()).toBe('img');
				expect(tracking_pixel.src).toBe('http://www.googleadservices.com/pagead/conversion/123/?value=1&amp;label=abc&amp;guid=ON&amp;script=0');
			});
		});
	});
});