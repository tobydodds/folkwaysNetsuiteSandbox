define('OrderWizard.Module.Proxy.ShowShipments',
	['OrderWizard.Module.Proxy', 'OrderWizard.Module.ShowShipments', 'OrderWizard.Module.MultiShipTo.Shipmethod', 'OrderWizard.Module.MultiShipTo.NonShippableItems'],
	function (OrderWizardModuleProxy, ShowShipmentSigleAddress, ShipmethodMultiShipTo, NonShippableItemList)
{
	'use strict';

	return OrderWizardModuleProxy.extend({

		initialize: function ()
		{
			this.modules = [
				{
					constr: ShowShipmentSigleAddress
				,	isActive: function ()
					{
						return !this.wizard.model.get('ismultishipto');
					}
				,	updateEvents: 'ismultishiptoUpdated'
				}
			,	{
					constr: NonShippableItemList
				,	isActive: function ()
					{
						return this.wizard.model.get('ismultishipto');
					}
				}
			,	{
					constr: ShipmethodMultiShipTo
				,	isActive: function ()
					{
						return this.wizard.model.get('ismultishipto');
					}
				}
			];

			OrderWizardModuleProxy.prototype.initialize.apply(this, arguments);
		}
	});
});