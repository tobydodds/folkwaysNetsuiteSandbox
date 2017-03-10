// OrderWizard.PromocodeUnsupported.View.js
// -------------------
// Handles the case when you want to activate multi ship-to and you have promocode
define('OrderWizard.PromocodeUnsupported.View', function ()
{
	'use strict';

	return Backbone.View.extend({
		template: 'order_wizard_promocode_unsupported'

	,	events: {
			'click [data-action="continue"]': 'continueHandler'
		}

	,	initialize: function ()
		{
			Backbone.View.prototype.initialize.apply(this, arguments);
			this.title = _('Promo Code is not supported').translate();
			this.msg = _('We\'re sorry but promo codes are not supported when sending to multiple locations. If you continue the promotion won\'t be applied. ').translate();
		}

	,	continueHandler: function ()
		{
			this.$('[data-dismiss=modal]').click();
			this.model.trigger('toggle-multi-ship-to');
		}
	});
});