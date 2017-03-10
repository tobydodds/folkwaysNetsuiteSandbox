// OrderItem.Model.js
// -----------------------
// Ordered items, it's used for showing the reorder items page
define('OrderItem.Model', ['ItemDetails'], function (ItemDetails)
{
	'use strict';

	return Backbone.Model.extend({
		urlRoot: 'services/orderitems.ss'

	,	validation: {}

	,	parse: function (record)
		{
			if (record.item)
			{
				record.id = record.item.internalid;
				record.internalid = record.item.internalid +'|'+ JSON.stringify(record.options_object);
				record.item = new ItemDetails.Model(record.item);
			}
			return record;
		}
	});
});