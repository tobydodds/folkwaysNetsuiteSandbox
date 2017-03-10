// OrderFulfillment.Collection.js
// ------------------------------
// Order Fulfillment collection
define('OrderFulfillment.Collection', ['OrderFulfillment.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({
		model: Model
	});
});