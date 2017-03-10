define(['CreditCard','jasmineTypeCheck'], function (CreditCard)
{
	'use strict';
	return describe('Credit Card Module', function () 
	{
		describe('definition', function ()
		{
			it ('should define initial module properties', function ()
			{
				expect(CreditCard.Views).toBeDefined();
				expect(CreditCard.Model).toBeDefined();
				expect(CreditCard.Collection).toBeDefined();
				expect(CreditCard.Router).toBeDefined();
				expect(CreditCard.mountToApp).toBeA(Function);
			});

			it ('and mount to app should initalize the router', function ()
			{
				var result_to_mount_app = CreditCard.mountToApp({},{startRouter: true});

				expect(result_to_mount_app).toBeA(CreditCard.Router);
			});
		});
	});
});