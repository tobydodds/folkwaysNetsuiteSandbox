// Case.Model.js 
// -----------------------
// Model for handling Support Cases (CRUD)
define('Case.Model', function ()
{
	'use strict';

	function validateEmail (value, name, form)
	{
		if (form.include_email && !value)
		{
			return _('Email is required').translate();
		}
	}

	return Backbone.Model.extend(
	{
		urlRoot: _.getAbsoluteUrl('services/case.ss')

	,	defaults : {
		}

	,	validation:
		{
			title: { 
				required: true
			,	msg: _('Subject is required').translate() 
			}
		
		,	message: { 
				required: true
			,	msg: _('Message is required').translate() 
			}
		
		,	reply: { 
				required: true
			,	msg: _('Reply is required').translate() 
			}
		
		,	email: {
				fn: validateEmail
			}
		}
	});
});