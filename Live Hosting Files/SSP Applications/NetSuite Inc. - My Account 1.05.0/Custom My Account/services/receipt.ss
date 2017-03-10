/*exported service*/
// receipt.ss
// ----------------
// Service to manage receipts requests
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		// Only can get a receipt if you are logged in
		if (session.isLoggedIn())
		{
			var method = request.getMethod()
			,	id = request.getParameter('internalid')
			,	status = request.getParameter('status')
			,	type = request.getParameter('type')
				// Receipts model is defined on ssp library Models.js
			,	Receipt = Application.getModel('Receipts')
			,	permissions = Application.getPermissions().transactions;

			if (permissions.tranSalesOrd > 0)
			{
				switch (method)
				{
					case 'GET':
						// If the id exist, sends the response of Receipt.get(id), else send (Receipt.list(options) || [])
						Application.sendContent(id ? Receipt.get(id, type) : Receipt.list({
							type: type
						,	status: status
						}));

					break;

					default:
						// methodNotAllowedError is defined in ssp library commons.js
						Application.sendError(methodNotAllowedError);
				}
			}
			else
			{
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
