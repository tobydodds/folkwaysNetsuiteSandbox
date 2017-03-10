// Responsive.js
// -------------
// Handles the toggleing of the menu for the mobile version of the site 
define('Responsive', function ()
{
	'use strict';
	
	return {
		mountToApp: function (application)
		{
			// every time the view is appended
			application.getLayout().on('afterAppendView', function ()
			{
				// if it's the home and we are in a mobile
				if (jQuery(window).width() <= 767 && (Backbone.history.fragment === '' || Backbone.history.fragment === 'overview'))
				{
					// the show-nav hides the content and shows the sidebar 
					this.application.getLayout().$el.addClass('show-side-nav').removeClass('hide-side-nav');
				}
				else
				{
					this.application.getLayout().$el.addClass('hide-side-nav').removeClass('show-side-nav');
				}
			});
		}
	};
});
