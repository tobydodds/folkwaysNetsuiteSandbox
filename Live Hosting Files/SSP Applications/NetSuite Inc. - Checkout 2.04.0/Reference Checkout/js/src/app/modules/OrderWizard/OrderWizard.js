// OrderWizzard.js
// ---------------
//
define('OrderWizard', ['OrderWizard.Router', 'LiveOrder.Model'], function (Router, Model)
{
	'use strict';

	return {
		Router: Router
	,	Model: Model
	,	mountToApp: function(application)
		{
			var router = new Router(application, {
				model: application.getCart()
			,	profile: application.getUser()
			,	steps: application.getConfig('checkoutSteps')
			});

			return router;
		}
	};
});

