// CreditCard.Views.js
// -----------------------
// Views for handling credit cards (CRUD)
define('CreditCard.Views', function ()
{
	'use strict';

	var Views = {};
	
	// Credit card details view/edit
	Views.Details = Backbone.View.extend({
		
		template: 'creditcard'
	,	attributes: { 'class': 'CreditCardDetailsView' }
	,	events: {
			'submit form': 'saveForm'
		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'
		,	'change form [name="ccnumber"]': 'setPaymethodId'
		}

	,	initialize: function ()
		{
			this.title = this.model.isNew() ? _('Add Credit Card').translate() : _('Edit Credit Card').translate() ;
			this.page_header = this.title;
			
			// initialize date selector
			var currentExpYear = this.model.get('expyear'), newExpYear = new Date().getFullYear(), range = _.range(new Date().getFullYear(), new Date().getFullYear() + 25);
			if (currentExpYear && currentExpYear < newExpYear)
			{
				range = _.union([parseInt(currentExpYear, 10)], range);
				this.options.expyear = currentExpYear;
			}
			if (!this.model.get('expmonth'))
			{
				this.options.currentMonth = new Date().getMonth() + 1;
			}									
			this.options.months = _.range(1, 13);
			this.options.years = range;
			//only enable "defult" functionality in myaccount
			this.options.showDefaults = this.options.application.getConfig('currentTouchpoint') === 'customercenter';
		}

	,	setPaymethodId: function (e)
		{
			var cc_number = jQuery(e.target).val().replace(/\s/g, '')
			,	form = jQuery(e.target).closest('form')
			,	paymenthod_id = _.paymenthodIdCreditCart(cc_number);

			jQuery(e.target).val(cc_number);

			if (paymenthod_id)
			{	
				form.find('[name="paymentmethod"]').val(paymenthod_id);
				form.find('[data-image="creditcard-icon"]').each(function (index, img)
				{
					var $img = jQuery(img);
					if ($img.data('value').toString() === paymenthod_id)
					{
						$img.show();
					}
					else
					{
						$img.hide();
					}
				});
			}
			else
			{
				form.find('[data-image="creditcard-icon"]').show();
			}
		}

	,	showContent: function (path, label)
		{
			label = label || path;
			this.options.application.getLayout().showContent(this, label, { text: this.title, href: '/' + path });
		}		

	,	saveForm: function (e) 
		{
			//This is a hack to fix cases when the change event in ccnumber is not triggered and setPaymethodId is not call.
			// This occurr in Safari with the AutoFill feature (using keychain)
			if (!jQuery(e.target).find('[name="paymentmethod"]').val())
			{
				jQuery(e.target).find('[name="ccnumber"]').change();
			}
			
			// Call super and then check if the edited credit card is not on the order and if so update it. 
			// Note that if securitycode is required and we pass an empty one then the payment method will be removed from the order. 
			var live_order = this.options.application.getCart()
			,	promise = Backbone.View.prototype.saveForm.apply(this, arguments);

			return promise && promise.done(function (user_cc)
			{
				live_order.get('paymentmethods').each(function (paymentmethod)
				{
					var order_cc = paymentmethod.get('creditcard'); 
					if (order_cc && user_cc && order_cc.internalid === user_cc.internalid)
					{	
						// in the payment method of the order, ONLY update those fields editable by the user. 
						order_cc.ccexpiredate = user_cc.ccexpiredate; 
						order_cc.ccname = user_cc.ccname; 
						order_cc.expmonth = user_cc.expmonth; 
						order_cc.expyear = user_cc.expyear; 

						paymentmethod.set('creditcard', order_cc); 
						live_order.get('paymentmethods').add(paymentmethod, {merge: true}); 
					}
				});
			});
			 
		}

	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent('creditcards');
		}
	});
	
	// Credit cards list
	Views.List = Backbone.View.extend({
	
		template: 'creditcards'
	,	title: _('Credit Cards').translate() 
	,	page_header: _('Credit Cards').translate() 
	,	attributes: { 'class': 'CreditCardListView' }
	,	events: { 'click [data-action="remove"]': 'remove' }

	,	showContent: function (path, label)
		{
			label = label || path;
			this.options.application.getLayout().showContent(this, label, { text: this.title, href: '/' + path });
		}
		
	,	remove: function (e)
		{
			e.preventDefault();

			if (confirm(_('Are you sure you want to delete this Credit Card?').translate()))
			{
				this.collection.get(jQuery(e.target).data('id')).destroy({ wait: true });
			}
		}
	});

	return Views;
});