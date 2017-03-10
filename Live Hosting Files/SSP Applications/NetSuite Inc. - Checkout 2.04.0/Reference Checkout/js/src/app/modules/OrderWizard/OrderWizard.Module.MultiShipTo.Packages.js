// OrderWizard.Module.MultiShipTo.Shipmethod.js
// --------------------------------------
//
define('OrderWizard.Module.MultiShipTo.Packages', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend(
	{
		template: 'order_wizard_msr_packages_module'

	,	events: {
			'click [data-action="remove-item"]': 'removeItemHandle'
		,	'click [data-action="items-expander"]': 'expandCollapsePackage'
		}

	,	initialize: function ()
		{
			WizardModule.prototype.initialize.apply(this, arguments);
			this.wizard.model.on('multishipto-address-applied', _.bind(this.render, this));
			this.expanded_packages = [];
		}

		// Return the array of line set with the same adddress id
	,	getLinesForAddressId: function (address_id)
		{
			return this.wizard.model.get('lines').groupBy(function (line)
					{
						return line.get('shipaddress');
					})[address_id];
		}

		// Conserve the state (expanded/collpased) of each package when re-rendering
	,	expandCollapsePackage: function (e)
		{
			var package_id = jQuery(e.target).closest('[data-address-id]').data('address-id');
			!~this.expanded_packages.indexOf(package_id) ?
				this.expanded_packages.push(package_id) :
				this.expanded_packages.splice(this.expanded_packages.indexOf(package_id), 1);
		}

		// Handle the remove click event, and delegate the real logic to the father view
	,	removeItemHandle: function (e)
		{
			this.clearGeneralMessages();
			var $selected_button = jQuery(e.target)
			,	selected_item_id = $selected_button.data('item-id');

			this.removeItem(selected_item_id);
		}

		// Mange the action of removing an item from a package, which means unset the shipaddress property of the item
	,	removeItem: function (item_id)
		{
			var self = this
			,	model = this.wizard.model
			,	selected_item = model.get('lines').get(item_id)
			,	package_address_id = selected_item.get('shipaddress');

			selected_item.unset('shipaddress');

			model.save().
				then(function ()
				{
					if (!self.getLinesForAddressId(package_address_id))
					{
						self.wizard.options.profile.get('addresses').get(package_address_id).set('check', false);
						self.expanded_packages.splice(self.expanded_packages.indexOf(+package_address_id), 1);
						self.showGeneralMessage(_('Shipment has no more items').translate(), false);
					}
					self.render();
					model.trigger('multishipto-line-updated');
				});
		}

		// Returns the lists of packages (items grouped by address) created
	,	getPackages: function ()
		{
			var result = []
			,	items_with_address = _.filter(this.wizard.model.getShippableLines(), function (line)
				{
					return !!line.get('shipaddress');
				})
			,	items_per_address = _.groupBy(items_with_address, function (line)
				{
					return line.get('shipaddress');
				})
			,	addresses = this.wizard.options.profile.get('addresses')
			,	shipping_methods = this.wizard.model.get('multishipmethods');

			_.each(_.keys(items_per_address), function (address_id)
			{
				result.push({
					lines: items_per_address[address_id]
				,	address: addresses.get(address_id)
				,	deliveryMethods: shipping_methods[address_id]
				});
			});
			return result;
		}
	});
});