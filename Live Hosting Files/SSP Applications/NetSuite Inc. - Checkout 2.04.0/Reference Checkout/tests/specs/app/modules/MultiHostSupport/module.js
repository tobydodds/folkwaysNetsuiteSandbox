// MultiHostSupport.js
// --------------------
// Testing Multi Host Support.
define(['MultiHostSupport', 'Application'], function ()
{
	'use strict';

	describe('setHost', function ()
	{
		var is_started = false
		,	application;

		beforeEach(function ()
		{
			// Here is the appliaction we will be using for this tests
			application = SC.Application('MultiHostSupport');

			// This is the configuration needed by the modules in order to run
			application.Configuration =  { modules: [ 'MultiHostSupport'] };

			// Starts the application
			jQuery(application.start(function () {
				application.getLayout().appendToDom();
				is_started = true;
			}));

			// Makes sure the application is started before
			waitsFor(function() {
				return is_started;
			});
		});

		it('#1 function should be defined on the application layout', function ()
		{
			// act
			var result = application.getLayout().setHost;

			// assert
			expect(result).toBeDefined();
			expect(result instanceof Function).toBeTruthy();
		});

		it('#2 layout should have the host change event defined', function ()
		{
			// act
			var layout_events = application.getLayout().events;

			// assert
			expect(layout_events['change select[data-toggle="host-selector"]']).toBeDefined();
			expect(layout_events['change select[data-toggle="host-selector"]']).toEqual('setHost');
		});

		it('#3 if SEO is enabled, window location should result the root', function ()
		{
			// arrange
			Backbone.history._hasPushState = true;
			var element = { target: '<option value="foo.bar">'};

			spyOn(application.modules.MultiHostSupport, 'setHref');

			// act
			application.getLayout().setHost(element);
			var expected = 'foo.bar';

			// assert
			expect(application.modules.MultiHostSupport.setHref).toHaveBeenCalledWith(expected);

		});
		
		it('#4 if SEO is not enabled, window location should result the root plus the rest of the path', function ()
		{
			// arrange
			Backbone.history._hasPushState = false;
			var element = { target: '<option value="foo.bar">'};

			spyOn(application.modules.MultiHostSupport, 'setHref');
			spyOn(application.modules.MultiHostSupport, 'getCurrentPath').andCallFake(function ()
			{
				return '/another/path';
			});

			// act
			application.getLayout().setHost(element);
			var	expected = 'foo.bar/another/path';

			// assert
			expect(application.modules.MultiHostSupport.setHref).toHaveBeenCalledWith(expected);
		});
	});

	describe('setLang', function ()
	{
		var is_started = false
		,	application;

		beforeEach(function ()
		{
			// Here is the appliaction we will be using for this tests
			application = SC.Application('MultiHostSupport');

			// This is the configuration needed by the modules in order to run
			application.Configuration =  { modules: [ 'MultiHostSupport'] };

			// Starts the application
			jQuery(application.start(function () {
				application.getLayout().appendToDom();
				is_started = true;
			}));

			// Makes sure the application is started before
			waitsFor(function() {
				return is_started;
			});
		});

		it('#1 function should be defined on the application layout', function ()
		{
			// act
			var result = application.getLayout().setLang;

			// assert
			expect(result).toBeDefined();
			expect(result instanceof Function).toBeTruthy();
		});
		
		it('#2 layout should have the language change event defined', function ()
		{
			// act
			var layout_events = application.getLayout().events;

			// assert
			expect(layout_events['change select[data-toggle="language-selector"]']).toBeDefined();
			expect(layout_events['change select[data-toggle="language-selector"]']).toEqual('setLang');
		});

		it('#3 event handler should not add the lang param if there are no hosts', function ()
		{
			// arrange
			var element = { target: '<option value="foo.bar">'};
			SC.ENVIRONMENT = SC.ENVIRONMENT || {};
			SC.ENVIRONMENT.availableHosts = [];

			spyOn(application.modules.MultiHostSupport, 'setSearch');

			// act
			application.getLayout().setLang(element);

			// assert 
			expect(application.modules.MultiHostSupport.setSearch).not.toHaveBeenCalled();
		});

		it('#4 event handler should not add the lang param if no language was found within the hosts', function ()
		{
			// arrange
			var element1 = { target: '<option value="foo.bar">'}
			,	element2 = { target: '<option value="foo2.bar">'};
			SC.ENVIRONMENT = SC.ENVIRONMENT || {};
			SC.ENVIRONMENT.availableHosts =  [
				{
					languages: [
						{
							host: 'foo.bar'
						}
					]
				}
			];

			spyOn(application.modules.MultiHostSupport, 'setSearch');

			// act
			application.getLayout().setLang(element1);
			application.getLayout().setLang(element2);

			// assert
			expect(application.modules.MultiHostSupport.setSearch).not.toHaveBeenCalled();


		});

		it('#5 event handler should redirect correctly', function ()
		{
			// arrange
			var element = { target: '<option value="foo.bar">'};
			SC.ENVIRONMENT = SC.ENVIRONMENT || {};
			SC.ENVIRONMENT.availableHosts =  [
				{
					languages: [
						{
							host: 'foo.bar'
						,	locale: 'el_locale'
						}
					]
				}
			];

			spyOn(application.modules.MultiHostSupport, 'setSearch');

			// act
			application.getLayout().setLang(element);

			// assert
			expect(application.modules.MultiHostSupport.setSearch).toHaveBeenCalledWith(window.location.search.indexOf('?') >= 0 ?  window.location.search + '&lang=el_locale&' : '?lang=el_locale&');
		});

	});
});