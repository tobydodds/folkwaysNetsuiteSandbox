/*exported service*/
// orderitems.ss
// ----------------
// Service to manage order items requests
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		//Only can get a order item if you are logged in
		if (session.isLoggedIn())
		{
			var method = request.getMethod()
			//  OrderItem model is defined on ssp library Models.js
			,	OrderItem = Application.getModel('OrderItem');

			switch (method)
			{
				case 'GET':
					//Call the search function defined on ssp_libraries/models/OrderItem.js and send the respose
					Application.sendContent(OrderItem.search(
						request.getParameter('order_id')
					,	request.getParameter('query')
					,	{
							date : {
								from: request.getParameter('from')
							,	to: request.getParameter('to')
							}
						,	page: request.getParameter('page') || 1
						,	sort : request.getParameter('sort')
						,	order: request.getParameter('order')
						}
					));
				break;

				default:
				//  methodNotAllowedError is defined in ssp library commons.js
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