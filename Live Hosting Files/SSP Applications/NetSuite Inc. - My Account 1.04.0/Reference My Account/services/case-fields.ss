/*exported service*/
// case-fields.ss
// ----------------
// Service to manage support case fields
function service (request)
{
	'use strict';

	// Application is defined in ssp library commons.js
	try
	{
		if (session.isLoggedIn())
		{
			switch (request.getMethod())
			{
				case 'GET':
					var Case = Application.getModel('Case');
					
					Application.sendContent(Case.getNew());				
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