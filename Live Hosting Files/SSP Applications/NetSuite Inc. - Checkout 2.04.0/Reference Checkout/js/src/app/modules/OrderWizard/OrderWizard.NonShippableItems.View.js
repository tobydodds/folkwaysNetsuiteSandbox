// OrderWizard.NonShippableItems.View.js
// -------------------
// Handles the MultiShipTo Packages View
define('OrderWizard.NonShippableItems.View', function ()
{
	'use strict';

	return Backbone.View.extend({
		template: 'order_wizard_nonshippableitems'

	,	initialize: function ()
		{
			Backbone.View.prototype.initialize.apply(this, arguments);
			this.title = _('Please, edit your order').translate();
		}

		// Returns thed list of non shippable items from the current model (LiveOrder)
	,	getNonShippableLines: function ()
		{
			return this.model.getNonShippableLines();
		}
	});
});