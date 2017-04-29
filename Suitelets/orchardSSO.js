function buildSuitelet(request, response)
{
	if (request.getMethod() == 'GET')
	{
		var url = nlapiOutboundSSO('customsso_orchard');
		response.writeLine(url);
	}
}