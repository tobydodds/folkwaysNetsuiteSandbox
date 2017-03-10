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
			//  Order model is defined on ssp library Models.js
			,	PlacedOrder = Application.getModel('PlacedOrder');
			
			if (Application.getPermissions().transactions.tranSalesOrd > 0)
			{
				switch (method)
				{
					case 'GET':
						
						//If the id exist, sends the response of Order.get(id), else sends the response of (Order.list(options) || [])

						if (id)
						{
							Application.sendContent(PlacedOrder.get(id));
						}
						else
						{
							Application.sendContent(PlacedOrder.list({
								filter: request.getParameter('filter')
							,	order: request.getParameter('order')
							,	sort: request.getParameter('sort')
							,	from: request.getParameter('from')
							,	to: request.getParameter('to')
							,	page: request.getParameter('page') || 1
							,	results_per_page: request.getParameter('results_per_page')
							}));
						}


					break;

					default: 
						// methodNotAllowedError is defined in ssp library commons.js
						Application.sendError(methodNotAllowedError);
				}
			}
			else
			{
				// forbiddenError is defined in ssp library commons.js
				Application.sendError(forbiddenError);
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