// CreditCard.Router.js
// -----------------------
// Router for handling addresses (CRUD)
define('Address.Router', ['Address.Views','Address.Model'], function (Views, Model)
{
	'use strict';
	// Adds routes to the application
	return Backbone.Router.extend({
		
		routes: {
			'addressbook': 'addressBook'
		,	'addressbook/new': 'newAddress'
		,	'addressbook/:id': 'addressDetailed'
		}
		
	,	initialize: function (application)
		{
			this.application = application;
		}
		
		// list profile's addressess
	,	addressBook: function ()
		{
			if (this.application.getUser().get('isLoggedIn') !== 'T')
			{
				return this.application.getLayout().notFound();
			}

			var collection = this.application.getUser().get('addresses');

			if (collection.length)
			{
				var view = new Views.List({
					application: this.application
				,	collection: collection
				});
				
				collection.off(null, null, this);

				collection.on('reset destroy change add', function ()
				{
					var currentView = this.application.getLayout().currentView; 
					
					if (currentView instanceof Views.List || currentView instanceof Views.Details)
					{
						this.addressBook();
					}
				
				}, this);
				
				view.showContent('addressbook');
			}
			else
			{
				Backbone.history.navigate('#addressbook/new', {trigger: true});
			}

		}

	// view address's details
	,	addressDetailed: function (id)
		{
			if (this.application.getUser().get('isLoggedIn') !== 'T')
			{
				return this.application.getLayout().notFound();
			}

			var collection = this.application.getUser().get('addresses')

			,	model = collection.get(id)
			,	view = new Views.Details({
					application: this.application
				,	collection: collection
				,	model: model
				});
			
			view.model.on('reset destroy change add', function ()
			{
				if (view.inModal && view.$containerModal)
				{
					view.$containerModal.modal('hide');
					view.destroy();
				}
				else
				{
					Backbone.history.navigate('#addressbook', {trigger: true});
				}
			}, view);
			
			view.showContent('addressbook');
		}

	// add new address 
	,	newAddress: function ()
		{
			if (this.application.getUser().get('isLoggedIn') !== 'T')
			{
				return this.application.getLayout().notFound();
			}
			
			var collection = this.application.getUser().get('addresses')

			,	view = new Views.Details({
					application: this.application
				,	collection: collection
				,	model: new Model()
				});
			
			collection.on('add', function ()
			{
				if (view.inModal && view.$containerModal)
				{
					view.$containerModal.modal('hide');
					view.destroy();
				}
				else
				{
					Backbone.history.navigate('#addressbook', {trigger: true});
				}
			}, view);

			view.model.on('change', function (model)
			{
				collection.add(model);
			}, this);
			
			view.showContent('addressbook');
		}
	});
});
