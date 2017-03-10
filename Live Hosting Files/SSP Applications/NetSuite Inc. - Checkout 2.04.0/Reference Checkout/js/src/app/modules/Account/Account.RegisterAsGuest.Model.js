// Account.RegisterAsGuest.Model.js
// -------------------------
// Register the User as Guest
define('Account.RegisterAsGuest.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({

		urlRoot: _.getAbsoluteUrl('services/account-register-as-guest.ss')

	});
});