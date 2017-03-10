// CreditCard.js
// -----------------
// Defines the CreditCard  module (Model, Collection, Views, Router)
define('CreditCard', ['CreditCard.Views','CreditCard.Model','CreditCard.Collection', 'CreditCard.Router'], function (Views, Model, Collection, Router)
{
	'use strict';

	return	{
		Views: Views
	,	Model: Model
	,	Router: Router
	,	Collection: Collection

	,	MenuItems: {
			parent: 'settings'
		,	id: 'creditcards'
		,	name: _('Credit Cards').translate()
		,	url: 'creditcards'
		,	index: 4
		}
	
	,	mountToApp: function (application, options)
		{
			// Initializes the router
			if (options && options.startRouter)
			{
				return new Router(application);
			}
		}
	};
});
