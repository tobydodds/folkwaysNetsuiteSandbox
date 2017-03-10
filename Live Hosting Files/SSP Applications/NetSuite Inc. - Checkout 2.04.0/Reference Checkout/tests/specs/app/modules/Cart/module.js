// Cart.js
// --------------------
// Testing Cart module.
define(['Cart', 'Application', 'ItemsKeyMapping', 'ItemDetails', 'SC.ENVIRONMENT', 'jasmineTypeCheck', 'jasmineAjax'], function (cart, a, itemsKeyMapping, itemDetails)
{
	'use strict';

	describe('Module: Cart', function ()
	{
		var is_started = false
		,	application
		//It is important to use the name of the application loaded by the file "Application" as that is the one that has all the extended method
		//e.x. resizeImage neede for the templates
		,	application_name = _.first(_.keys(SC._applications));

		jQuery.ajax({ url: '../../../../../templates/Templates.php', async: false}).
				done(function (data)
					{
						eval(data);
						SC.compileMacros(SC.templates.macros);
					});

		describe('General Cart', function ()
		{
			beforeEach(function ()
			{
				if (!is_started)
				{
					// Here is the appliaction we will be using for this tests
					application = SC.Application(application_name);
					// This is the configuration needed by the modules in order to run
					application.Configuration =  {
						modules: [ 'Cart' ]
					};
					// Starts the application
					jQuery(application.start(function ()
					{
						SC.templates.layout_tmpl = '<div id="content"><div id="mini-cart-container"></div><div class="mini-cart-summary"></div></div>';
						if (!jQuery('#main').length)
						{
							jQuery('body').append('<div id="main"></div>');
						}

						is_started = true;
					}));
					// Makes sure the application is started before
					waitsFor(function()
					{
						return is_started;
					});
				}
			});

			afterEach(function()
			{
				is_started = false;
				Backbone.history.navigate('', {trigger: false});
				Backbone.history.stop();
			});

			it('#1: application.getCart not to be undefined', function ()
			{
				expect(application.getCart).toBeDefined();
			});

			it('#2: application.getCart to be function', function ()
			{
				expect(application.getCart).toBeA(Function);
			});

			it('#3: application.getCart return Backbone.model', function ()
			{
				expect(application.getCart()).toBeA(Backbone.Model);
			});

			it('#4: internalid of model to be "cart"', function ()
			{
				expect(application.getCart().get('internalid')).toBe('cart');
			});

			it('#5: addresses of model not to be undefined', function ()
			{
				expect(application.getCart().get('addresses')).not.toBe(undefined);
			});

			it('#6: paymentmethods of model not to be undefined', function ()
			{
				expect(application.getCart().get('paymentmethods')).not.toBe(undefined);
			});

			it('#7: shipmethods of model not to be undefined', function ()
			{
				expect(application.getCart().get('shipmethods')).not.toBe(undefined);
			});

			it('#8: layout.updateMiniCart not to be undefined', function ()
			{
				var layout = application.getLayout();
				expect(layout.updateMiniCart).not.toBe(undefined);
			});

			it('#9: layout.updateMiniCart to be function', function ()
			{
				var layout = application.getLayout();
				expect(layout.updateMiniCart).toBeA(Function);
			});

			it('#10: layout.showMiniCart not to be undefined', function ()
			{
				var layout = application.getLayout();
				expect(layout.showMiniCart).not.toBe(undefined);
			});

			it('#11: layout.showMiniCart to be function', function ()
			{
				var layout = application.getLayout();
				expect(layout.showMiniCart).toBeA(Function);
			});

			it('#12: layout.showCartConfirmationModal not to be undefined', function ()
			{
				var layout = application.getLayout();
				expect(layout.showCartConfirmationModal).not.toBe(undefined);
			});

			it('#13: layout.showCartConfirmationModal to be function', function ()
			{
				var layout = application.getLayout();
				expect(layout.showCartConfirmationModal).toBeA(Function);
			});

			it('#14: layout.goToCart not to be undefined', function ()
			{
				var layout = application.getLayout();
				expect(layout.goToCart).not.toBe(undefined);
			});

			it('#15: layout.goToCart to be function', function ()
			{
				var layout = application.getLayout();
				expect(layout.goToCart).toBeA(Function);
			});

			it('#16: layout.goToCart() must navigate to the url "#cart"', function ()
			{
				var layout = application.getLayout();
				Backbone.history.start();
				layout.goToCart();
				expect(window.location.hash).toBe('#cart');
			});

			it('#17: application.loadCart must be a function', function ()
			{
				expect(application.loadCart).toBeA(Function);
			});

			it('#18: application.loadCart must return a promise', function ()
			{
				spyOn(application.getCart(), 'fetch').andCallFake(function ()
				{
					return jQuery.Deferred();
				});

				application.cartLoad = null;
				var cart = application.loadCart();
				expect(cart.done).toBeA(Function);
				expect(application.getCart().fetch).toHaveBeenCalled();
			});

			it('#19: loadCart should return a resolved promise if the page is Generator', function ()
			{
				spyOn(SC, 'isPageGenerator').andCallFake(function ()
				{
					return true;
				});

				var result = application.loadCart();
				expect(result.state()).toEqual('resolved');
			});
		});

		describe('Bootstrapped Cart', function ()
		{
			beforeEach(function ()
			{
				if (!is_started)
				{
					// Here is the appliaction we will be using for this tests
					application = SC.Application(application_name);
					// This is the configuration needed by the modules in order to run
					application.Configuration =  {

						modules: [ 'Cart' ]
					};
					// Starts the application
					jQuery(application.start(function ()
					{
						SC.templates.layout_tmpl = '<div id="content"><div id="mini-cart-container"></div><div class="mini-cart-summary"></div></div>';
						if (!jQuery('#main').length)
						{
							jQuery('body').append('<div id="main"></div>');
						}

						//This code here is emulating the Starter.js when bootstrapping the CART
						if (SC.ENVIRONMENT.CART)
						{
							application.getCart().set(SC.ENVIRONMENT.CART);
						}

						//Add the items key mapping into the the current application
						itemsKeyMapping.mapAllApplications();
						//It is important to mount the itemDetails modules, as it is the reponsible for attach the itemsKeyMappint into the ItemModel
						itemDetails.mountToApp(application);

						is_started = true;
					}));
					// Makes sure the application is started before
					waitsFor(function()
					{
						return is_started;
					});
				}
			});

			afterEach(function ()
			{
				jQuery('#main').empty();
				is_started = false;
				Backbone.history.navigate('', {trigger: false});
				Backbone.history.stop();
			});

			it('should application.getCart a live order with the bootstrapped data', function ()
			{
				var cart = application.getCart();
				expect(cart.bootstraped).toBe(true);
				expect(cart.isLoading).toBe(false);

				expect(cart.get('lines').length).toBe(SC.ENVIRONMENT.CART.lines.length);
				expect(cart.get('billaddress')).toBe(SC.ENVIRONMENT.CART.billaddress);
				expect(cart.get('shipaddress')).toBe(SC.ENVIRONMENT.CART.shipaddress);
				expect(cart.get('summary')).toEqual(SC.ENVIRONMENT.CART.summary);
			});

			it('should render the require data into UI if the site is ADVANCE when calling updateMiniCart', function ()
			{
				var view_rendered = false
				,	layout = application.getLayout();

				layout.once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				spyOn(application, 'getConfig').andCallFake(function ()
				{
					return 'ADVANCED';
				});
				layout.appendToDom();
				layout.trigger('afterAppendView');
				layout.render();

				layout.updateMiniCart();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					expect(layout.$miniCart.find('.cart-summary-item-cell').length).toBe(SC.ENVIRONMENT.CART.lines.length);
					if (SC.ENVIRONMENT.CART.lines.length)
					{
						expect(layout.$miniCart.find('.cart-summary-item-cell').first().data('item')).toBe(SC.ENVIRONMENT.CART.lines[0].item.internalid);
					}
				});
			});
		});

		describe('Loading Cart', function ()
		{
			var bootstrap_original_value = SC.ENVIRONMENT.CART_BOOTSTRAPED;

			beforeEach(function ()
			{
				if (!is_started)
				{
					SC.ENVIRONMENT.CART_BOOTSTRAPED = false;
					// Here is the appliaction we will be using for this tests
					application = SC.Application(application_name);
					// As the other 'describes' load the application, the cart is already defined and already loaded.
					delete application.cartInstance;
					delete application.cartLoad;

					jasmine.Ajax.install();
					jQuery.ajaxSetup({cache: true}); //Prevent underscore parameter in request url

					// This is the configuration needed by the modules in order to run
					application.Configuration =  {
						modules: []
					};
					// Starts the application
					jQuery(application.start(function ()
					{
						SC.templates.layout_tmpl = '<div id="content"><div id="mini-cart-container"></div><div class="mini-cart-summary"></div></div>';
						if (!jQuery('#main').length)
						{
							jQuery('body').append('<div id="main"></div>');
						}

						cart.mountToApp(application);

						//Add the items key mapping into the the current application
						itemsKeyMapping.mapAllApplications();
						//It is important to mount the itemDetails modules, as it is the reponsible for attach the itemsKeyMappint into the ItemModel
						itemDetails.mountToApp(application);

						is_started = true;
					}));
					// Makes sure the application is started before
					waitsFor(function()
					{
						return is_started;
					});
				}
			});

			afterEach(function ()
			{
				SC.ENVIRONMENT.CART_BOOTSTRAPED = bootstrap_original_value;
				jQuery('#main').empty();
				is_started = false;
				jasmine.Ajax.uninstall();
				Backbone.history.navigate('', {trigger: false});
				Backbone.history.stop();
			});

			it('should auto-start loading the cart', function ()
			{
				var firstXhr  = jasmine.Ajax.requests.at(0);
				expect(firstXhr).toBeDefined();
				expect(firstXhr.url.indexOf('/services/live-order.ss') > 0).toBe(true);

				var cart = application.getCart();

				expect(cart.isLoading).toBe(true);
				expect(cart.bootstraped).toBe(false);
			});

			it('should update the miniCart and set cart isLoading to false after fetching the cart', function ()
			{
				var firstXhr  = jasmine.Ajax.requests.at(0)
				,	cart = application.getCart()
				,	layout = application.getLayout();

				spyOn(layout, 'updateMiniCart');

				expect(cart.isLoading).toBe(true);

				firstXhr.response({
					status: 200
				,	responseText: JSON.stringify(SC.ENVIRONMENT.CART)
				});

				expect(cart.isLoading).toBe(false);
				expect(layout.updateMiniCart).toHaveBeenCalled();
			});
		});

	});
});