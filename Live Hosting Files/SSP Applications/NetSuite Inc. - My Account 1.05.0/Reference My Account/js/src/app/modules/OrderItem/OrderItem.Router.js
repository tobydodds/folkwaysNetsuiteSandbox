// OrderItem.Router.js
// -----------------------
// Router for handling orderered items
define('OrderItem.Router',  ['OrderItem.Views', 'OrderItem.Collection'], function (Views, Collection)
{
	'use strict';

	return Backbone.Router.extend({

		routes: {
			'reorderItems': 'reorderItems'
		,	'reorderItems?:options': 'reorderItems'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

	,	reorderItems: function (options)
		{
			if (options)
			{
				options = SC.Utils.parseUrlOptions(options);
			}
			else
			{
				options = {page: 1};
			}

			var collection = new Collection()
			,	view = new Views.ReorderList({
					application: this.application
				,	sort: options.sort || 0
				,	order_id: options.order_id || 0
				,	page: options.page || 1
				,	collection: collection
				});

			if (view.order_id)
			{
				collection.setParameters({
					order_id: view.order_id
				});
			}

			view.collection.on('reset', view.render, view);
			view.showContent();
		}
	});
});