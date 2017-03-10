// OrderWizard.Module.MultiShipTo.Set.Addresses.Packages.js
// --------------------------------------
//
define('OrderWizard.Module.MultiShipTo.Set.Addresses.Packages.OPC', ['Wizard.Module', 'Address.Collection'], function (WizardModule, AddressColection)
{
	'use strict';

	return WizardModule.extend(
	{
		template: 'order_wizard_msr_set_address_packages_opc_module'

	,	events: {
			'change [data-type="set-shipments-address-selector"]' : 'setAddress'
		,	'click [data-type="edit-addresses"]' : 'navigateToEditAddresses'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = this.options.application = options.wizard.application;

			WizardModule.prototype.initialize.apply(this, arguments);
			this.wizard.options.profile.get('addresses').on('reset destroy change add', _.bind(this.render, this));
			//This event is trigger when an address is silently by the address module
			this.wizard.model.on('address_added', _.bind(this.render, this));
		}

	,	render: function()
		{
			if (this.isActive())
			{
				var lines = this.getShippableLines()
				,	lines_have_changes = false
				,	default_address = this.getDefaultAddresses();

				if (default_address && lines.length)
				{
					_.each(lines, function (line)
					{
						if (!line.get('shipaddress'))
						{
							lines_have_changes = true;
							line.set('shipaddress', default_address.id);
						}
					});
					// Notify that lines changes. This is used to update Packages (delivery methods) module
					lines_have_changes && this.model.trigger('changelines');
				}
				else
				{
					//We trigger this event in case that all address were removed
					this.model.trigger('changelines');
				}

				WizardModule.prototype.render.apply(this, arguments);
			}
		}

		// Determines if the current module is valid to be shown and operate with
	,	isActive: function ()
		{
			return this.wizard.application.getConfig('siteSettings.isMultiShippingRoutesEnabled', false) && this.wizard.model.get('ismultishipto');
		}

		// Handle the click over edit address link. Which trigger an event that is handle by the address proxy
	,	navigateToEditAddresses: function (e)
		{
			e.preventDefault();
			this.trigger('navigate-edit-addresses-checkout');
		}

		// Returns the list of all valid addresses
	,	getValidAddresses: function ()
		{
			return new AddressColection(this.wizard.options.profile.get('addresses').where({isvalid: 'T'}));
		}

		// Returns the default address, used when the module is rendered for the first time
	,	getDefaultAddresses: function ()
		{
			var addresses = this.getValidAddresses();
			return addresses.length && (addresses.findWhere({defaultshipping: 'T'}) || addresses.first());
		}

		// Returns the order's lines that are enabled to ship
	,	getShippableLines: function ()
		{
			return this.wizard.model.getShippableLines();
		}

		// Returns the order's lines that are enabled to ship
	,	getLinesNotShippable: function ()
		{
			return this.wizard.model.getNonShippableLines();
		}

		// Apply for all selected lines the current address
	,	setAddress: function (e)
		{
			var self = this
			,	$target = jQuery(e.target)
			,	line_id = $target.data('line-id')
			,	address_id = $target.val()
			,	line = this.wizard.model.get('lines').findWhere({internalid: line_id});

			line.set('shipaddress', address_id);

			this.model.save().done(function(){
				self._render();
			});
		}
	});
});