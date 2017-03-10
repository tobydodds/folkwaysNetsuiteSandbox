// Cart.js
// -------
// Defines the Cart module (Model, Collection, Views, Router)
// mountToApp handles some environment issues
// Add some function to the application
// * getCart()
// and to the layout
// * updateMiniCart()
// * showMiniCart()
// * showCartConfirmationModal()
// * goToCart()
// * showCartConfirmation()
define('Cart'
,	['LiveOrder.Model', 'Cart.Views', 'Cart.Router']
,	function (LiveOrderModel, Views, Router)
{
	'use strict';

	return {
		Views: Views
	,	Router: Router
	,	mountToApp: function (application, options)
		{
			var Layout = application.getLayout();
			
			// application.getCart():
			// Use it to acuire the cart model instance
			application.getCart = function ()
			{
				if (!application.cartInstance)
				{
					application.cartInstance = new LiveOrderModel({internalid: 'cart'});
					application.cartInstance.application = application;
					application.cartInstance.bootstraped = SC.ENVIRONMENT.CART_BOOTSTRAPED;
					application.cartInstance.isLoading = !SC.ENVIRONMENT.CART_BOOTSTRAPED;
				}
				
				return application.cartInstance;
			};

			// Get the cart fetch promise
			application.loadCart = function ()
			{
				// if the Page Generator is on, do not fetch the cart. Instead, return an empty solved promise
				if(SC.isPageGenerator())
				{
					return jQuery.Deferred().resolve();
				}

				var self = this; 
				if (this.cartLoad)
				{
					if (application.cartInstance.isLoading) {
						application.cartInstance.isLoading = false;
						Layout.updateMiniCart();
					}
					return this.cartLoad;
				}
				else
				{
					this.cartLoad = jQuery.Deferred();
					application.getUserPromise().done(function()
					{
						self.getCart().fetch()
						.done(function()
						{
							self.cartLoad.resolve.apply(this, arguments);
						})
						.fail(function()
						{
							self.cartLoad.reject.apply(this, arguments);
						})
						.always(function()
						{
							if (application.cartInstance.isLoading) {
								application.cartInstance.isLoading = false;
								Layout.updateMiniCart();
							}
						});
					});
				}
				
				return this.cartLoad;

			};

			_.extend(Layout.key_elements, {
				miniCart: '#mini-cart-container'
			,	miniCartSummary: '.mini-cart-summary'
			});
						
			// layout.updateMiniCart()
			// Updates the minicart by running the macro and updateing the miniCart key Element
			Layout.updateMiniCart = function ()
			{
				if (application.getConfig('siteSettings.sitetype') === 'ADVANCED')
				{
					var cart = application.getCart();
					this.$miniCart.html(SC.macros.miniCart(cart, application));
					this.$miniCartSummary.html(SC.macros.miniCartSummary(cart.getTotalItemCount(), application.cartInstance.isLoading));
				}
			};
			
			// layout.showMiniCart()
			Layout.showMiniCart = function ()
			{
				jQuery(document).scrollTop(0);
				// Hide the modal
				Layout.$containerModal && Layout.$containerModal.length && Layout.$containerModal.modal('hide');
				this.$(Layout.key_elements.miniCart +' .dropdown-toggle').parent().addClass('open');
			};
			
			// layout.showCartConfirmationModal()
			Layout.showCartConfirmationModal = function ()
			{
				this.showInModal(new Views.Confirmation({
					layout: this
				,	application: application
				,	model: application.getCart()
				}));
			};
			
			// layout.goToCart()
			Layout.goToCart = function ()
			{
				Backbone.history.navigate('cart', { trigger: true });
			};
			
			// layout.showCartConfirmation()
			// This reads the configuration object and execs one of the fuctions avome 
			Layout.showCartConfirmation = function ()
			{
				// Available values are: goToCart, showMiniCart and showCartConfirmationModal
				Layout[application.getConfig('addToCartBehavior')]();
			};
			
			// Every time the cart changes the mini cart gets updated
			Layout.on('afterRender', function ()
			{
				application.getCart().on('change', function ()
				{
					Layout.updateMiniCart();
				});
			});

			// Check if cart was bootstraped
			var cart_bootstrap = application.getCart().bootstraped;
			if(!cart_bootstrap)
			{
				// Load the cart information
				application.loadCart();
			}

			// Initializes the router
			if (options && options.startRouter)
			{
				return new Router(application, options.saveForLater);
			}
		}
	};
});
