// OrderWizard.Module.Shipmethod.js
// --------------------------------
//
define('OrderWizard.Module.CartSummary', ['Wizard.Module', 'OrderWizard.Module.TermsAndConditions', 'ErrorManagement' ], function (WizardModule, TermsAndConditions, ErrorManagement)
{
	'use strict';

	return WizardModule.extend({

		template: 'order_wizard_cart_summary'

	,	attributes: {
			'id': 'order-wizard-layout'
		,	'class': 'order-wizard-layout'
		}

	,	events: {
			'submit form[data-action="apply-promocode"]': 'applyPromocode'
		,	'click [data-action="remove-promocode"]': 'removePromocode'
		,	'shown #promo-code-container' : 'onShownPromocodeForm'
		,	'click #order-summary [data-action="submit-step"]' : 'submitStep' //only for Order Place button in the Order Summary
		,	'click [data-toggle="show-terms-summary"]' : 'showTerms' //only for "Show terms and cond" in the Order Summary
		,	'click [data-action="change-status-multishipto-sidebar"]' : 'changeStatusMultiShipTo'
		}

	,	initialize: function (options)
		{
			var self = this;
			this.wizard = options.wizard;
			this.currentStep = options.currentStep;

			//on change model we need to refresh summary
			this.wizard.model.on('sync change:summary', function ()
			{
				if (!_.isArray(self.wizard.model.get('lines')))
				{
					self.render();
				}
			});

			//Ingore this module when determining if a steo should be skipped or not
			this.options.exclude_on_skip_step = true;
		}
	,	render: function()
		{
			if (this.state === 'present')
			{
				this._render();
				this.trigger('ready', true);
			}
		}

	,	changeStatusMultiShipTo: function()
		{
			this.wizard.model.trigger('update-multi-ship-to-status');
		}

	,	getContinueButtonLabel: function ()
		{
			var current_step = this.wizard.getCurrentStep();
			return current_step ?
					current_step.changedContinueButtonLabel || current_step.continueButtonLabel || _('Place Order').translate() :
					_('Place Order').translate();
		}

	,	getHideItems: function ()
		{
			var current_step = this.wizard.getCurrentStep();
			if (current_step)
			{
				return _.isFunction(current_step.hideSummaryItems) ? current_step.hideSummaryItems() : current_step.hideSummaryItems;
			}
			return false;
		}

		// applyPromocode:
		// Handles the submit of the apply promo code form
	,	applyPromocode: function (e)
		{
			var self = this
			,	$target = jQuery(e.target)
			,	options = $target.serializeObject();

			e.preventDefault();

			this.$('[data-type=promocode-error-placeholder]').empty();

			// disable navigation buttons
			this.trigger('change_enable_continue', false);

			// disable inputs and buttons
			$target.find('input, button').prop('disabled', true);

			this.wizard.model.save({ promocode: { code: options.promocode } }).fail(
				function (jqXhr)
				{
					self.wizard.model.unset('promocode');
					jqXhr.preventDefault = true;
					var message = ErrorManagement.parseErrorMessage(jqXhr, self.wizard.application.getLayout().errorMessageKeys);
					self.$('[data-type=promocode-error-placeholder]').html(SC.macros.message(message,'error',true));
					$target.find('input[name=promocode]').val('').focus();
				}
			).always(
				function(){
					// enable navigation buttons
					self.trigger('change_enable_continue', true);
					// enable inputs and buttons
					$target.find('input, button').prop('disabled', false);
				}
			);
		}

		// removePromocode:
		// Handles the remove promocode button
	,	removePromocode: function (e)
		{
			var self = this;

			e.preventDefault();

			// disable navigation buttons
			this.trigger('change_enable_continue', false);

			this.wizard.model.save({ promocode: null }).always(function(){
				// enable navigation buttons
				self.trigger('change_enable_continue', true);
			});
		}

		// onPromocodeFormShown
		// Handles the shown of promocode form
	,	onShownPromocodeForm: function(e)
		{
			jQuery(e.target).find('input[name="promocode"]').focus();
		}

	,	destroy: function ()
		{
			var layout = this.wizard.application.getLayout();
			// The step could've resetted the header, we now put it back
			if (layout.originalHeader)
			{
				layout.$('#site-header').html(layout.originalHeader);
			}

			this._destroy();
		}

	,	submitStep: function(e) { //only for Order Place button in the Order Summary
			var step = this.currentStep;
			step.submit(e);
		}

	,	showTerms: TermsAndConditions.prototype.showTerms //only for "Show terms and cond" in the Order Summary
	});
});