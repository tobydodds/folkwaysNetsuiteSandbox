/* exported service */
function service (request)
{
	'use strict';

	try
	{
		if (session.isLoggedIn())
		{
			var method = request.getMethod()
			,	id = request.getParameter('internalid')
			,	data = JSON.parse(request.getBody() || '{}')
			,	ReturnAuthorization = Application.getModel('ReturnAuthorization')
			,	permission = Application.getPermissions().transactions.tranRtnAuth;

			if (permission > 0)
			{
				switch (method)
				{
					case 'GET':
						Application.sendContent(id ? ReturnAuthorization.get(id) : ReturnAuthorization.list({
							order: request.getParameter('order')
						,	sort: request.getParameter('sort')
						,	from: request.getParameter('from')
						,	to: request.getParameter('to')
						,	page: request.getParameter('page')
						}));
					break;

					case 'PUT':
						ReturnAuthorization.update(id, data, request.getAllHeaders());
						Application.sendContent(ReturnAuthorization.get(id));
					break;

					case 'POST':
						if (permission > 1)
						{
							id = ReturnAuthorization.create(data);
							Application.sendContent(ReturnAuthorization.get(id), {'status': 201});	
						}
						else
						{
							Application.sendError(forbiddenError);
						}
					break;

					default: 
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
			Application.sendError(unauthorizedError);
		}
	}
	catch (e)
	{
		Application.sendError(e);
	}
}