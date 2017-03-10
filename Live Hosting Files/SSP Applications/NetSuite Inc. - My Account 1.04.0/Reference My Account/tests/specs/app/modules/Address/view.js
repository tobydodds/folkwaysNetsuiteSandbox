/*global SC:false, it:false, describe:false, jasmine:false, jasmine:false, spyOn:false,  define:false, expect:false, beforeEach:false, jQuery:false */
/*jshint evil:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/
define(['Address','Application', 'Main', 'Utils'], function (AddressModule)
{
	'use strict';

	return describe('Address Views', function()
	{
		var AddressViews = AddressModule.Views;
		describe('list view', function()
		{
			var list_view
			,	showContentSpy = jasmine.createSpy('Mock Show Content function')
			,	application = {
					configurationString: ''
				,	getConfig: function ()
					{
						return this.configurationString;
					}
				,	getLayout: function () 
					{
						return {
							showContent:  showContentSpy
						};
					}
				};


			describe('initialization', function()
			{

				it ('should set the showDefaults in true if the configuration is customercenter', function()
				{
					
					application.configurationString = 'customercenter';
					list_view = new AddressViews.List({application: application});

					expect(list_view.options.showDefaults).toBe(true);
				});

				it ('should NOT set the showDefaults in true if the configuration isnt customercenter', function()
				{
					
					application.configurationString = '';
					list_view = new AddressViews.List({application: application});

					expect(list_view.options.showDefaults).toBe(false);
				});
			});

			describe('show content', function()
			{

				application.configurationString = 'customercenter';
				list_view = new AddressViews.List({application: application});

				it ('should call the show content of the current layout', function ()
				{
					list_view.showContent();
					expect(application.getLayout().showContent).toHaveBeenCalled();
				});
			});

			describe('remove', function()
			{
				var fake_destroy_model = jasmine.createSpy('fake destroy')
				,	fake_collection = {
						get: jasmine.createSpy('fake get method').andCallFake(function ()
						{
							return {
								destroy: fake_destroy_model
							};
						})
					}

				,	confirm_result = true;

				window.confirm = jasmine.createSpy('mock confirm').andCallFake(function()
				{
					return confirm_result;
				});

				beforeEach(function() {
					list_view = new AddressViews.List({
						application: application
					});
					list_view.collection = fake_collection;
				});

				it ('should call get in the collection and destroy on the model if the user confirm deletion', function ()
				{
					//Fafe obj event
					list_view.remove({
						preventDefault: function(){}
					});

					expect(fake_collection.get).toHaveBeenCalled();
					expect(fake_collection.get().destroy).toHaveBeenCalled();
				});
			});
		});

		describe('details view', function()
		{

			var application;

			// initial setup required for this test: we will be working with views.
			// some of these tests require that some macros are loaded, so we load them all:
			jQuery.ajax({url: '../../../../../templates/Templates.php', async: false}).done(function(data){
				eval(data); 
				SC.compileMacros(SC.templates.macros);
			}); 

			beforeEach(function ()
			{
				
				// Here is the appliaction we will be using for this tests
				application = SC.Application('MyAccount');
				SC.ENVIRONMENT.siteSettings = {
				};
			});

			describe('initialization', function()	
			{
				it ('should set title to "Add New Address" if the model is new', function()
				{
					var fake_model = {
						isNew: function() {
							return true;
						}
					};
					var details = new AddressViews.Details({model:fake_model});

					expect(details.title).toBe('Add New Address');
					expect(details.title).toBe(details.page_header);
				});

				it ('should set title to "Update Address" if the model is NOT new', function()
				{
					var fake_model = {
						isNew: function() {
							return false;
						}
					};
					var details = new AddressViews.Details({model:fake_model});

					expect(details.title).toBe('Update Address');
					expect(details.title).toBe(details.page_header);
				});
			});

			describe('showContent', function() 
			{
				it ('should call showContent of the curent layout', function()
				{
					var fake_model = new AddressModule.Model()
					,	fake_collection = new AddressModule.Collection();

					spyOn(application.getLayout(),'showContent');

					var details = new AddressViews.Details({
						model:fake_model
					,	collection: fake_collection
					,	application: application
					});

					details.collection;

				});
			});

		});

	});

});