// OrderWizard.Module.MultiShipTo.Set.Addresses.Packages.js
// --------------------------------------
//
define('OrderWizard.Module.MultiShipTo.NonShippableItems', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend(
	{
		template: 'order_wizard_msr_non_shippable_items_module'

	,	initialize: function ()
		{
			WizardModule.prototype.initialize.apply(this, arguments);
			this.wizard.model.on('ismultishiptoUpdated', this.render, this);
		}

		// Returns the list of non shippable items/lines
	,	getLinesNotShippable: function ()
		{
			return this.wizard.model.getNonShippableLines();
		}

	,	isActive: function()
		{
			return this.wizard.model.get('ismultishipto');
		}

	,	render: function ()
		{
			if (this.isActive())
			{
				this._render();
			}
			else
			{
				this.$el.empty();
			}
		}
	});
});