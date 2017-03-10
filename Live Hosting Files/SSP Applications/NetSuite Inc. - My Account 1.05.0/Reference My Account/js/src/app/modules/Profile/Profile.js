// Profile.js
// -----------------
// Defines the Profile module (Collection, Views, Router)
// As the profile is instanciated in the application (without definining a model) 
// the validation is configured here in the mountToApp
define('Profile', ['Profile.Views','Profile.Router','User.Model'], function (Views, Router, UserModel)
{
	'use strict';
		
	return	{

		Views: Views
	,	Router: Router
	,	MenuItems: [
			{
				id: 'home'
			,	name: _('Overview').translate()
			,	url: 'overview'
			,	index: 0
			}
		,	{
				id: 'settings'
			,	name: _('Settings').translate()
			,	index: 4
			,	children: 
				[
					{
						id: 'profileinformation'
					,	name: _('Profile Information').translate()
					,	url: 'profileinformation'
					,	index: 1
					}
				,	{
						id: 'emailpreferences'
					,	name: _('Email Preferences').translate()
					,	url: 'emailpreferences'
					,	index: 2
					}
				,	{
						id: 'updateyourpassword'
					,	name: _('Update Your Password').translate()
					,	url: 'updateyourpassword'
					,	index: 5
					}
				]
			}
		]

	,	mountToApp: function (application)
		{
			var Layout = application.getLayout();

			application.UserModel = UserModel.extend({
				urlRoot: 'services/profile.ss'
			});
			
			application.getUser().on('change:name change:lastname change:companyname', function ()
			{
				Layout.updateHeader();
			});

			return new Router(application);
		}
	};
});