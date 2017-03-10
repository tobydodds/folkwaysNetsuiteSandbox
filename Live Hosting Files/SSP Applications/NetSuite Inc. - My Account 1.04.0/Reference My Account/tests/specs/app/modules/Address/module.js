/*jshint laxcomma:true*/
define(['Address','jasmineTypeCheck'], function (AddressModule)
{
	return describe('Address Module', function () 
	{
		describe('definition', function ()
		{
			it ('should define initial module properties', function ()
			{
				expect(AddressModule.Views).toBeDefined();
				expect(AddressModule.Model).toBeDefined();
				expect(AddressModule.Collection).toBeDefined();
				expect(AddressModule.Router).toBeDefined();
				expect(AddressModule.mountToApp).toBeA(Function);
			});

			it ('and mount to app should initalize the router', function ()
			{
				var result_to_mount_app = AddressModule.mountToApp({},{startRouter: true});

				expect(result_to_mount_app).toBeA(AddressModule.Router);
			});
		});
	});
});