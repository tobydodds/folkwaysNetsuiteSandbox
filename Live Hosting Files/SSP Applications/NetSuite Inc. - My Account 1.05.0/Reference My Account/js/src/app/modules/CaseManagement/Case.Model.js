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

	function validateLength (value, name)
	{
		var max_length = 4000;

		if (value && value.length > max_length)
		{
			return _('$(0) must be at most $(1) characters').translate(name, max_length);
		}
	}

	function validateMessage (value, name)
	{
		if (!value)
		{
			return _('$(0) is required').translate(name);
		}

		return validateLength(value, name);
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
				fn: validateMessage
			}
		
		,	reply: { 
				fn: validateMessage
			}
		
		,	email: {
				fn: validateEmail
			}
		}
	});
});