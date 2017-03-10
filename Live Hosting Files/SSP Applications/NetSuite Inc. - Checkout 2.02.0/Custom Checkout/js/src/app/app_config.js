// Configuration.js
// ----------------
// All of the applications configurable defaults
// Each section is comented with a title, please continue reading

(function (application)
{
	'use strict';

	application.on('beforeStart', function(){
		alert("CHANGE HEADER");

		require(['OrderWizard.Step'], function(WizardStep){
			_.extend(WizardStep.prototype, {
				headerMacro : 'header'
			,	footerMacro : 'footer'
			});
		});

	});
	
})(SC.Application('Checkout'));
