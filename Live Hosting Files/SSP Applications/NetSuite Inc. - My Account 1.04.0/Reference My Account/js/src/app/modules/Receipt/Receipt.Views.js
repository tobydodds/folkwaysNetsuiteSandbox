// Receipt.Views.js
// -----------------------
// Views for receipt's details
define('Receipt.Views', ['OrderHistory.Views'], function (OrderHistoryViews)
{
	'use strict';

	var Views = {};
	
	// view an order's detail
	Views.Details = OrderHistoryViews.Details.extend({

		template: 'receipt_details'

	,	title: _('Receipt Details').translate()

	,	attributes: {'class': 'OrderDetailsView'}
		
	,	showContent: function ()
		{
			this.title = _('Receipt Details').translate();
			this.options.application.getLayout().showContent(this, 'receiptshistory', [
				{
					text: _('Receipts').translate()
				,	href: '/receiptshistory'
				}
			,	{
					text: _('Receipt').translate() + ' #' + this.model.get('order_number')
				,	path: '/receiptshistory/view/' + this.model.get('id')
				}
			]);
		}
	});
	
	//list receipt's history
	Views.List = Backbone.View.extend({
		template: 'receipt_history'
	,	title: _('Receipts').translate()
	,	page_header: _('Receipts').translate()
	,	attributes: {'class': 'OrderListView'}
		
	,	showContent: function ()
		{
			this.options.application.getLayout().showContent(this, 'receiptshistory', [{
				text: this.title
			,	href: '/receiptshistory'
			}]);
		}
	});
	
	return Views;	
});