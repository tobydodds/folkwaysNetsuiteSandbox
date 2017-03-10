/* exported service */
// live-order-giftcertificate.ss
// ----------------
// Service to manage gift certificates in the live order
function service (request)
{
	'use strict';

	try
	{

		//Only can set gift certificates if you are logged in
		if (session.isLoggedIn())
		{
			var data = JSON.parse(request.getBody() || '{}')
				// Cart model is defined on ssp library Models.js
			,	LiveOrder = Application.getModel('LiveOrder');
			
			switch (request.getMethod())
			{
				case 'POST':
					LiveOrder.setGiftCertificates(data.giftcertificates);
				break;
				
				default:
					// methodNotAllowedError is defined in ssp library commons.js
					return Application.sendError(methodNotAllowedError);
			}

			Application.sendContent(LiveOrder.get() || {});
		}
		else
		{
			Application.sendError(unauthorizedError);
		}
	}
	catch (e)
	{
		Application.sendError(e);
	}
}