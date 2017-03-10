// Address.Model.js
// -----------------------
// Model for handling addresses (CRUD)
define('Address.Model', function ()
{
	'use strict';

	function isCompanyRequired()
	{
		return	SC.ENVIRONMENT.siteSettings &&
				SC.ENVIRONMENT.siteSettings.registration &&
				SC.ENVIRONMENT.siteSettings.registration.companyfieldmandatory === 'T';
	}

	return Backbone.Model.extend(
	{
		urlRoot: 'services/address.ss'

	,	validation: {
			fullname: { required: true, msg: _('Full Name is required').translate() }
		,	addr1: { required: true, msg: _('Address is required').translate() }
		,	company: { required: isCompanyRequired(), msg: _('Company is required').translate() }
		,	country: { required: true, msg: _('Country is required').translate() }
		,	state: { fn: _.validateState }
		,	city: { required: true, msg: _('City is required').translate() }
		,	zip: { fn: _.validateZipCode }
		,	phone: { fn: _.validatePhone }
		}

		// Returns an array of localized attributes that are invalid for the current address
	,	getInvalidAttributes: function ()
		{
			//As this model is not always used inside a model's view, we need to check that the validation is attached
			var attributes_to_validate = _.keys(this.validation)
			,	attribute_name
			,	invalid_attributes = [];

			this.get('isvalid') !== 'T' && this.isValid(true) && _.extend(this, Backbone.Validation.mixin);

			_.each(attributes_to_validate, function (attribute)
			{
				if (!this.isValid(attribute))
				{
					switch (attribute)
					{
						case 'fullname':
							attribute_name = _('Full Name').translate();
							break;
						case 'addr1':
							attribute_name = _('Address').translate();
							break;
						case 'city':
							attribute_name = _('City').translate();
							break;
						case 'zip':
							attribute_name = _('Zip Code').translate();
							break;
						case 'country':
							attribute_name = _('Country').translate();
							break;
						case 'phone':
							attribute_name = _('Phone Number').translate();
							break;
					}
					invalid_attributes.push(attribute_name);
				}
			},this);

			return invalid_attributes;
		}

	});
});
