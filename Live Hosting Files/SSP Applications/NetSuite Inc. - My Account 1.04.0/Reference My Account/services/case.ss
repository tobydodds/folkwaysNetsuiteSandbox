/*exported service*/
// case.ss
// ----------------
// Service to manage support cases
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		if (session.isLoggedIn())
		{
			var method = request.getMethod()
			,	data = JSON.parse(request.getBody() || '{}')
			,	id = request.getParameter('internalid') || data.internalid
			,	Case = Application.getModel('Case')
			,	customerId = nlapiGetUser() + '';

			switch (method)
			{
				case 'GET':
					if (id)
					{
						Application.sendContent(Case.get(id));
					}
					else
					{

						var list_header_data = {
							filter: request.getParameter('filter')
						,   order: request.getParameter('order')
	                    ,   sort: request.getParameter('sort')
	                    ,   from: request.getParameter('from')
	                    ,   to: request.getParameter('to')
	                    ,   page: request.getParameter('page')
						};

						Application.sendContent(Case.search(customerId, list_header_data));
					}
				break;

				case 'POST':
					var new_case_id = Case.create(customerId, data);

					Application.sendContent(Case.get(new_case_id));
				break;

				case 'PUT':
					Case.update(id, data);
					Application.sendContent(Case.get(id));
				break;

				default: 
					// methodNotAllowedError is defined in ssp library commons.js
					Application.sendError(methodNotAllowedError);
			}
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