// OrderWizard.Module.Shipmethod.js
// --------------------------------
//
define('OrderWizard.Module.RegisterGuest', ['Wizard.Module', 'Account.Register.Model'], function (WizardModule, AccountRegisterModel)
{
	'use strict';

	return WizardModule.extend({

		template: 'order_wizard_register_guest_module'

	,	events: {
			'submit form': 'saveForm'
		}

	,	errors: [
			'AN_ACCOUNT_WITH_THAT_NAME_AND_EMAIL_ADDRESS_ALREADY_EXISTS'
		,	'ERR_WS_CUSTOMER_REGISTRATION'
		,	'ERR_WS_INVALID_EMAIL'
		,	'USER_ERROR'
		]

	,	render: function ()
		{
			var application = this.wizard.application;

			this.model = new AccountRegisterModel();

			if (application.getUser().get('isGuest') === 'T')
			{
				this.guestEmail = this.wizard.options.profile.get('email');
				this._render();
			}
			else
			{
				this.trigger('ready', true);
			}
		}

	,	showSuccess: function ()
		{
			this.$('form').empty().html(
				SC.macros.message(
					_('Account successfully created').translate()
				,	'success'
				)
			);
		}

	,	trackEvent: function (callback)
		{
			this.wizard.application.trackEvent({
				category: 'create-account'
			,	action: 'click'
			,	value: 1
			,	callback: callback
			});
		}

	,	saveForm: function (e)
		{
			e.preventDefault();

			this.clearError();

			var self = this
			,	$target = jQuery(e.target)
			,	button = $target.find('button')
			,	user_data = $target.serializeObject();

			this.$savingForm = $target.closest('form');

			button && button.prop('disabled', true);

			var promise = this.model.save(user_data);
			
			if (promise)
			{
				promise.done(function ()
				{
					self.trackEvent();
					self.wizard.application.getUser().set(self.model.get('user'));
					self.showSuccess();
				})
				.fail(function (jqXhr)
				{
					button && button.prop('disabled', false);
					jqXhr.preventDefault = true;
					self.wizard.manageError(JSON.parse(jqXhr.responseText));
				});
			}
			
		}

	,	showError: function ()
		{
			if (this.error && this.error.errorCode === 'AN_ACCOUNT_WITH_THAT_NAME_AND_EMAIL_ADDRESS_ALREADY_EXISTS')
			{
				this.error.errorMessage = this.error.errorMessage.replace('href=\'{1}\'', 'href="#" data-touchpoint="login"');
			}

			WizardModule.prototype.showError.apply(this, arguments);
		}
	});
});