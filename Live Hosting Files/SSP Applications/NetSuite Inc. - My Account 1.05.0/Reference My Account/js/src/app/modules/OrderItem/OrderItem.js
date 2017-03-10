// OrderItem.js
// -----------------
// Defines the OrderItem  module (Model, Collection, Views, Router)
define('OrderItem', ['OrderItem.Views', 'OrderItem.Model', 'OrderItem.Router', 'OrderItem.Collection'], function (Views, Model, Router, Collection)
{
	'use strict';
	
	return	{
		Views: Views
	,	Model: Model
	,	Router: Router
	,	Collection: Collection	

	,	MenuItems: {
			parent: 'orders'
		,	id: 'reorderitems'
		,	name: _('Reorder Items').translate()
		,	url: 'reorderItems'
		,	index: 4
		,	permission: 'transactions.tranFind.1,transactions.tranSalesOrd.1'
		}

	,	mountToApp: function (application)
		{
			this.application = application;
			return new Router(application);
		}
	};
});