// LoginRegister.Router.js
// -----------------------
// Initializes the different views depending on the requested path
define('LoginRegister.Router', ['LoginRegister.Views'], function (Views)
{
	'use strict';

	return Backbone.Router.extend({
		
		routes: {
			'login-register': 'loginRegister'
		,	'forgot-password': 'forgotPassword'
		,	'reset-password': 'resetPassword'
		,	'register': 'register'
		,	'login': 'login'
		}
		
	,	initialize: function (application)
		{
			// application is a required parameter for all views
			// we save the parameter to pass it later
			this.application = application;
		}

	,	loginRegister: function ()
		{
			if (this.application.getUser().get('isLoggedIn') === 'T' && this.application.getUser().get('isGuest') === 'F') 
			{
				Backbone.history.navigate('', { trigger: true });
			}
			else
			{
				var view = new Views.LoginRegister({
					application: this.application
				});
				view.showContent(); 
			}
		}

	,	register: function ()
		{
			if (this.application.getUser().get('isLoggedIn') === 'T' && this.application.getUser().get('isGuest') === 'F') 
			{
				Backbone.history.navigate('', { trigger: true });
			}
			else
			{
				var view = new Views.Register({
					application: this.application
				});
				view.title = _('Register').translate(); 
				view.showContent(); 
			}
		}

	,	login: function ()
		{
			if (this.application.getUser().get('isLoggedIn') === 'T' && this.application.getUser().get('isGuest') === 'F') 
			{
				Backbone.history.navigate('', { trigger: true });
			}
			else
			{
				var view = new Views.Login({
					application: this.application
				});
				view.title = _('Sign In').translate(); 
				view.showContent(); 
			}
		}

	,	forgotPassword: function ()
		{
			var view = new Views.ForgotPassword({
				application: this.application
			});
			
			view.showContent();
		}

	,	resetPassword: function ()
		{
			var view = new Views.ResetPassword({
				application: this.application
			});
			
			view.showContent();
		}
	});
});