/*jshint laxcomma:true*/
jQuery(document).ready(function ()
{
	'use strict';
	
	SC.compileMacros(SC.templates.macros);

	require(['Merchandising.Rule', 'Content.DataModels'], function (MerchandisingRule, ContentDataModels)
	{
		var application = SC.Application('MyAccount');

		application.getConfig().siteSettings = SC.ENVIRONMENT.siteSettings || {};
		
		// Loads the urls of the different pages in the conten service, 
		// this needs to happend before the app starts, so some routes are registered
		if (SC.ENVIRONMENT.CONTENT)
		{
			ContentDataModels.Urls.Collection.getInstance().reset(SC.ENVIRONMENT.CONTENT);
			delete SC.ENVIRONMENT.CONTENT;

			if (SC.ENVIRONMENT.DEFAULT_PAGE)
			{
				ContentDataModels.Pages.Collection.getInstance().reset(SC.ENVIRONMENT.DEFAULT_PAGE);
				delete SC.ENVIRONMENT.DEFAULT_PAGE;
			}
		}
		
		if (SC.ENVIRONMENT.MERCHANDISING)
		{
			// we need to turn it into an array
			var definitions = _.map(SC.ENVIRONMENT.MERCHANDISING, function (value, key)
			{
				value.internalid = key;
				return value;
			});

			MerchandisingRule.Collection.getInstance().reset(definitions);
			delete SC.ENVIRONMENT.MERCHANDISING;
		}

		jQuery(application.start (function ()
		{
			var user = application.getUser();

			if (SC.ENVIRONMENT.PROFILE)
			{
				user.set(SC.ENVIRONMENT.PROFILE);

				if (!user.get('companyname') || user.get('isperson') || application.getConfig('siteSettings.registration.companyfieldmandatory') !== 'T')
				{
					delete user.validation.companyname;
				}

				if (!user.get('isperson'))
				{
					delete user.validation.firstname;
				}

				if (!user.get('lastname') || !user.get('isperson'))
				{
					delete user.validation.lastname;
				}
				
				if (!user.get('phone'))
				{
					delete user.validation.phone;
				}
				delete SC.ENVIRONMENT.PROFILE;

				if (SC.ENVIRONMENT.LIVEPAYMENT)
				{
					if (SC.ENVIRONMENT.LIVEPAYMENT.balance)
					{
						user.set('balance', SC.ENVIRONMENT.LIVEPAYMENT.balance);
					}
					if (SC.ENVIRONMENT.LIVEPAYMENT.balance_formatted)
					{
						user.set('balance_formatted', SC.ENVIRONMENT.LIVEPAYMENT.balance_formatted);
					}
				}
			}
			
			if (SC.ENVIRONMENT.ADDRESS)
			{
				user.get('addresses').reset(SC.ENVIRONMENT.ADDRESS);
				delete SC.ENVIRONMENT.ADDRESS;
			}
			else
			{
				user.get('addresses').reset([]);
			}			

			if (SC.ENVIRONMENT.CREDITCARD)
			{
				user.get('creditcards').reset(SC.ENVIRONMENT.CREDITCARD);
				delete SC.ENVIRONMENT.CREDITCARD;
			}
			else
			{
				user.get('creditcards').reset([]);
			}

			if (SC.ENVIRONMENT.CASES)
			{
				application.Configuration.cases = {
					enabled: SC.ENVIRONMENT.CASES.enabled
				,	config: SC.ENVIRONMENT.CASES.CONFIG
				};
			}

			// Checks for errors in the context
			if(SC.ENVIRONMENT.contextError)
			{
				// Hide the header and footer.
				application.getLayout().$('#site-header').hide();
				application.getLayout().$('#site-footer').hide();
				
				// Shows the error.
				application.getLayout().internalError(SC.ENVIRONMENT.contextError.errorMessage, 'Error ' + SC.ENVIRONMENT.contextError.errorStatusCode + ': ' + SC.ENVIRONMENT.contextError.errorCode);
			}
			else
			{
				var fragment = _.parseUrlOptions(location.search).fragment;
				if (fragment && !location.hash)
				{
					location.hash = decodeURIComponent(fragment);
				}

				Backbone.history.start();
			}

			application.getLayout().appendToDom();

		}));
	});
});