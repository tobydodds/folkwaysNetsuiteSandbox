// PlacedOrder.Model.js
// -----------------------
// Model for showing information about past orders
define('PlacedOrder.Model'
,	['Order.Model', 'OrderFulfillment.Collection', 'ReturnAuthorization.Collection', 'Receipt.Collection']
,	function (OrderModel, OrderFulfillmentsCollection, ReturnAuthorizationCollection, ReceiptCollection)
{
	'use strict';

	return OrderModel.extend({
		
		urlRoot: 'services/placed-order.ss'
		
	,	initialize: function (attributes)
		{
			// call the initialize of the parent object, equivalent to super()
			OrderModel.prototype.initialize.apply(this, arguments);
			
			this.on('change:fulfillments', function (model, fulfillments)
			{
				model.set('fulfillments', new OrderFulfillmentsCollection(fulfillments), {silent: true});
			});
			this.trigger('change:fulfillments', this, attributes && attributes.fulfillments || []);
			
			this.on('change:receipts', function (model, receipts)
			{
				model.set('receipts', new ReceiptCollection(receipts), {silent: true});
			});
			this.trigger('change:receipts', this, attributes && attributes.receipts || []);

			this.on('change:returnauthorizations', function (model, returnauthorizations)
			{
				model.set('returnauthorizations', new ReturnAuthorizationCollection(returnauthorizations), {silent: true});
			});
			this.trigger('change:returnauthorizations', this, attributes && attributes.returnauthorizations || []);
		}
	});
});
