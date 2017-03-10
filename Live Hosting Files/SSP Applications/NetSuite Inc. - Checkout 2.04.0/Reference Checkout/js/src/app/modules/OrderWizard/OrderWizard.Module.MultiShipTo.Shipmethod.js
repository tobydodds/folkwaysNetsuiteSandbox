// OrderWizard.Module.MultiShipTo.Shipmethod.js
// --------------------------------------
//
define('OrderWizard.Module.MultiShipTo.Shipmethod', ['Wizard.Module', 'OrderShipmethod.Collection'], function (WizardModule, ShipmethodsCollection)
{
	'use strict';

	return WizardModule.extend(
	{
		template: 'order_wizard_msr_shipmethod_module'

	,	events: {
			'click [data-type="delivery-method-option"]' : 'selectDeliveryMethodRadioHandler'
		,	'click [data-action="items-expander"]' : 'changeExpandedState'
		,	'change [data-type="address-selector"]' : 'selectDeliveryMethodComboHandler'
		}

	,	errors: ['ERR_MST_NOT_SET_SHIPPING_METHODS']

	,	shipmethoIsRequireErrorMessage:
		{
			errorMessage: _('Please select a shipping method for each package').translate()
		,	errorCode: 'ERR_MST_NOT_SET_SHIPPING_METHODS'
		}

	,	initialize: function (options)
		{
			WizardModule.prototype.initialize.apply(this, arguments);

			this.packages_items_collapsed = {};
			this.is_read_only = _.isBoolean(options.is_read_only) ? options.is_read_only : true;
			this.submit_promise = null;

			this.profile = this.wizard.options.profile;

			var self = this;
			// This event is used to handle some OPC particular cases when the page is first loaded
			this.model.on('changelines', this.retrieveInitialDeliveryMethods, this);

			this.model.get('lines').on('change', function ()
			{
				if (self.isValid() && self.state === 'past')
				{
					self.error = null;
				}
			});
			this.eventHandlersOn();
		}

		// When on OPC the inital render will not show any delivery method, so it is require to manually requsted them.
		// this method bring the initial delivery methods
	,	retrieveInitialDeliveryMethods: function ()
		{
			if (this.state === 'present')
			{
				this.wizard.model.save().then(_.bind(this.render, this));
			}
		}

		// Detect when IS require attach to events and OPC edge cases
	,	present: function ()
		{
			// In some particular cases it happend that retrieveInitialDeliveryMethods is called but this.state is undefined, here we check
			// if it is the first time and re call it
			if (!this.state)
			{
				this.state = 'present';
				this.retrieveInitialDeliveryMethods();
			}
			this.eventHandlersOn();
		}

		// Detect when is not require attach to events
	,	future: function ()
		{
			this.eventHandlersOff();
		}

		// Detect when is not require attach to events
	,	past: function ()
		{
			this.eventHandlersOff();
		}

		// Attach to events that keep the current state updated
	,	eventHandlersOn: function ()
		{
			this.eventHandlersOff();

			this.profile.get('addresses').on('change', this.shippingAddressChange, this);

			this.model.on('change:multishipmethods', this.render, this);
		}

		// Dettach from any event
	,	eventHandlersOff: function ()
		{
			this.model.off('change:multishipmethods', null, this);

			this.profile.get('addresses').off('change', null, this);
		}

		// Handle on shipping address change
	,	shippingAddressChange: function (updated_address)
		{
			var addrress_model = this.wizard.model.get('addresses').get(updated_address.id);

			//If the address is not in the order we omit it
			if (addrress_model)
			{
				var	change_zip = addrress_model.get('zip') !== updated_address.get('zip')
				,	change_country = addrress_model.get('country') !== updated_address.get('country')
				,	change_state = addrress_model.get('state') !== updated_address.get('state');

				if (change_zip || change_country || change_state)
				{
					this.reloadShppingMethodForAddress(updated_address.id);
				}
				else
				{
					this.render();
				}
			}
		}

		// Reload the group of available shiping method for a package (loading the entire model - of course)
	,	reloadShppingMethodForAddress: function (address_id)
		{
			// This only remove the current selected shipping method and save the model, doing this the template when rendering
			// will offer select a new shiing meythod if any, or display an error if there is none.
			var affected_lines = this.wizard.model.get('lines').where({'shipaddress': address_id});
			
			if (affected_lines.length)
			{
				_.each(affected_lines, function (line)
				{
					line.unset('shipmethod');
				});

				this.wizard.model.save();
			}
		}

	,	getDefaultCollapseItem: function ()
		{
			return _.isBoolean(this.options.collapse_items) ?
					this.options.collapse_items :
					this.wizard.application.getConfig('collapseElements', false);
		}

		// Update the state of the items accordion, remembering if it is expanded or collapsed
	,	changeExpandedState: function (e)
		{
			var selected_address_id = jQuery(e.target).closest('[data-type="package"]').data('address-id');

			this.packages_items_collapsed[selected_address_id] = !_.isUndefined(this.packages_items_collapsed[selected_address_id]) ?
				!this.packages_items_collapsed[selected_address_id] :
				!this.getDefaultCollapseItem();
		}

		// Determiens if the current module is valid to be shown, all items have set a ship address id
	,	isActive: function ()
		{
			var shipping_methods = this.wizard.model.get('multishipmethods')
			,	result = _.keys(shipping_methods).length;

			if (result)
			{
				var all_item_has_shipping_address_selected = this.wizard.model.get('lines').all(function (line)
				{
					return !line.get('item').isshippable || line.get('shipaddress');
				});
				result = all_item_has_shipping_address_selected;

				if(this.is_read_only)
				{
					var	all_item_has_shipping_method_selected = this.wizard.model.get('lines').all(function (line)
					{
						return !line.get('item').isshippable || line.get('shipmethod');
					});

					result = result && all_item_has_shipping_method_selected;
				}
			}
			return result;
		}

		// Handle the delivery method selection when this action is caused by a combo box
	,	selectDeliveryMethodComboHandler: function (e)
		{
			var $selected_combo = jQuery(e.target)
			,	selected_delivery_mehtod_id = $selected_combo.val()
			,	selected_address_id = $selected_combo.data('address-id');

			this.selectDeliveryMethod(selected_delivery_mehtod_id, selected_address_id, true);
		}

		// Handle the delivery method selection when this acction is caused by a radio button
	,	selectDeliveryMethodRadioHandler: function (e)
		{
			var $selected_div = jQuery(e.target).closest('div')
			,	selected_delivery_mehtod_id = $selected_div.data('deliverymethod-id')
			,	selected_address_id = $selected_div.data('address-id')
			,	a_line = this.wizard.model.get('lines').findWhere({'shipaddress': selected_address_id.toString()})
			,	is_delivery_already_set = a_line && a_line.get('shipmethod') === selected_delivery_mehtod_id.toString();

			if (is_delivery_already_set)
			{
				e.preventDefault();
				return false;
			}

			!this.canSaveChanges() && e.preventDefault();

			this.selectDeliveryMethod(selected_delivery_mehtod_id, selected_address_id, true);
		}

		// Unset the specified package (address id) and for that address id mark the specified delivery method
	,	selectDeliveryMethod: function (selected_delivery_mehtod_id, selected_address_id, save_changes)
		{
			if (this.canSaveChanges())
			{
				var	items_per_address = this.wizard.model.get('lines').groupBy(function (line)
					{
						return line.get('shipaddress');
					})
				,	delivery_methods = this.wizard.model.get('multishipmethods')[selected_address_id];

				_.each(items_per_address[selected_address_id], function (item)
				{
					item.unset('shipmethod');
				});

				_.each(delivery_methods.where({check: true}), function (delivery_method)
				{
					delivery_method.unset('check');
				});

				delivery_methods.get(selected_delivery_mehtod_id).set('check', true);

				if (save_changes)
				{
					this.step.disableNavButtons();
					jQuery('[data-type="shipments-list"] input[type="radio"]').attr('disabled', 'disabled');
					this.saveChanges(true)
						.then(function () {
							jQuery('[data-type="shipments-list"] input[type="radio"]').removeAttr('disabled');
						})
						.then(_.bind(this.step.enableNavButtons, this.step));
				}
			}
		}
		// Set for each line the selected shipmethod of the continaer package
	,	submit: function ()
		{
			// If the view is being displayed in review mode (after place order)
			if (this.is_read_only || this.state !== 'present' || !this.isActive() )
			{
				return jQuery.Deferred().resolve();
			}

			// The real action of submiting a shipping method for a package is made when you select an options, clicking continue (which call this method) just validate
			// the current state.
			return this.isValid();
		}

		// Determine if not previous save operation is in progress
	,	canSaveChanges: function ()
		{
			return !this.submit_promise || this.submit_promise.state() !== 'pending';
		}

		// Actually submit the selected shipping method to the server
	,	saveChanges: function (submit_server)
		{
			this.clearError();
			if (this.canSaveChanges())
			{
				var lines = this.wizard.model.get('lines')
				,	shipping_methods = this.wizard.model.get('multishipmethods');

				lines.each(function (line)
				{
					var ship_address = line.get('shipaddress');
					if (ship_address)
					{
						var selected_ship_method = shipping_methods[ship_address].findWhere({check:true});
						if (selected_ship_method)
						{
							line.set('shipmethod', selected_ship_method.id);
						}
					}
				}, this);

				if (submit_server)
				{
					this.submit_promise = this.wizard.model.save();
					return this.submit_promise;
				}

				return jQuery.Deferred().resolve();
			}
		}

		// Check that all packages have a shipping method selected
	,	isValid: function ()
		{
			var lines = this.wizard.model.getSetLines()
			,	has_error = false;

			has_error = !!_.find(lines, function (line)
			{
				return !line.get('shipmethod');
			});

			if (!has_error)
			{
				this.error = null;
			}

			return has_error ?
						jQuery.Deferred().reject(this.shipmethoIsRequireErrorMessage) :
						jQuery.Deferred().resolve();
		}

		// Returns the lists of packages (items grouped by address) created
	,	getPackages: function ()
		{
			if (this.isActive() && this.state === 'present')
			{
				var result = []
				,	self = this
				,	items_per_address = this.wizard.model.get('lines').groupBy(function (line)
					{
						return line.get('shipaddress');
					})
				,	addresses = this.profile.get('addresses') //Get the addresses from profile because when updating just the user's address are updated
				,	selected_delivery_methods = []
				,	shipping_methods = this.wizard.model.get('multishipmethods');

				_.each(_.keys(items_per_address), function (address_id)
				{
					if (address_id === 'null' || !shipping_methods[address_id])
					{
						return;
					}
					if (!self.is_read_only)
					{
						var item_set = _.find(items_per_address[address_id], function (item)
							{
								return !!item.get('shipmethod');
							});

						//If in this package there is any item already set (this occur when in a next step press back) use that as selected delivery method
						if (item_set)
						{
							shipping_methods[address_id].get(item_set.get('shipmethod')).set('check', true);
						}

						selected_delivery_methods = shipping_methods[address_id];
					}
					else
					{
						//Get THE selected shipmethod for the entire package
						var ship_method_group_id = _.first(items_per_address[address_id]).get('shipmethod')
						,	ship_method = shipping_methods[address_id].get(ship_method_group_id);

						if(ship_method)
						{
							ship_method.set('check', true);
							selected_delivery_methods = new ShipmethodsCollection([ship_method]);
						}
					}

					result.push({
						lines: items_per_address[address_id]
					,	address: addresses.get(address_id) || self.wizard.model.get('addresses').get(address_id)
					,	collapse_elements: self.packages_items_collapsed[address_id]
					,	summary: {}
					,	deliveryMethods: selected_delivery_methods
					});

				});
				return result;
			}

			return [];
		}
	});
});
