// Wizard.Step.js
// --------------
// Step View, Renders all the components of the Step
define('OrderWizard.Step', ['Wizard.Step'], function (WizardStep)
{
	'use strict';

	return WizardStep.extend({

		headerMacro: 'simplifiedHeader'
	,	footerMacro: 'simplifiedFooter'

	,	template: 'order_wizard_step'

	,	stepAdvance: function ()
		{
			if (this.areAllModulesReady())
			{
				return this.isStepReady() || this.wizard.isPaypalComplete();
			}
			return false;
		}

	,	render: function ()
		{
			var layout = this.wizard.application.getLayout();

			// We store a copy of the current state of the head when it starts, to then restore it once the WizardView is destroyed
			if (!layout.originalHeader)
			{
				layout.originalHeader = layout.$('header.site-header').html();
			}

			// Every step can show its own version of header,
			layout.$('#site-header').html(SC.macros[this.headerMacro](layout));
			layout.$('#site-footer').html(SC.macros[this.footerMacro](layout));

			WizardStep.prototype.render.apply(this, arguments);

			// remove the cc security code from current model state.
			if (this.wizard.application.getConfig('siteSettings.checkout.requireccsecuritycode') === 'T')
			{
				var current_model_state = JSON.parse(this.currentModelState)
				,	credit_card = _.findWhere(current_model_state.paymentmethods, {type:'creditcard'});
				if (credit_card && credit_card.creditcard)
				{
					credit_card.creditcard.ccsecuritycode = null;
					this.currentModelState = JSON.stringify(current_model_state);
				}
			}
			if (this.url === this.wizard.stepsOrder[0] && // only in the first step
				//this.wizard.application.getUser().get('isLoggedIn') === 'F' && // only if the user doesn't already have a session
				this.wizard.application.getConfig('checkout_skip_login') &&
				this.wizard.application.getUser().get('isLoggedIn') === 'F')
			{
				var message = _('Checking out as a Guest. If you have an account, please $(0) and enjoy a faster checkout experience.').translate('<a href="login" data-toggle="show-in-modal" data-id="skip-login-modal">' + _('login').translate() + '</a>');
				this.$('[data-action="skip-login-message"]').empty().append(SC.macros.message(message, 'info', true));
			}

			// Notify the layout that we have modified the DOM (specially we want it to update the reference layout.$search).
			layout.updateUI();

			// Also trigger the afterRender event so the site search module can load the typeahead.
			layout.trigger('afterRender');
		}

	});
});
