// OrderWizard.Module.Address.Billing.js
// -------------------------------------
//
define('OrderWizard.Module.Address.Billing', ['OrderWizard.Module.Address'],  function (OrderWizardModuleAddress)
{
	'use strict';

	return OrderWizardModuleAddress.extend({

		manage: 'billaddress'
	,	sameAsManage: 'shipaddress'

	,	errors: ['ERR_CHK_INCOMPLETE_ADDRESS', 'ERR_CHK_SELECT_BILLING_ADDRESS', 'ERR_CHK_INVALID_BILLING_ADDRESS', 'ERR_WS_INVALID_BILLING_ADDRESS']
	,	sameAsMessage: _('Same as shipping address').translate()

	,	selectAddressErrorMessage: {
			errorCode: 'ERR_CHK_SELECT_BILLING_ADDRESS'
		,	errorMessage: _('Please select a billing address').translate()
		}

	,	invalidAddressErrorMessage: {
			errorCode: 'ERR_CHK_INVALID_BILLING_ADDRESS'
		,	errorMessage: _('The selected billing address is invalid').translate()
		}

		// Handle the case in OPC MST where there is not addreses at all and a new one is created, if there current address form does not have any
		// data entered we shoudl re-render in order to reflect the new options (the new address created)
	,	reRenderOnFirstAddressCreation: function ()
		{
			// if the address form (the one to create a new address) is empty
			if (!this.wizard.model.get('temp' + this.manage))
			{
				this.render();
			}
		}

		// We override here to give support to guest user with Mult Shipt To. The defautl implementation will notive that the current user is guest, and will select the first entered address
		// to be used in the inline address form
	,	getIsCurrentUserGuest: function ()
		{
			if (this.wizard.model.get('ismultishipto')) {
				return false;
			}

			return OrderWizardModuleAddress.prototype.getIsCurrentUserGuest.apply(this, arguments);
		}

		// Attach to extra events
	,	onEventHandlersOn: function ()
		{
			//In OPC is require to re-render when changing between SST and MST to hide or show the same as checkbox
			this.wizard.model.on('ismultishiptoUpdated', function ()
			{
				this.sameAs = false;
				this.render();
			}, this);

			this.wizard.model.on('address_added', this.reRenderOnFirstAddressCreation, this); // This event is triggered by MST.Select.Addresses.Shipping module
		}

		// Override the address removal control to take into account Multi Ship To scenario
	,	isAddressIdValidForRemoval: function (address_id)
		{
			if (!this.wizard.model.get('ismultishipto'))
			{
				return OrderWizardModuleAddress.prototype.isAddressIdValidForRemoval.apply(this, arguments);
			}

			return !_.find(this.wizard.model.getSetLines(), function (line)
			{
				return +line.get('shipaddress') === +address_id;
			});
		}

		// Dettach from extra added event handlers
	,	onEventHandlersOff: function ()
		{
			this.wizard.model.off('ismultishiptoUpdated', null, this);
			this.wizard.model.off('address_added', null, this);
		}
	});
});
