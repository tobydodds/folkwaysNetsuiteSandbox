// ReturnAuthorization.js
// -----------------
// Defines the Return Authorization module (Model, Collection, Views, Router)
define('ReturnAuthorization'
,	['ReturnAuthorization.Model', 'ReturnAuthorization.Collection', 'ReturnAuthorization.Views', 'ReturnAuthorization.Router']
,	function (Model, Collection, Views, Router)
{
	'use strict';
	
	return	{
		Model: Model
	,	Collection: Collection
	,	Views: Views
	,	Router: Router

	,	MenuItems: {
			parent: 'orders'
		,	id: 'returns'
		,	name: _('Returns').translate()
		,	url: 'returns'
		,	index: 2
		,	permission: 'transactions.tranFind.1,transactions.tranRtnAuth.1'
		}

	,	mountToApp: function (application)
		{
			return new this.Router(application);
		}
	};
});
