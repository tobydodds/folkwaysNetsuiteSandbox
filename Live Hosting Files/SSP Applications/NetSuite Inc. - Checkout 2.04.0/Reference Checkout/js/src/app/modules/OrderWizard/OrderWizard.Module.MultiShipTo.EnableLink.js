// OrderWizard.Module.MultiShipTo.EnableLink.js
// --------------------------------
//
define('OrderWizard.Module.MultiShipTo.EnableLink', ['Wizard.Module', 'OrderWizard.NonShippableItems.View', 'OrderWizard.PromocodeUnsupported.View'], function (WizardModule, NonShippalbeItemsView, PromocodeUnsupportedView)
{
	'use strict';

	return WizardModule.extend(
	{
		template: 'order_wizard_msr_enablelink_module'

	,	events: {
			'click [data-action="change-status-multishipto"]': 'updateMultiShipToStatus'
		}

		// Determines if the current module is valid to be shown and operate with
	,	isActive: function ()
		{
			return this.wizard.application.getConfig('siteSettings.isMultiShippingRoutesEnabled', false) && this.wizard.model.getIfThereAreDeliverableItems();
		}

	,	initialize: function()
		{
			WizardModule.prototype.initialize.apply(this, arguments);
			this.wizard.model.on('toggle-multi-ship-to',this.toggleMultiShipTo,this);
			this.wizard.model.on('update-multi-ship-to-status', this.updateMultiShipToStatus, this);
		}
		// Handle the change between module ship to and single ship to
	,	updateMultiShipToStatus: function (e)
		{
			e && e.preventDefault();

			var application = this.wizard.application;

			if(this.wizard.model.get('promocode'))
			{
				this.promocodeUnsupportedView = new PromocodeUnsupportedView({
					model: this.wizard.model
				,	application: application
				,	parent: this
				});
				this.wizard.model.on('toggle-multi-ship-to',this.toggleMultiShipTo,this);
				application.getLayout().showInModal(this.promocodeUnsupportedView);
			}
			else
			{
				this.toggleMultiShipTo();
			}
		}

	,	toggleMultiShipTo: function()
		{
			if (!this.wizard.model.get('ismultishipto'))
			{
				//These unsets are silent in order to avoid problems with other modules
				this.wizard.model.set('shipmethod',  null, {silent: true});
				this.wizard.model.set('sameAs', false, {silent: true});
				this.wizard.model.set('shipaddress', null, {silent: true});
			}

			var self = this;
			this.wizard.model.set('ismultishipto', !this.wizard.model.get('ismultishipto'));

			this.wizard.model.save()
				.done(function ()
				{
					self.wizard.model.trigger('ismultishiptoUpdated');
					Backbone.history.navigate(self.options.change_url || 'shipping/address', {trigger: true});
					self.render();
				});
		}

		//We override render to just render this module in case the multi ship to feature is enabled
	,	render: function ()
		{
			if (this.isActive())
			{
				this._render();
				this.trigger('ready', true);
			}
		}

	});
});