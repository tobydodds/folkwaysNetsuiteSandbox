define('OrderWizard.Module.Proxy.Addresses.OPC',
	['OrderWizard.Module.Proxy', 'OrderWizard.Module.Address.Shipping', 'OrderWizard.Module.MultiShipTo.Select.Addresses.Shipping', 'OrderWizard.Module.MultiShipTo.Set.Addresses.Packages.OPC'],
	function (OrderWizardModuleProxy, SingleShippingAddress, MultiShipToShippingAddressesList, MultiShipToPackagesOPC)
{
	'use strict';

	return OrderWizardModuleProxy.extend({

		initialize: function (options)
		{
			_.extend(options, {
				showSaveButton: true //Show the save button
			});

			this.modules = [
				{
					constr: SingleShippingAddress
				,	isActive: function ()
					{
						return !this.wizard.model.get('ismultishippto') && this.commonIsActive();
					}
				}
			,	{
					constr: MultiShipToPackagesOPC
				,	options: {
						title: _('Assign shipping addresses to your items').translate()
					}
				,	isActive: function ()
					{
						return this.wizard.model.get('ismultishipto') && this.commonIsActive();
					}
				}
			,	{
					constr: MultiShipToShippingAddressesList
				,	options: {
						title: function ()
						{
							if (!this.hide_addresses)
							{
								return _('Shipping Addresses').translate();
							}
							return '';
						}
					}
				,	isActive: function ()
					{
						return this.wizard.model.get('ismultishipto') && this.commonIsActive();
					}
				,	updateEvents: 'ismultishiptoUpdated'
				}
			];

			OrderWizardModuleProxy.prototype.initialize.apply(this, arguments);
		}

	,	commonIsActive: function()
		{
			return this.wizard.checkIfShippingAddressIsRequired();
		}

	});

});