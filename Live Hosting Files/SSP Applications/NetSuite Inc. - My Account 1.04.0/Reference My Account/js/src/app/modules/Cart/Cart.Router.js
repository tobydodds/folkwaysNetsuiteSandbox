// Cart.Router.js
// --------------
// Creates the cart route
define('Cart.Router', ['Cart.Views'], function (Views)
{
	'use strict';
	
	return Backbone.Router.extend({
		
		routes: {
			'cart': 'showCart'
		,	'cart?*options': 'showCart'
		}
		
	,	initialize: function (Application, isSaveForLater)
		{
			this.isSaveForLater = isSaveForLater;			
			this.application = Application;
		}
		
	,	showCart: function ()
		{
			if (this.application.ProductListModule && this.application.ProductListModule.isProductListEnabled() && this.isSaveForLater)
			{
				var self = this;

				require(['Cart.SaveForLater.View'], function (saveForLaterCartView)
				{ 
					self.renderView(saveForLaterCartView);
				});
			}
			else
			{
				this.renderView(Views);
			}			
		}

	,	renderView: function (CartView)
		{
			var self = this;
			self.application.loadCart()
				.done(function ()
				{
					var view = new CartView.Detailed({
						model: self.application.getCart()
					,	application: self.application
					});
					
					view.showContent();
				});
		}
	});
});

