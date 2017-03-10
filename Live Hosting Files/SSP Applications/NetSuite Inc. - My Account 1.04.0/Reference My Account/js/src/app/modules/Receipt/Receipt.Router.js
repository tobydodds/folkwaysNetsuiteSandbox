// Receipt.Router.js
// -----------------------
// Router for handling receipts
define('Receipt.Router',  ['Receipt.Views', 'Receipt.Model', 'Receipt.Collection'], function (Views, Model, Collection)
{
	'use strict';

	return Backbone.Router.extend({
	
		routes: {
			'receiptshistory': 'receiptsHistory'
		,	'receiptshistory/view/:id': 'receiptDetails'
		}
				
	,	initialize: function (application)
		{
			this.application = application;
		}
		
		// list receipts history
	,	receiptsHistory: function () 
		{
			var collection = new Collection()
			,	view = new Views.List({
					application: this.application
				,	collection: collection
				});
			
			collection
				.on('reset', view.showContent, view)
				.fetch({
					data: { type: 'cashsale' }
				,	reset: true
				});
		}
		
		// view receipt's detail
	,	receiptDetails: function (id)
		{
			var model = new Model({ internalid: id })
			,	view = new Views.Details({
					application: this.application
				,	id: id
				,	model: model
				});
				
			model
				.on('change', view.showContent, view)
				.fetch();
		}
	});
});