// Content.js
// ----------
// Checkout Skip Login mode. The Checkout Skip Login is a feature that is disabled by defulat and can be enabled by setting property checkout_skip_login
// to true in backend.configuration.js file
define(
	'CheckoutSkipLogin'
,	['Account.RegisterAsGuest.Model', 'LiveOrder.Model', 'Address.Model', 'CreditCard.Model']
,	function (AccountRegisterAsGuestModel, LiveOrderModel, AddressModel, CreditCardModel)
{
	'use strict';

	return {
		mountToApp: function(application)
		{
			// do nothing if the mode is disabled
			if (!application.getConfig('checkout_skip_login'))
			{
				return;
			}

			//this function is called only if skip login mode is enabled
			var registerUserAsGuest = function ()
			{
				var promise = jQuery.Deferred();
				if (application.getUser().get('isGuest') === 'F' && application.getUser().get('isLoggedIn') === 'F')
				{
					var checkoutStep = application.getLayout().currentView.currentStep;

					checkoutStep && checkoutStep.disableNavButtons();

					new AccountRegisterAsGuestModel().save().done(function(data)
					{
						data.user && application.getUser().set(data.user);
						application.getLayout().currentView.wizard.options.profile = application.getUser();
						data.cart && application.getCart().set(data.cart);
						data.touchpoints && (application.Configuration.siteSettings.touchpoints = data.touchpoints);
						promise.resolve();
						checkoutStep && checkoutStep.enableNavButtons();
						jQuery('[data-action="skip-login-message"]').remove();
					});
				}
				else
				{
					promise.resolve();
				}
				return promise;
			};

			// add 'this.application' to models that doesn't have it.
			AddressModel.prototype.application = application;
			CreditCardModel.prototype.application = application;

			// wrap save() method to LiveOrderModel, AddressModel and CreditCardModel

			var wrapper = function(superFn)
			{
				var self = this
				,	super_arguments = Array.prototype.slice.apply(arguments, [1, arguments.length])
				,	promise = jQuery.Deferred();

				registerUserAsGuest().done(function ()
				{
					var result = superFn.apply(self, super_arguments);

					if (result)
					{
						result.done(function ()
						{
							promise.resolve.apply(result, arguments);
						}).fail(function()
						{
							promise.reject.apply(result, arguments);
						});
					}
					else
					{
						// Notify future promises that a front end validation took place and no promise is returned
						promise.frontEndValidationError = true;
						promise.reject.apply(result, super_arguments);
					}
				});

				_(promise).extend({error: function(){return this;},success: function(){return this;}});

				return promise;
			};

			// don't wrap on non-secure domains (Site Builder cart is in Checkout :/ )
			if (window.location.protocol !== 'http:')
			{
				LiveOrderModel.prototype.save = _.wrap(LiveOrderModel.prototype.save, wrapper);
			}

			AddressModel.prototype.save = _.wrap(AddressModel.prototype.save, wrapper);

			CreditCardModel.prototype.save = _.wrap(CreditCardModel.prototype.save, wrapper);

		}
	};
});
