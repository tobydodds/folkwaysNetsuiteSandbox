// OrderWizard.Module.MultiShipTo.Select.Addresses.Shipping.js
// --------------------------------------
//
define('OrderWizard.Module.MultiShipTo.Select.Addresses.Shipping', ['OrderWizard.Module.Address', 'Address.Collection'],  function (OrderWizardModuleAddress,  AddressCollection)
{
	'use strict';

	return OrderWizardModuleAddress.extend({

		template: 'order_wizard_msr_addresses_module'

	,	manage: 'shipaddress'
	,	sameAsManage: 'billaddress'
	,	isSameAsEnabled: false

	,	atLeastTwoValidAddressesErrorMessage: {
			errorMessage: _('You need at least 2 valid shipping addresses').translate()
		,	errorCode: 'ERR_MST_MIN_ADDRESSES'
		}

	,	errors: ['ERR_CHK_INCOMPLETE_ADDRESS', 'ERR_CHK_INVALID_ADDRESS', 'NOT_ERR_SAVE_ADDR', 'ERR_MST_MIN_ADDRESSES']

	,	saveAddressFakeErrorMessage: {
			errorCode: 'NOT_ERR_SAVE_ADDR'
		}

	,	newEvents: {
			'click [data-type="add-edit-addreses-link"]' : 'showAllAddresses'
		}

		// We orride this method in order to mark as check each address that is already checkd (from backend)
	,	initialize: function ()
		{
			_.extend(this.events, this.newEvents);
			OrderWizardModuleAddress.prototype.initialize.apply(this, arguments);

			var self = this;

			//When by options is specified that when there are enough valid addresses only show a link, this flag control if render addresses or not
			self.hide_addresses = true;

			self.showSaveButton = self.options.showSaveButton;

			self.wizard.options.profile.get('addresses').once('reset', function ()
			{
				self.hide_addresses = self.hasEnoughValidAddresses();
			});

			self.wizard.options.profile.get('addresses')
				.on('destroy remove', function (model)
				{
					_.each(self.wizard.model.get('lines').where({shipaddress: model.id}), function (line)
					{
						line.unset('shipaddress');
						line.unset('shipmethod');
					});
				});

			self.atLeastTwoValidAddressesErrorMessage.errorMessage = _('You need at least $(0) valid shipping addresses').translate(this.minValidAddressesQuantity);
		}

		//As we always want to render the complete list of addresses we never set one address
	,	setAddress: jQuery.noop

		// In the case of Multi Ship To we need to return false to support adding multiple addresses with a inline form without generating duplicated values
		// IF guest user are not supported in Multi Ship To, this should be controlled in the OrderWizard.Module.MultiShipto.EnableLink.js
	,	getIsCurrentUserGuest: function ()
		{
			return false;
		}

		// When there is no address created at all, and a new one is made this method is called by super with the id if the new address created
	,	newAddressCreated: function (id, add_options)
		{
			this.trigger('change_enable_continue', true);
			if (!add_options || add_options.silent) //This occur on guest or when the first address is created (no previous address exists)
			{
				//This event is fire in order to update/notify the MST.Addresses.Packages Module to re-render itself
				// and Address.Billing to show the new addresses created
				this.wizard.model.trigger('address_added');
			}
		}

		// In OPC expand all this module in case it's collapsed in one link
	,	showAllAddresses: function (e)
		{
			e.preventDefault();
			this.hide_addresses = false;
			this.render();
		}

	,	render: function ()
		{
			jQuery('.wizard-content .alert-error').hide();
			OrderWizardModuleAddress.prototype.render.apply(this, arguments);

			if (!this.hasEnoughValidAddresses())
			{
				this.$('[data-type="alert-placeholder-module"]').html(
					SC.macros.message(_('Please, set up $(0) or more shipping addresses').translate(this.minValidAddressesQuantity), 'info', true)
				);

				this.createAddressDetailsView();
			}
			//this.trigger('change_enable_continue', !this.addressView, {onlyContinue: true, notDisableTouchs: true});
		}

		// Save the current model
	,	submit: function ()
		{
			jQuery('.wizard-content .alert-error').hide();

			this.$('.multishipto-save-address-btn').attr('disabled', true);

			var super_result = OrderWizardModuleAddress.prototype.submit.apply(this, arguments)
			,	self = this
			,	result = jQuery.Deferred();

			super_result.always(function(){
				self.$('.multishipto-save-address-btn').attr('disabled', false);
			});

			if (this.addressView)
			{
				super_result.then(function ()
					{
						result.reject(self.saveAddressFakeErrorMessage);
					}, result.reject);

				return result;
			}

			return super_result;
		}

		// Returns the list of valid addresses
	,	getValidAddreses: function ()
		{
			return new AddressCollection(this.wizard.options.profile.get('addresses').where({isvalid: 'T'}));
		}

	,	minValidAddressesQuantity: 1

	,	minSkipAddressesQuantity: 2

		// Determines if the quantity of valid addresses is enough to skip this module, used by the proxy to not show this step
	,	hasEnoughtSkipAddresses: function ()
		{
			return this.wizard.options.profile.get('addresses').where({isvalid:'T'}).length >= this.minSkipAddressesQuantity;
		}

		// Determines if the quantity of valid addresses is enough to validate this module
	,	hasEnoughValidAddresses: function ()
		{
			return this.wizard.options.profile.get('addresses').where({isvalid:'T'}).length >= this.minValidAddressesQuantity;
		}

		// This module will be valid only if MSR is NOT enable OR at least one address is valid and selected
	,	isValid: function ()
		{
			if (!this.wizard.model.get('ismultishipto') || this.hasEnoughValidAddresses())
			{
				return jQuery.Deferred().resolve();
			}

			return jQuery.Deferred().reject(this.atLeastTwoValidAddressesErrorMessage);
		}

		// Handle the fake error throw by the Save method
	,	manageError: function (error)
		{
			if (error && error.errorCode !== 'NOT_ERR_SAVE_ADDR')
			{
				OrderWizardModuleAddress.prototype.manageError.apply(this, arguments);
			}
		}

	});
});