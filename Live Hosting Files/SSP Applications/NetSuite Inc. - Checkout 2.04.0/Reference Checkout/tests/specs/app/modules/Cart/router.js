// Cart.js
// --------------------
// Testing Cart module.
define(['Cart', 'Application','SC.ENVIRONMENT', 'jasmineTypeCheck','Bootstrap'], function (CartObject)
{
	
	'use strict';
	
	describe('Module: Cart.Router startRouter: true', function () {
		
		var is_started = false
		,	application;

		SC.templates = {
				'layout_tmpl': '<div id="layout"><div id="content"></div></div>'
			,	'shopping_cart_tmpl': '<div id="cart"></div>'
		};


		beforeEach(function ()
		{
			if (!is_started)
			{
				// Here is the appliaction we will be using for this tests
				application = SC.Application('CartRouter');
				application.Configuration = {
					modules: [['Cart',{startRouter:true}]]
				};
				// Starts the application
				jQuery(application.start(function () { is_started = true; }));

				Backbone.history.start();

				//application.getLayout().appendToDom();
				
				// Makes sure the application is started before 
				waitsFor(function() { 
					application.cartLoad = jQuery({}).promise();
					return is_started;
				});
			}
		});
		
		afterEach(function()
		{
			delete SC._applications.CartRouter; 
			try
			{
				Backbone.history.navigate('', {trigger: false});
				Backbone.history.stop();
			} 
			catch(ex) 
			{ }
		});

		it('#1: when navigate to cart the currentView must be Cart View', function() {
			Backbone.history.navigate('#cart', {trigger: true}); 
			expect(application.getLayout().currentView instanceof CartObject.Views.Detailed).toBe(true);
		});

		

	});

	describe('Module: Cart.Router startRouter: false', function () {
		
		var is_started = false
		,	application;

				beforeEach(function ()
		{
			if (!is_started)
			{
				// Here is the appliaction we will be using for this tests
				application = SC.Application('CartRouter');
				application.Configuration = {
					modules: [['Cart',{startRouter: false}]]
				};
				// Starts the application
				jQuery(application.start(function () { is_started = true; }));

				Backbone.history.start();

				//application.getLayout().appendToDom();
				
				// Makes sure the application is started before 
				waitsFor(function() { return is_started; });
			}
		});
		
		afterEach(function()
		{
			delete SC._applications.CartRouter;
			try
			{
				Backbone.history.navigate('', {trigger: false});
				Backbone.history.stop();
			} 
			catch(ex) 
			{ }
		});

		it('#1: when navigate to cart the currentView must not be Cart View', function() {
			Backbone.history.navigate('#cart', {trigger: true});
			expect(application.getLayout().currentView instanceof CartObject.Views.Detailed).toBe(false);
		});

		

	});

});