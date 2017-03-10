// Profile.Views.js
// -----------------------
// Views for profile's operations
define('Profile.Views', function ()
{
	'use strict';

	var Views = {};

	// home page view
	Views.Home = Backbone.View.extend({

		template: 'home'
	,	title: _('Welcome!').translate()
	,	attributes: {'class': 'ProfileHomeView'}
	,	events: {}

	,	initialize: function (options)
		{
			this.model = options.model;
			this.application = options.application;

			this.customerSupportURL = this.application.getConfig('customerSupportURL');

			this.model.on('change', this.showContent, this);

			this.addresses = this.model.get('addresses');

			this.creditcards = this.model.get('creditcards');

			this.addresses.on('reset destroy change add', this.showContent, this);

			this.creditcards.on('reset destroy change add', this.showContent, this);
		}

	,	destroy: function ()
		{
			this.addresses.off(null, null, this);
			this.creditcards.off(null, null, this);

			this.offEventsOfDefaults();

			this._destroy();
		}

	,	offEventsOfDefaults: function ()
		{
			this.defaultCreditCard && this.defaultCreditCard.off(null, null, this);
			this.defaultShippingAddress && this.defaultShippingAddress.off(null, null, this);
		}

	,	showContent: function ()
		{
			// off events of defaults
			this.offEventsOfDefaults();

			// set the defaults
			this.defaultShippingAddress = this.addresses.findWhere({defaultshipping: 'T'});
			this.defaultCreditCard = this.creditcards.findWhere({ccdefault: 'T'});

			// on events of defaults
			this.defaultShippingAddress && this.defaultShippingAddress.on('change', this.showContent, this);
			this.defaultCreditCard && this.defaultCreditCard.on('change', this.showContent, this);

			this.title = this.model.get('firstname') ? _('Welcome $(0)!').translate(this.model.get('firstname')) : this.title;
			this.application.getLayout().showContent(this, 'home', []);
		}
	});

	// view/edit profile information
	Views.Information = Backbone.View.extend({
		template: 'profile_information'
	,	page_header: _('Profile Information').translate()
	,	title: _('Profile Information').translate()
	,	attributes: {'class': 'ProfileInformationView'}
	,	events: {
			'submit form': 'saveForm'
		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'
		,	'keyup form:has([data-action="reset"])': 'toggleReset'
		,	'blur input[data-type="phone"]': 'formatPhone'
		}

	,	formatPhone: function (e)
		{
			var $target = jQuery(e.target);
			$target.val(_($target.val()).formatPhone());
		}

	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent();
		}

	,	showSuccess: function ()
		{
			if (this.$savingForm)
			{
				var message =  _('Profile successfully updated!').translate();
				this.showContent();
				this.$('[data-type="alert-placeholder"]').append(SC.macros.message(message, 'success', true));
			}
		}

	,	showContent: function ()
		{
			this.options.application.getLayout().showContent(this, 'profileinformation', [{
				text: this.title
			,	href: '/profileinformation'
			}]);

			// prevent copying from the email input to avoid pasting it in the confirmation email field
			this.$('input.no-copy-paste').on('cut copy',function (e)
			{
				e.preventDefault();
			});
		}
	});

	// update user's password view
	Views.UpdateYourPassword = Backbone.View.extend({

		template: 'profile_update_your_password'
	,	page_header: _('Update Your Password').translate()
	,	title: _('Update Your Password').translate()
	,	attributes: {'class': 'ProfileUpdateYourPasswordView'}
	,	events: {
			'submit form': 'updatePassword'
		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'keyup form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'
		}

	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent();
		}

	,	updatePassword: function (e)
		{
			this.saveForm(e);
		}

	,	showSuccess: function ()
		{
			if (this.$savingForm)
			{
				var message = _('Password successfully updated!').translate();
				this.showContent();
				this.$('[data-type="alert-placeholder"]').html(SC.macros.message(message, 'success', true));
			}
		}

	,	showContent: function ()
		{
			this.options.application.getLayout().showContent(this, 'updateyourpassword', [{
				text: this.title
			,	href: '/updateyourpassword'
			}]);
		}
	});


	// view for updating emai prefeneces
	Views.EmailPreferences = Backbone.View.extend({

		template: 'email_preferences'
	,	title: _('Email Preferences').translate()
	,	page_header: _('Email Preferences').translate()
	,	attributes: {'class': 'ProfileEmailPreferencesView'}
	,	events: {
			'submit form': 'save'
		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'
		,	'keyup form:has([data-action="reset"])': 'toggleReset'
		,	'change #emailsubscribe': 'emailSubscribeChange'
		}

	,	showContent: function ()
		{
			this.options.application.getLayout().showContent(this, 'emailpreferences', [{
				text: this.title
			,	href: 'emailpreferences'
			}]);
		}

	,	showSuccess: function ()
		{
			if (this.$savingForm)
			{
				this.showContent();
				this.$('[data-type="alert-placeholder"]').append(SC.macros.message(_('Email Preferences successfully saved!').translate(), 'success', true));
			}
		}

	,	save: function (e)
		{
			e.preventDefault();

			var	$target = jQuery(e.target)
			,	props = $target.serializeObject()
			,	subscriptions_by_id = {}
			,	campaignsubscriptions = this.model.get('campaignsubscriptions');

			// generate an object with the subscriptions and it's corresponding value
			_.each(props, function (val, key)
			{
				if (~key.indexOf('subscription-'))
				{
					subscriptions_by_id[key.replace('subscription-', '')] = (val === 'T');
				}
			});

			_.each(campaignsubscriptions, function (subscription)
			{
				subscription.subscribed = subscriptions_by_id[subscription.internalid];
			});

			var fixed_props = {
				campaignsubscriptions: campaignsubscriptions
			,	emailsubscribe: props.emailsubscribe === 'T'
			};

			this.saveForm(e, this.model, fixed_props);
		}

	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent();
		}

		// if the user doesn't want email notifications we disable all the campaign's checkboxes
	,	emailSubscribeChange: function ()
		{
			var self = this
			,	disabled = !self.$('#emailsubscribe').prop('checked');

			self.$('input[type=checkbox].subscription').prop('disabled', disabled);
		}
	});

	return Views;
});
