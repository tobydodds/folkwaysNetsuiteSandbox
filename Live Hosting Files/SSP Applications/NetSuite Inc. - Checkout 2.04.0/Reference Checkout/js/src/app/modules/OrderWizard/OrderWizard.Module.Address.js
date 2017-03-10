// OrderWizard.Module.Address.js
// -----------------------------
define('OrderWizard.Module.Address', ['Wizard.Module', 'Address.Views', 'Address.Model'], function (WizardModule, AddressViews, AddressModel)
{
	'use strict';

	return WizardModule.extend({

		template: 'order_wizard_address_module'

	,	selectMessage: _('Use this Address').translate()
	,	sameAsMessage: _('Same as Address').translate()
	,	selectAddressErrorMessage: {
			errorCode: 'ERR_CHK_SELECT_AN_ADDRESS'
		,	errorMessage: _('Please select an address').translate()
		}

	,	invalidAddressErrorMessage: {
			errorCode: 'ERR_CHK_INVALID_ADDRESS'
		,	errorMessage: _('The selected address is invalid').translate()
		}

	,	events: {
			'click [data-action="submit"]': 'submit'
		,	'click [data-action="select"]': 'selectAddress'
		,	'click [data-action="change-address"]': 'changeAddressHandler'
		,	'change [data-action="same-as"]': 'markSameAsHandler'
		,	'change form': 'changeForm'
		}

	,	errors: ['ERR_CHK_INCOMPLETE_ADDRESS', 'ERR_CHK_INVALID_ADDRESS']

		// module.render
		// -------------
	,	render: function (not_trigger_ready)
		{
			//Is Active is overriden by child modules, like Shipping to hide this module in Multi Ship To
			if (!this.isActive())
			{
				return this.$el.empty();
			}

			this.addresses = this.wizard.options.profile.get('addresses');
			this.isGuest = this.getIsCurrentUserGuest();
			this.isSameAsEnabled = _.isFunction(this.options.enable_same_as) ? this.options.enable_same_as() : this.options.enable_same_as;

			this.addressId = this.model.get(this.manage);

			this.evaluateDisablingSameAsCheckBox();

			// if the selected manage address is the fake one
			if (this.addressId && ~this.addressId.indexOf('null'))
			{
				// we silently remove it
				this.setAddress(null, {
					silent: true
				});
			}

			this.evaluateSameAs();
			this.address = this.getSelectedAddress();

			// Add event listeners to allow special flows
			this.eventHandlersOn();

			// Calls the render function
			this._render();

			this.addressView = null;
			this.addressListView = null;

			var is_address_new = this.address.isNew();

			// The following is used to match the logic on file order_wizard_address_module.txt
			// when the conditions apply, only the address details are shown
			// that means there are no form or list views required
			if ((this.isSameAsEnabled && this.sameAs) || this.addressId && !is_address_new)
			{
				null;
			}
			else if (this.getAddressesToShow().length && !this.isGuest)
			{
				this.createAddressListView();
			}
			else
			{
				this.createAddressDetailsView();

				// if the user is a guest, and its editing the already submited address
				// we set that address as the current one so we don't create a new address
				// in the guest's address book.
				if (this.isGuest && !is_address_new)
				{
					this.setAddress(this.address.id, {
						silent: true
					});
				}
			}

			// the module is ready when a valid address is selected.
			if (!not_trigger_ready && this.address && this.addressId && this.address.get('isvalid') === 'T')
			{
				this.trigger('ready', true);
			}

		}

	,	enableInterface: function ()
		{
			this.$('[data-action="change-address"]').attr('disabled', false);

			this.evaluateDisablingSameAsCheckBox();

			if (!this.disableSameAsCheckBox)
			{
				this.$('[data-action="same-as"]').attr('disabled', false);
			}
		}

		//Evaluates if the same as checkbox should be enabled or not. This values is saved in the instance variable disableSameAsCheckBox
		// it is possible to indicate that if the new value is enable to ren-render the view
	,	evaluateDisablingSameAsCheckBox: function (re_render_is_change)
		{
			//The other manage address is not selected AND the other temp address is not created
			var old_value = this.disableSameAsCheckBox;
			this.disableSameAsCheckBox = (this.model.get(this.sameAsManage) === undefined || this.model.get(this.sameAsManage) === null || this.model.get(this.sameAsManage) === '-------null') && !this.model.get('temp' + this.sameAsManage);
			if (old_value !== this.disableSameAsCheckBox && re_render_is_change)
			{
				this.render();
			}
		}

	,	disableInterface: function ()
		{
			this.$('[data-action="change-address"], [data-action="same-as"]').attr('disabled', true);
		}

		// This function, which is called from the template, returns the label for the change link
	,	getChangeLinkText: function ()
		{
			return this.getIsCurrentUserGuest() ? _('Edit Address').translate() : _('Change address').translate();
		}

		// Returns true if the current user is logged in as Guest
	,	getIsCurrentUserGuest: function ()
		{
			return this.wizard.options.profile.get('isGuest') === 'T';
		}

		//Generates the Address View to handle the list of addresses
	,	createAddressListView: function ()
		{
			this.addressListView = new AddressViews.List({
				application: this.wizard.application
			,	collection: this.addresses
			});

			// as the list was already renderd within the template of this, we just grab a reference to it
			this.addressListView.$el = this.$('#address-module-list-placeholder');

			this.addressListView.remove = _.bind(this.validateAddressRemoval, this.addressListView, this);

			// then we bind the events and validation
			Backbone.Validation.bind(this.addressListView);
			this.addressListView.delegateEvents();
		}

		// Handle address removal validating that the address selected is not being used by someone else
	,	validateAddressRemoval: function (address_module, e)
		{
			var address_id = jQuery(e.target).data('id');
			if (address_module.isAddressIdValidForRemoval(address_id))
			{
				return AddressViews.List.prototype.remove.call(this, e);
			}

			var other_address_message = address_module.sameAsManage === 'billaddress' ? _('(billing address)').translate() :
										address_module.sameAsManage === 'shipaddress' ? _('(shipping address)').translate() : '';

			if (confirm(_('The selected address is in use. $(0) Are you sure you want to delete this address?').translate(other_address_message)))
			{
				return this.removeAddressModel(address_id);
			}
		}

		// Validate that the address that want to be removed is not used by the related address (sameAsManage)
	,	isAddressIdValidForRemoval: function (address_id)
		{
			var related_address_id = this.model.get(this.sameAsManage);
			return (+address_id !== +related_address_id);
		}

		//Generates the Address View to handle the new address creation
	,	createAddressDetailsView: function ()
		{
			this.addressView = new AddressViews.Details({
				application: this.wizard.application
			,	collection: this.addresses
			,	model: this.address
			,	manage: this.manage
			});

			// as the form was already renderd within the template of this, we just grab a reference to it
			this.addressView.$el = this.$('#address-module-form-placeholder');

			// then we bind the events and validation
			Backbone.Validation.bind(this.addressView);
			this.addressView.delegateEvents();
		}

	,	evaluateSameAs: function ()
		{
			var manage_address_id = this.addressId
			,	other_address = this.getTheOtherAddress()
			,	other_address_id = other_address && other_address.get('internalid') || null;

			if (manage_address_id && manage_address_id === other_address_id)
			{
				this.sameAs = true;
			}
			else if (!this.tempAddress && manage_address_id !== other_address_id)
			{
				this.sameAs = false;
			}
			else
			{
				// We need a default sameAs value so is no longer undefined
				// if the sameAs was checked, and we have an address id set or there is a temporary address
				this.sameAs = this.sameAs && (manage_address_id || this.tempAddress || (this.isGuest && this.addresses.length));
			}
			this.model.set('sameAs', this.sameAs);
		}

	,	eventHandlersOn: function ()
		{
			var self = this
			,	other_address = this.sameAsManage;

			this.eventHandlersOff();

			this.addresses
				// Adds events to the collection
				.on('reset destroy change add', jQuery.proxy(this, 'render', true), this)
				.on('destroy', function (deleted_address)
				{
					// if the destroyed address was used as the sameAs
					if (self.model.get(other_address) === deleted_address.id)
					{
						// we need to remove it, as it doesn't exists
						self.model.set(other_address, null);
					}
				}, this);

			// when the value for the other address changes
			this.model
				.on('change:' + other_address, function (model, value)
				{
					// If same as is enabled and its selected
					if (self.isSameAsEnabled && self.sameAs)
					{
						// we change this manage to the value
						self.setAddress(value);
						self.render();
					}
					else if (self.isSameAsEnabled)
					{
						//This evaluation must be done despite self.sameAs is set or not to re-evalute if the checkbox status remains equal or not.
						//Ex. If in OPC neither shipping address not billing address is selected, and after that I select one shipping address, then it's require
						// to re-evalute the state of the sameAs checkbox
						this.evaluateDisablingSameAsCheckBox(true);
					}

				}, this);

			if (this.isSameAsEnabled && this.sameAs)
			{
				this.model.on('change:temp' + other_address, function (model, temp_address)
				{
					self.tempAddress = temp_address;
					self.render();
				}, this);
			}
			else if (this.isSameAsEnabled)
			{
				this.model.once('change:temp' + other_address, function ()
					{
						//The following considerataion take importance in OPC.
						//Changes in the temp (other) address will take into account only if there is no a real (other) address, otherwise this generate that
						//render gets executed more than once, because is this event always get triggered by the changeForm method.

						//Problem example: When the temp address change because of submiting the other address (particurlarly shipping address) this will cause
						//that the billing address get re-renderd, and if the billing is not completed all errors will disappear.
						if (!this.model.get(other_address))
						{
							this.render();
						}
					}, self);
			}

			_.isFunction(this.onEventHandlersOn) && this.onEventHandlersOn();
		}

	,	eventHandlersOff: function ()
		{
			// Removes prevously added events on the address collection
			this.addresses && this.addresses.off(null, null, this);
			this.model
				.off('change:' + this.sameAsManage, null, this)
				.off('change:temp' + this.sameAsManage, null, this);

			_.isFunction(this.onEventHandlersOff) && this.onEventHandlersOff();
		}

	,	past: function ()
		{
			this.eventHandlersOff();
		}

	,	future: function ()
		{
			this.eventHandlersOff();
		}

		// module.selectAddress
		// --------------------
		// Captures the click on the select button of the addresses list
	,	selectAddress: function (e)
		{
			jQuery('.wizard-content .alert-error').hide();

			// Grabs the address id and sets it to the model
			// on the position in which our sub class is manageing (billaddress or shipaddress)
			this.setAddress(jQuery(e.target).data('id').toString());

			// re render so if there is changes to be shown they are represented in the view
			this.render();

			// As we already set the address, we let the step know that we are ready
			this.trigger('ready', true);
		}

	,	setAddress: function (address_id, options)
		{
			this.model.set(this.manage, address_id, options);
			this.addressId = address_id;

			return this;
		}

	,	unsetAddress: function (norender, options)
		{
			this.setAddress(null, options);
			this.tempAddress = null;

			if (!norender)
			{
				this.render();
			}
		}

	,	changeAddressHandler: function (e)
		{
			e.preventDefault();
			e.stopPropagation();

			var $link = jQuery(e.currentTarget)
			,	is_disabled = $link.attr('disabled');

			this.changeAddress(is_disabled);
		}

	,	changeAddress: function (is_disabled)
		{
			if (is_disabled)
			{
				return;
			}

			if (this.options.edit_url)
			{
				this.unsetAddress(true);

				Backbone.history.navigate(this.options.edit_url + '?force=true', {
					trigger: true
				});
			}
			else
			{
				this.unsetAddress();
			}
		}

		// module.submit
		// -------------
		// The step will call this function when the user clicks next or all the modules are ready
		// Will take care of saving the address if its a new one. Other way it will just
		// return a resolved promise to comply with the api
	,	submit: function ()
		{

			//Is Active is overriden by child modules, like Shipping to hide this module in Multi Ship To
			if (!this.isActive())
			{
				return jQuery.Deferred().resolve();
			}
			var self = this;
			// its a new address
			if (this.addressView)
			{
				// The saveForm function expects the event to be in an element of the form or the form itself,
				// But in this case it may be in a button outside of the form (as the bav buttosn live in the step)
				//  or tiggered by a module ready event, so we need to create a fake event which the target is the form itself
				var fake_event = jQuery.Event('submit', {
						target: this.addressView.$('form').get(0)
					})
					// Calls the saveForm, this may kick the backbone.validation, and it may return false if there were errors,
					// other ways it will return an ajax promise
				,	result = this.addressView.saveForm(fake_event);

				var save_result = jQuery.Deferred();

				// Went well, so there is a promise we can return, before returning we will set the address in the model
				// and add the model to the profile collection
				if (result && !result.frontEndValidationError)
				{
					result.done(function (model)
					{
						// Set Address id to the order model. This has to go before the following self.addresses.add() as it triggers the render
						self.setAddress(model.internalid);

						// we only want to trigger an event on add() when the user has some address and is not guest because if not,
						// in OPC case (two instances of this module in the same page), the triggered re-render erase the module errors.
						var add_options = (self.isGuest || self.addresses.length === 0) ? {silent: true} : null;
						self.addresses.add(model, add_options);

						self.model.set('temp' + self.manage, null);

						self.newAddressCreated && self.newAddressCreated(model.internalid, add_options);

						self.render();

						save_result.resolve();
					});
				}
				else
				{
					// There were errors so we return a rejected promise
					save_result.reject({
						errorCode: 'ERR_CHK_INCOMPLETE_ADDRESS'
					,	errorMessage: _('The address is incomplete').translate()
					});
				}

				return save_result;
			}
			else
			{
				return this.isValid();
			}
		}

	,	isValid: function ()
		{
			//Is Active is overriden by child modules, like Shipping to hide this module in Multi Ship To
			if (!this.isActive() || this.tempAddress)
			{
				return jQuery.Deferred().resolve();
			}

			var addresses = this.wizard.options.profile.get('addresses')
			,	selected_address = addresses && addresses.get(this.model.get(this.manage));

			if (selected_address)
			{
				if (selected_address.get('isvalid') === 'T')
				{
					return jQuery.Deferred().resolve();
				}

				return jQuery.Deferred().reject(this.invalidAddressErrorMessage);
			}

			return jQuery.Deferred().reject(this.selectAddressErrorMessage);
		}

	,	changeForm: function (e)
		{
			this.model.set('temp' +  this.manage, jQuery(e.target).closest('form').serializeObject());
		}

	,	markSameAsHandler: function (e)
		{
			var is_checked = jQuery(e.target).prop('checked');
			this.markSameAs(is_checked);
		}
	,	markSameAs : function (is_checked)
		{
			this.sameAs = is_checked;

			this.model.set('sameAs', is_checked);

			this.setAddress(is_checked ? this.model.get(this.sameAsManage) : null);

			this.tempAddress = is_checked ? this.model.get('temp' + this.sameAsManage) : null;

			this.render();
		}

		// returns the selected address
	,	getSelectedAddress: function ()
		{
			if (!this.addressId)
			{
				if (this.sameAs && this.tempAddress)
				{
					return new AddressModel(this.tempAddress);
				}

				// if the user is guest it only has 1 address for this module so we return that address or a new one
				if (this.isGuest)
				{
					return this.getFixedAddress();
				}
			}

			return this.addresses.get(this.addressId) || this.getEmptyAddress();
		}

	,	getEmptyAddress: function ()
		{
			// If the same as checkbox is not checked
			// we return a new model with any attributes that were already typed into the address form
			// that's what the temp + this.manage is, the temporary address for this manage.
			return new AddressModel(this.isSameAsEnabled && this.sameAs ? null : this.model.get('temp' + this.manage));
		}

		//returns the address in the addresses collection wich id is current model's sameAsManage attribute
	,	getTheOtherAddress: function ()
		{
			return this.addresses.get(this.model.get(this.sameAsManage));
		}

		// returns the list of addresses available for this module, if the module has enable_same_as then it removes the sameAsManage address
	,	getAddressesToShow: function ()
		{
			if(this.isGuest && this.isSameAsEnabled)
			{
				var same_as_address_id = this.model.get(this.sameAsManage);

				return new Backbone.Collection(this.addresses.reject(function (address)
				{
					return address.id === same_as_address_id;
				}));
			}
			else
			{
				return new Backbone.Collection(this.addresses.models);
			}
		}

		// return the fixed address for this module. This is used only when user=guest

		//returns the first address to show or an empty address
	,	getFixedAddress: function ()
		{
			var addresses = this.getAddressesToShow();
			return addresses.length ? addresses.at(0) : this.getEmptyAddress();
		}

	,	manageError: function (error)
		{
			if (error && error.errorCode !== 'ERR_CHK_INCOMPLETE_ADDRESS')
			{
				WizardModule.prototype.manageError.apply(this, arguments);
			}
		}
	});
});
