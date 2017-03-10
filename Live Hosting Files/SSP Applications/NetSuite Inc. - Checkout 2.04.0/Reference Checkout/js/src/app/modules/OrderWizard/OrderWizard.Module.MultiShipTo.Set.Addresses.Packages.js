// OrderWizard.Module.MultiShipTo.Set.Addresses.Packages.js
// --------------------------------------
//
define('OrderWizard.Module.MultiShipTo.Set.Addresses.Packages', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend(
	{
		template: 'order_wizard_msr_set_address_packages_module'

	,	allItemShouldBelongToAPackage: {
			errorMessage: _('Some of your items are not assgined to a shipping address. Please, go back to shipping step.').translate()
		,	errorCode: 'ERR_MST_ITEM_WITHOUT_PACKAGE'
		}

	,	errors: ['ERR_MST_ITEM_WITHOUT_PACKAGE']

	,	events: {
			'click [data-action="select-unselected-item"]' : 'selectLine'
		,	'click [data-action="split-quantity"]' : 'updateLineQuantity'
		,	'blur [data-action="split-quantity"]' : 'validateLineQuantity'
		,	'keyup [data-action="split-quantity"]' : 'updateLineQuantity'
		,	'change [data-type="set-shipments-address-selector"]' : 'setSelectedAddressId'
		,	'click [data-type="select-unselect-all"]': 'selectUnselectAll'
		,	'click [data-type="edit-addresses"]' : 'navigateToEdtiAddresses'
		,	'click [data-type="create-shipments"]' : 'applyCurrentAddress'
		}

	,	initialize: function (options)
		{
			this.options = options;
			WizardModule.prototype.initialize.apply(this, arguments);

			var self = this;
			this.selected_address_id = null;
			this.createShipmentLabel = '';
			this.createShipmentEnabled = false;

			this.wizard.model.on('multishipto-line-updated', function ()
				{
					self.selected_address_id = self.getFirstAddressIdWithoutShipments();
					self.render();
				});

			self.wizard.options.profile.get('addresses').once('reset', function ()
				{
					self.selected_address_id = self.getFirstAddressIdWithoutShipments();
				});
		}

		// Validates that the set item quantity is a valid number
	,	validateLineQuantity: function (e)
		{
			var $line = jQuery(e.target)
			,	new_quantity = parseInt($line.val(), 10)
			,	item_id = $line.data('item-id')
			,	line = this.wizard.model.get('lines').get(item_id);

			if (isNaN(new_quantity) || new_quantity > line.get('quantity') || new_quantity < 1)
			{
				line.unset('splitquantity');
				$line.addClass('quantity-error');
				$line.val(line.get('quantity'));
			}
			else
			{
				$line.val(new_quantity);
			}
		}

		// Set the quantity of items that will take part of the new package for the selectec item
	,	updateLineQuantity: function (e)
		{
			e.stopPropagation();
			e.preventDefault();

			var $line = jQuery(e.target)
			,	new_quantity = parseInt($line.val(), 10)
			,	item_id = $line.data('item-id')
			,	line = this.wizard.model.get('lines').get(item_id);

			if (isNaN(new_quantity))
			{
				line.unset('splitquantity');
				$line.addClass('quantity-error');
			}
			else
			{
				$line.removeClass('quantity-error');
				if (line.get('quantity') !== new_quantity)
				{
					line.set('splitquantity', new_quantity);
				}
				else
				{
					line.unset('splitquantity');
				}
			}
		}

		// Returns the first address id without a shipment associated to it
	,	getFirstAddressIdWithoutShipments: function ()
		{
			var set_lines = this.wizard.model.getSetLines()
			,	addresses = this.getValidAddresses()
			,	default_shipping_address = _.find(addresses, function (address) { return address.get('defaultshipping') === 'T'; })
			,	is_default_shipping_address_valid
			,	selected_address = _.find(addresses, function (address)
				{
					return !_.find(set_lines, function (line)
					{
						return line.get('shipaddress') === address.id;
					});
				});

			if (default_shipping_address)
			{
				is_default_shipping_address_valid = !_.find(set_lines, function (line)
				{
					return line.get('shipaddress') === default_shipping_address.id;
				});

				if (is_default_shipping_address_valid)
				{
					return default_shipping_address.id;
				}
			}

			return selected_address ?
					selected_address.id :
					addresses && addresses.length ? _.first(addresses).id : null;
		}

		// Handle the click over edit address link. Which trigger an event that is handle by the address proxy
	,	navigateToEdtiAddresses: function (e)
		{
			e.preventDefault();
			this.trigger('navigate-edit-addresses-checkout');
		}

		// Manage the selection or unselection of all items
	,	selectUnselectAll: function ()
		{
			var unset_lines = this.wizard.model.getUnsetLines()
			,	check_lines = _.filter(unset_lines, function (line)
				{
					return line.get('check');
				});

			check_lines.length === unset_lines.length ?
				this.unselectAllItems() :
				this.selectAllItems();

			this.render();
		}

		// Returns the count of items selected
	,	getSelectedItemsLength: function ()
		{
			return _.filter(this.wizard.model.getUnsetLines(), function (line)
			{
				return line.get('check');
			}).length;
		}

		// Select all items
	,	selectAllItems: function ()
		{
			_.each(this.wizard.model.getUnsetLines(), function (line)
			{
				line.set('check', true);
			});
		}

		// Unselect all items
	,	unselectAllItems: function ()
		{
			_.each(this.wizard.model.getUnsetLines(), function (line)
			{
				line.set('check', false);
				line.unset('splitquantity');
			});
		}

		// Returns the list of addreses available to be part of Multi Ship To
	,	getValidAddresses: function ()
		{
			return this.wizard.options.profile.get('addresses').where({isvalid: 'T'});
		}

		// Override Render in order to update Continue and back buttons
	,	render: function ()
		{
			this.updateContinueButtonState();
			WizardModule.prototype.render.apply(this, arguments);
		}

		// Returns the current address id. Used when the page is re-render to avoid lossing the selected address in the combobox
	,	getSelectedAddressId: function ()
		{
			if (!this.selected_address_id)
			{
				this.selected_address_id = this.getFirstAddressIdWithoutShipments();
			}
			return this.selected_address_id;
		}

		// Set the selected address to retrieved it later
	,	setSelectedAddressId: function (e)
		{
			this.selected_address_id = jQuery(e.target).val();
			this.render();
		}

		// Select and unselect an item
	,	selectLine: function (e)
		{
			var marked_line_id = jQuery(e.target).closest('[data-action="select-unselected-item"]').data('id')
			,	selected_line = this.wizard.model.get('lines').get(marked_line_id);

			selected_line.set('check', !selected_line.get('check'));

			if (!selected_line.get('check'))
			{
				selected_line.unset('splitquantity');
			}
			this.render();
		}

		// Determiens if the passed in address id has already created at one shipment
	,	addressHasShipments: function (address_id)
		{
			return !!_.find(this.wizard.model.getShippableLines(), function (item)
			{
				return item.get('shipaddress') === address_id;
			});
		}

		// Update Continue button, enable/disable and change its label
	,	updateContinueButtonState: function ()
		{
			var unapplied_items_length = this.wizard.model.getUnsetLines().length
			,	selected_items_length = this.wizard.model.get('lines').filter(function(line) { return !!line.get('check'); }).length
			,	selected_address_id = jQuery('[data-type="set-shipments-address-selector"]').val()
			,	continue_enabled;

			continue_enabled = _.all(this.wizard.model.getShippableLines(), function (item)
			{
				return !!item.get('shipaddress');
			});

			this.createShipmentEnabled = !(unapplied_items_length > 0 && selected_items_length <= 0);

			if (selected_items_length > 0 && this.addressHasShipments(selected_address_id))
			{
				this.createShipmentLabel = _('Add to Shipment').translate();
			}
			else
			{
				this.createShipmentLabel = _('Create Shipment').translate();
			}

			this.trigger('change_enable_continue', continue_enabled, {onlyContinue: true, notDisableTouchs: true});
		}

	,	isValid: function ()
		{
			return this.wizard.model.getUnsetLines().length ?
				jQuery.Deferred().reject(this.allItemShouldBelongToAPackage) :
				jQuery.Deferred().resolve();
		}

	,	restoreModelBeforeApplyAddress: function()
		{
			var self = this;
			_.each(this.linesBeforeApplyAddress, function(value,id){

					var line = self.wizard.model.get('lines').findWhere({internalid:id});
					line.set('shipaddress', value.shipaddress);
					line.set('check', value.check);
			});
		}

		// Apply for all selected lines the current address
	,	applyCurrentAddress: function ()
		{
			this.clearGeneralMessages();
			var selected_address_id = jQuery('[data-type="set-shipments-address-selector"]').val()
			,	self = this
			,	selected_items_length = this.wizard.model.get('lines').filter(function(line) { return !!line.get('check'); }).length
			,	selected_address = this.wizard.options.profile.get('addresses').get(selected_address_id)
			,	item_for_address = this.wizard.model.get('lines').groupBy(function (line)
				{
					return line.get('shipaddress');
				})[selected_address_id]
			,	result
			,	notify_success_message = function ()
				{
					var message = selected_items_length > 1 ?
						_('$(0) items was added to Shipment: $(1)').translate(selected_items_length, selected_address.get('fullname')) :
						_('$(0) item was added to Shipment: $(1)').translate(selected_items_length, selected_address.get('fullname'));

					self.showGeneralMessage(message, false);
				};

			if (selected_address_id && selected_address)
			{
				if (!selected_address.get('check'))
				{
					selected_address.set('check', true);
					this.wizard.model.get('addresses').add(selected_address);
				}

				this.linesBeforeApplyAddress = {};

				_.each(this.wizard.model.get('lines').where({check: true}), function (line)
				{
					self.linesBeforeApplyAddress[line.id] = {
						shipaddress: line.get('shipaddress')
					,	check: line.get('check')
					};
					line.set('shipaddress', selected_address_id);
					line.set('check', false);
				});

				result = this.wizard.model.save()
							.fail(function(){
								self.restoreModelBeforeApplyAddress();
							})
							.then(function ()
								{
									self.selected_address_id = self.getFirstAddressIdWithoutShipments();
								})
							.then(function ()
								{
									self.wizard.model.trigger('multishipto-address-applied');
								})
							.then(_.bind(this.render, this));

				//There are already shipments created
				if (item_for_address && item_for_address.length)
				{
					result.then(notify_success_message);
				}
				else
				{
					result.then(function ()
					{
						self.clearGeneralMessages();
					});
				}

				return result;
			}
			else
			{
				return jQuery.Deferred().resolve();
			}
		}
	});
});