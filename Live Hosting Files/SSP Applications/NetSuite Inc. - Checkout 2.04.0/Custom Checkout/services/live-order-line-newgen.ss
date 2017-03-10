function service(request){

	'use strict';
	// Application is defined in ssp library commons.js
	try
	{

		var internalid = request.getParameter("internalid")
		,	quantity = request.getParameter("quantity")
		,	callback = request.getParameter('callback')
		,	params = request.getAllParameters()
		,	LiveOrder = Application.getModel('LiveOrder')
		,	cart_summary = {}
		,	jsonval = ''
		,	strJson = '';


		var options = {};
		for ( param in params) {
			if(param.indexOf('custcol') >= 0) options[param] = params[param];
		}

		LiveOrder.newgenAddLines([ { "internalid" : internalid, "quantity" : quantity, "options" : options } ]);

		cart_summary = LiveOrder.get() || {};

		jsonval = JSON.stringify(cart_summary);
		jsonval = jsonval.replace(/'/g, "\\'");	
		strJson = callback+'(\''+jsonval+'\');';

		Application.sendContent(strJson);
	}
	catch (e) {
		Application.sendError(e);
	}

}
