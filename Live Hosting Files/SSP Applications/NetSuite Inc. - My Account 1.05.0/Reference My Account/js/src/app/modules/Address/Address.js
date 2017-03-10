// Address.js
// -----------------
// Defines the Address  module (Model, Collection, Views, Router)
define('Address', ['Address.Views','Address.Model','Address.Router','Address.Collection'], function (Views, Model, Router, Collection)
{
	'use strict';
	
	return	{
		Views: Views
	,	Model: Model
	,	Router: Router
	,	Collection: Collection

	,	MenuItems: {
			parent: 'settings'
		,	id: 'addressbook'
		,	name: _('Address Book').translate()
		,	url: 'addressbook'
		,	index: 3
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
