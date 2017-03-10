// ReturnAuthorization.Router.js
// -----------------------
define('ReturnAuthorization.Router'
,	['ReturnAuthorization.Model', 'ReturnAuthorization.Collection', 'ReturnAuthorization.Views']
,	function (Model, Collection, Views)
{
	'use strict';

	return Backbone.Router.extend({

		routes: {
			'returns': 'list'
		,	'returns?:options': 'list'
		,	'returns/:id': 'details'
		,	'returns/:id?:options': 'details'
		,	'returns/new/:type/:id': 'form'
		,	'returns/new/:id': 'confirmation'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

	,	list: function (options)
		{
			var parameters = _.parseUrlOptions(options)

			,	collection = new Collection()

			,	view = new Views.List({
					application: this.application
				,	collection: collection
				,	page: parameters.page
				});

			if (parameters.cancel)
			{
				view.message = _('Good! Your request was successfully cancelled.').translate();
				Backbone.history.navigate(_.removeUrlParameter(Backbone.history.fragment, 'cancel'), {replace: true});
			}

			collection.on('reset', jQuery.proxy(view, 'showContent', 'returns'));

			view.showContent('returns');
		}

	,	details: function (id)
		{
			var model = new Model({
					internalid: id
				})

			,	view = new Views.Detail({
					application: this.application
				,	model: model
				});

			model.fetch().then(jQuery.proxy(view, 'showContent', 'returns'));
		}

	,	form: function (type, id)
		{
			var created_from = this.getCreatedFrom(type, id)

			,	application = this.application

			,	model = new Model()

			,	view = new Views.Form({
					application: application
				,	model: model
				,	createdFrom: created_from
				});

			created_from.fetch().then(jQuery.proxy(view, 'showContent'));

			model.on('save', function ()
			{
				new Views.Confirmation({
					application: application
				,	model: model
				}).showContent('returns');

				Backbone.history.navigate('/returns/new/' + model.get('internalid'), {trigger: false});
			});
		}

	,	confirmation: function (id)
		{
			var model = new Model({
					internalid: id
				})

			,	view = new Views.Confirmation({
					application: this.application
				,	model: model
				});

			model.fetch().then(jQuery.proxy(view, 'showContent', 'returns'));
		}

	,	getCreatedFrom: function (type, id)
		{
			var Model = null;

			if (type === 'invoice')
			{
				Model = require('Invoice.Model');
			}
			else if (type === 'order')
			{
				Model = require('PlacedOrder.Model');
			}

			return new Model({
				internalid: id
			});
		}
	});
});