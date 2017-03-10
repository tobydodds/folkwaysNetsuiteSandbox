// Receipt.Model.js
// -----------------------
// Model for showing information about past receipts
define('Receipt.Model',['Order.Model'], function (OrderModel)
{
	'use strict';

	var Model = OrderModel.extend({
		urlRoot: 'services/receipt.ss'

	,	expand: function ()
		{
			if (this.expanded)
			{
				this.trigger('expand', this);	
			}
			else
			{
				var self = this;

				this.fetch({
					success: function ()
					{
						self.expanded = true;
						self.trigger('expand', this);
					}
				});
			}
		}
	});

	// add support for cache
	Model.prototype.sync =  Backbone.CachedModel.prototype.sync;
	Model.prototype.addToCache =  Backbone.CachedModel.prototype.addToCache;

	return Model;

});
