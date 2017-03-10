/*exported service*/
// placed-order.ss
// ----------------
// Service to manage orders requests
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		//Only can get an order if you are logged in
		if (session.isLoggedIn())
		{
			var method = request.getMethod()
			,	id = request.getParameter('internalid')
			,	page = request.getParameter('page') || 1
			//  Order model is defined on ssp library Models.js
			,	PlacedOrder = Application.getModel('PlacedOrder');
			
			switch (method)
			{
				case 'GET':
					//If the id exist, sends the response of Order.get(id), else sends the response of (Order.list(page) || [])
					Application.sendContent(id ? PlacedOrder.get(id) : (PlacedOrder.list(page) || []));
				break;

				default: 
					// methodNotAllowedError is defined in ssp library commons.js
					Application.sendError(methodNotAllowedError);
			}
		}
		else
		{
			// unauthorizedError is defined in ssp library commons.js
			Application.sendError(unauthorizedError);
		}
	}
	catch (e)
	{
		Application.sendError(e);
	}
}