define(['OrderWizard.Router', 'ItemDetails', './sampleCart', 'ItemsKeyMapping', 'jasmineAjax', 'Application'],
	function (OrderWizardRouter, ItemDetails, sampleCart, itemsKeyMapping)
{
	'use strict';

	return (function ()
	{
		var helper = function (stepsParam, cartToUse, options)
		{
			this.options = options || {};
			this.is_started = false;
			this.application = SC.Application('Checkout');
			this.wizardOptions;
			this.local_cart = sampleCart[cartToUse];
			this.sample_cart = sampleCart;
			this.testSteps = stepsParam;

			//Mock require configuration
			this.application.Configuration = {
				modules: [
					'ItemsKeyMapping'
				,	'ItemDetails'
				,	'Profile'
				,	'Cart'
				,	'ErrorManagement'
				]
			,	siteSettings: {
					isMultiShippingRoutesEnabled: false
				}
				//Require to propertly render cart summary
			,	imageSizeMapping: {
					thumbnail: 'thumbnail' // 175 * 175
				,	main: 'main' // 600 * 600
				,	tinythumb: 'tinythumb' // 50 * 50
				,	zoom: 'zoom'// 1200 * 1200
				,	fullscreen: 'fullscreen'// 1600 * 1600
				}

			,	macros: {
					itemOptions: {
						// each apply to specific item option types
						selectorByType:
						{
							select: 'itemDetailsOptionTile'
						,	'default': 'itemDetailsOptionText'
						}
						// for rendering selected options in the shopping cart
					,	selectedByType: {
							'default': 'shoppingCartOptionDefault'
						}
					}
					// default merchandising zone template
				,	merchandisingZone: 'merchandisingZone'
				}
			};
		};

		helper.prototype.initialize = function ()
		{
			itemsKeyMapping.mapAllApplications();
			ItemDetails.mountToApp(this.application); //This is done to propertly render the cart summary

			//Download and compile all templates and macros
			jQuery.ajax({ url: '../../../../../templates/Templates.php', async: false}).
				done(function (data)
					{
						eval(data);
						SC.compileMacros(SC.templates.macros);
					});
		};

		helper.prototype.beforeEach = function ()
		{
			var self = this;
			this.is_started = false;
			Backbone.history.start();

			//Configure basic HTML structure
			SC.templates.layout_tmpl = '<div id="content"></div>';
			if (!jQuery('#main').length)
			{
				jQuery('body').append('<div id="main"></div>');
			}

			//Mock Ajax Calls
			jasmine.Ajax.install();
			jQuery.ajaxSetup({cache: true}); //Prevent underscore parameter in request url

			// Starts the application
			jQuery(self.application.start(function ()
			{

				//Emulate fake Live Order (Cart)
				if (self.local_cart)
				{
					self.application.getCart().set(self.local_cart);
					self.local_cart = null;
				}

				if (SC.ENVIRONMENT.PROFILE)
				{
					self.application.getUser().set(SC.ENVIRONMENT.PROFILE);
					// delete SC.ENVIRONMENT.PROFILE;
				}

				if (SC.ENVIRONMENT.ADDRESS)
				{
					self.application.getUser().get('addresses').reset(SC.ENVIRONMENT.ADDRESS);
					// delete SC.ENVIRONMENT.ADDRESS;
				}

				if (SC.ENVIRONMENT.CREDITCARD)
				{
					self.application.getUser().get('creditcards').reset(SC.ENVIRONMENT.CREDITCARD);
					// delete SC.ENVIRONMENT.CREDITCARD;
				}

				self.wizardOptions = {
					steps: self.testSteps
				,	model: self.application.getCart()
				,	profile: self.application.getUser()
				};

				if (!self.preserveConfirmation)
				{
					self.wizardOptions.model.set('confirmation', null);
				}

				self.application.getLayout().appendToDom();
				self.is_started = true;
			}));
		};

		helper.prototype.isBeforeEachReady = function ()
		{
			return this.is_started;
		};

		helper.prototype.afterEach = function ()
		{
			//Restore Ajax Usage
			jasmine.Ajax.uninstall();

			//Unattach view from events
			this.application.getLayout().undelegateEvents();
			this.application.getLayout().$el.removeData().unbind();
			this.application.getLayout().remove();

			//Clean the current URL Hash
			Backbone.history.navigate('', {trigger: false});
			Backbone.history.stop();
		};

		return helper;
	})();

});
