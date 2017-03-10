// CreditCard.Views.js
// -----------------------
// Views for handling addresses (CRUD)
define('Address.Views', function ()
{
	'use strict';

	var Views = {};

	// Address details view/edit
	Views.Details = Backbone.View.extend({

		template: 'address'

	,	attributes: {'class': 'AddressDetailsView'}

	,	events: {
			'submit form': 'saveForm'

		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'

		,	'change select[data-type="country"]': 'updateStates'
		,	'change select[data-type="state"]': 'eraseZip'
		,	'change input[data-type="state"]': 'eraseZip'
		,	'blur input[data-type="phone"]': 'formatPhone'
		}

	,	initialize: function ()
		{
			this.title = this.model.isNew() ? _('Add New Address').translate() : _('Update Address').translate();
			this.page_header = this.title;
		}

	,	showContent: function (path, label)
		{
			label = label || path;
			this.options.application.getLayout().showContent(this, label, { text: this.title, href: '/' + path });
			this.$('[rel="tooltip"]').tooltip({
				placement: 'right'
			}).on('hide', function (e)
			{
				e.preventDefault();
				jQuery(e.target).next('.tooltip').hide();
			});
		}

	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent('addressbook');
		}

		// Will try to reformat a phone number for a given phone Format,
		// If no format is given, it will try to use the one in site settings.
	,	formatPhone: function (e)
		{
			var $target = jQuery(e.target);
			$target.val(_($target.val()).formatPhone());
		}

	,	eraseZip: function (e)
		{
			var elem;
			if (e && e.target)
			{
				// For OPC, there are many data-type=zip so grab the first in the current fieldset
				var zip = jQuery(e.target).closest('fieldset').find('input[data-type="zip"]');
				if (zip.length > 0)
				{
					elem = jQuery(zip[0]);
				}
			}
			if (!elem)
			{
				elem = jQuery('input[data-type="zip"]');
			}
			elem.val('');
		}

		// initialize states dropdown
	,	updateStates: function (e)
		{
			this.$('[data-type="state"]').closest('.control-group').empty().append(
				SC.macros.statesDropdown({
					countries: this.options.application.getConfig('siteSettings.countries')
				,	selectedCountry: this.$(e.target).val()
				,	manage: this.options.manage ? this.options.manage + '-' : ''
				})
			);
			this.eraseZip(e);
		}
	});

	// List profile's addresses
	Views.List = Backbone.View.extend({

		template: 'address_book'
	,	page_header: _('Address Book').translate()
	,	title: _('Address Book').translate()
	,	attributes: { 'class': 'AddressListView' }
	,	events: { 'click [data-action="remove"]': 'remove' }

	,	initialize: function ()
		{
			//only enable "default" functionality in myaccount
			this.options.showDefaults = this.options.application.getConfig('currentTouchpoint') === 'customercenter';
		}

	,	showContent: function (path, label)
		{
			label = label || path;
			this.options.application.getLayout().showContent(this, label, { text: this.title, href: '/' + path });
		}

		// remove address
	,	remove: function (e)
		{
			e.preventDefault();

			if (confirm(_('Are you sure you want to delete this address?').translate()))
			{
				this.removeAddressModel(jQuery(e.target).data('id'));
			}
		}

	,	removeAddressModel: function (address_id)
		{
			this.collection.get(address_id).destroy({ wait: true });
		}
	});

	return Views;
});