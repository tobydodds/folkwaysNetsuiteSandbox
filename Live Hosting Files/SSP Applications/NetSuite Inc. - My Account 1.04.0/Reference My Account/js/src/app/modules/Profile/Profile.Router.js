// Profile.Router.js
// -----------------------
// Router for handling profile view/update
define('Profile.Router',  ['Profile.Views','PlacedOrder.Collection','Profile.UpdatePassword.Model'], function (Views, PlacedOrderCollection, UpdatePasswordModel)
{
	'use strict';

	return Backbone.Router.extend({
		
		routes: {
			'': 'home'
		,	'overview': 'home'
		,	'profileinformation': 'profileInformation'
		,	'emailpreferences': 'emailPreferences'
		,	'updateyourpassword': 'updateYourPassword'
		}
				
	,	initialize: function (application)
		{
			this.application = application;
		}
		
		// load the home page
	,	home: function ()
		{

			var	orderCollection = new PlacedOrderCollection()
			,	view = new Views.Home({
					application: this.application
				,	model: this.application.getUser()
				});
			
			// get latest orders
			orderCollection
				.fetch({
					data: { page: 1 }
				,	error: function (model, jqXhr)
					{
						// this will stop the ErrorManagment module to process this error
						// as we are taking care of it 
						jqXhr.preventDefault = true;
					}
				})
				.always(function ()
				{
					view.recentOrders = orderCollection.models.slice(0, 3);
					view.showContent();
				});

		}
		
		// view/update profile information
	,	profileInformation: function ()
		{
			var model = this.application.getUser()

			,	view = new Views.Information({
					application: this.application
				,	model: model
				});

			view.useLayoutError = true;
			
			model.on('save', view.showSuccess, view);
			view.showContent();
		}
		
	
		// view/edit user's email preferences
	,	emailPreferences: function ()
		{
			var model = this.application.getUser()

			,	view = new Views.EmailPreferences({
					application: this.application
				,	model: model 
				});

			view.useLayoutError = true;
			
			model.on('save', view.showSuccess, view);
			view.showContent();
		}
	
		// update your password
	,	updateYourPassword: function ()
		{
			var model = new UpdatePasswordModel({
					current_password: ''
				,	confirm_password:''
				,	password:''
				});

			// merge the profile model into the UpdatePasswordModel
			model.set(this.application.getUser().attributes);

			var	view = new Views.UpdateYourPassword({
					application: this.application
				,	model: model
				});

			view.useLayoutError = true;
			
			model.on('save', view.showSuccess, view);
		
			view.showContent();
		}
	});
});