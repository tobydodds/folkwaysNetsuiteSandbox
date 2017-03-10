// Profile.UpdatePassword.Model.js
// -----------------------
// View Model for changing user's password
define('Profile.UpdatePassword.Model', function ()
{
	'use strict';

	return Backbone.Model.extend(
	{
		urlRoot: 'services/profile.ss'
		,	validation: {
			current_password:  { required: true, msg: _('Current password is required').translate() }
		,	confirm_password: [ 
				{ required: true, msg: _('Confirm password is required').translate() }
			,	{ equalTo: 'password', msg: _('New Password and Confirm Password do not match').translate() }]
		
		,	password: { required: true, msg: _('New  password is required').translate() }
			
		}
	});
});