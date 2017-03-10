define('OrderWizard.Module.Proxy.Addresses',
	['OrderWizard.Module.Proxy', 'OrderWizard.Module.Address.Shipping', 'OrderWizard.Module.MultiShipTo.Select.Addresses.Shipping', 'OrderWizard.Module.MultiShipTo.Packages', 'OrderWizard.Module.MultiShipTo.Set.Addresses.Packages', 'OrderWizard.Module.MultiShipTo.NonShippableItems'],
	function (OrderWizardModuleProxy, SingleShippingAddress, MultiShipToShippingAddressesList, MultiShipToPackages, MultiShipToAddresesPackages, NonShippableItemList)
{
	'use strict';

	return OrderWizardModuleProxy.extend({

		initialize: function (options)
		{
			_.extend(options, {
				showSaveButton: true
			});

			var mst_address_list = {
					constr: MultiShipToShippingAddressesList
				,	instance: null
				,	isActive: function (state)
					{
						return state && state.urlOptions === 'state=selectAddress' && this.wizard.model.get('ismultishipto') && this.commonIsActive();
					}
				,	isReady: function ()
					{
						// It is importnat to call this method here to recalculate if showing the address list is mandatory, because it can happend that all address get removed in a future step
						this.evaluateAddressesListMandatory();
						return !this.is_editing_addresses && !this.isMultShipToAddressListMandatory;
					}
				,	updateEvents: 'ismultishiptoUpdated'
				}
			,	mst_address_packages = {
					constr: MultiShipToAddresesPackages //This modules is the one that creates each shipment
				,	instance: null
				,	isActive: function (state)
					{
						return state && state.urlOptions === 'state=packages' && this.wizard.model.get('ismultishipto') && this.commonIsActive();
					}
				};

			this.mstAddressList = mst_address_list;
			this.modules = [
				{
					constr: SingleShippingAddress
				,	instance: null
				,	isActive: function (state)
					{
						return state && state.urlOptions === 'state=selectAddress' && !this.wizard.model.get('ismultishipto') && this.commonIsActive();
					}
				}
			,	mst_address_list
			,	mst_address_packages
			,	{
					constr: MultiShipToPackages
				,	instance: null
				,	isActive: function (state)
					{
						return state && state.urlOptions === 'state=packages' && this.wizard.model.get('ismultishipto') && this.commonIsActive();
					}
				}
			,	{
					constr: NonShippableItemList
				,	instance: null
				,	isActive: function (state)
					{
						return state && state.urlOptions === 'state=packages' && this.wizard.model.get('ismultishipto') && this.commonIsActive();
					}
				}
			];

			this.states = [
				{
					urlOptions: 'state=selectAddress'
				}
			,	{
					urlOptions: 'state=packages'
				}
			];

			this.is_editing_addresses = false;

			//When the user change the status of multi ship to, navigate to the first page
			this.options.wizard.model.on('ismultishiptoUpdated', function ()
			{
				this.evaluateAddressesListMandatory();
				this.state_index = 0;
				Backbone.history.navigate(this.getURLForState(0), {trigger: false});
			}, this);

			OrderWizardModuleProxy.prototype.initialize.apply(this, arguments);

			// Handle the 'Edit Addresses' link
			mst_address_packages.instance.on('navigate-edit-addresses-checkout', function ()
			{
				this.state_index = 0;
				this.is_editing_addresses = true;
				this.setStepName();
				Backbone.history.navigate(this.getURLForState(0), {trigger: true});
			}, this);

			// Determine if the addresses list step is optional or not
			this.wizard.options.profile.get('addresses').once('reset', function ()
			{
				this.evaluateAddressesListMandatory();
			}, this);
		}

		//Indicated if,the common to all sub modules conditions, are met
	,	commonIsActive: function ()
		{
			return this.wizard.checkIfShippingAddressIsRequired();
		}

	,	setStepName: function ()
		{
			this.options.step.name = this.state_index === 0 ?
						_('Shipping Address').translate() :
						_('Set Shipments').translate();

			this.trigger('update_step_name');
		}

	,	navigateToState: function ()
		{
			this.setStepName();
			OrderWizardModuleProxy.prototype.navigateToState.apply(this, arguments);
		}

	,	evaluateAddressesListMandatory: function ()
		{
			this.isMultShipToAddressListMandatory = !this.mstAddressList.instance.hasEnoughtSkipAddresses();
		}

		// Override the default Proxy Render to control the baack button visibility and when the editing address is being shown
	,	render: function ()
		{
			OrderWizardModuleProxy.prototype.render.apply(this, arguments);
			if (this.state_index === 1 && !this.isMultShipToAddressListMandatory)
			{
				this.trigger('change_visible_back', false);
			}
			if (this.state_index === 0 && this.is_editing_addresses)
			{
				this.is_editing_addresses = false;
			}
		}

	,	cancel: function ()
		{
			if (this.state_index === 1)
			{
				this.is_editing_addresses = true;
			}
			OrderWizardModuleProxy.prototype.cancel.apply(this, arguments);
		}

	,	onPageRefresh: function ()
		{
			this.evaluateAddressesListMandatory();
		}
	});

});