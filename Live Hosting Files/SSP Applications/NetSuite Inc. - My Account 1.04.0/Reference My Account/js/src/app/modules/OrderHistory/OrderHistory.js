// OrderHistory.js
// -----------------
// Defines the Order  module (Model, Collection, Views, Router)
define('OrderHistory', ['OrderHistory.Views','OrderHistory.Router'], function (Views,  Router)
{
	'use strict';
	
	return	{
		Views: Views
	,	Router: Router
	
	,	MenuItems: {
			id: 'orders'
		,	name: _('Orders').translate()
		,	index: 1
		,	children: [{
				id: 'ordershistory'
			,	name: _('Order History').translate()
			,	url: 'ordershistory'
			,	index: 1
			,	permission: 'transactions.tranFind.1,transactions.tranSalesOrd.1'
			}]
		}
	
	,	mountToApp: function (application)
		{
			return new Router(application);
		}
	};
});
