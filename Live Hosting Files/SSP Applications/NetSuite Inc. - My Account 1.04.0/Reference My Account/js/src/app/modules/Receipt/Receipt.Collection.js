// Receipt.Collection.js
// -----------------------
// Receipts  collection
define('Receipt.Collection', ['Receipt.Model'], function (Model)
{
	'use strict';
		
	return Backbone.CachedCollection.extend({
		model: Model
	,	url: 'services/receipt.ss'

	});
});