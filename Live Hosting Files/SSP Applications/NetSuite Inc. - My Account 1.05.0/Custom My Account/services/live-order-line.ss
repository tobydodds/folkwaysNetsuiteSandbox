/*exported service*/
// live-order-line.ss
// ----------------
// Service to manage lines in the live order
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		var method = request.getMethod()
		,	id = request.getParameter('internalid')
		,	data = JSON.parse(request.getBody() || '{}')
			// Cart model is defined on ssp library Models.js
		,	LiveOrder = Application.getModel('LiveOrder');

		// If we are not in the checkout OR we are logged in
		// When on store, login in is not required
		// When on checkout, login is required
		if (!~request.getURL().indexOf('https') || session.isLoggedIn())
		{
			switch (method)
			{
				case 'PUT':
					// Pass the data to the Cart's update method and send it response
					if (data.options && data.options.void)
					{
						LiveOrder.voidLine(id);
					}
					else if (data.options && data.options['return'])
					{
						LiveOrder.returnLine(id);
					}
					else
					{
						LiveOrder.updateLine(id, data);
					}
				break;

				case 'POST':
					LiveOrder.addLines(_.isArray(data) ? data : [data]);
				break;

				case 'DELETE':
					// The item is removed and we send the get method again
					LiveOrder.removeLine(id);
				break;

				default:
					// methodNotAllowedError is defined in ssp library commons.js
					return Application.sendError(methodNotAllowedError);
			}

			Application.sendContent(LiveOrder.get() || {});
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