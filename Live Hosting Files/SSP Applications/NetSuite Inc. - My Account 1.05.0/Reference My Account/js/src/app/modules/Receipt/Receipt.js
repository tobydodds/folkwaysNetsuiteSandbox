// Receipt.js
// -----------------
// Defines the Receipt module (Model, Collection, Views, Router)
define('Receipt', ['Receipt.Views', 'Receipt.Model', 'Receipt.Router', 'Receipt.Collection'], function (Views, Model, Router, Collection)
{
	'use strict';

	return	{ 
		Views: Views
	,	Model: Model
	,	Router: Router
	,	Collection: Collection

	,	MenuItems: {
			parent: 'orders'
		,	id: 'receiptshistory'
		,	name: _('Receipts').translate()
		,	url: 'receiptshistory'
		,	index: 3
		,	permission: 'transactions.tranFind.1,transactions.tranSalesOrd.1'
		}
	
	,	mountToApp:  function (application)
		{
			return new Router(application);
		}
	};
});