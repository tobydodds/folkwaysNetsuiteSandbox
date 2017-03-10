// Configuration.js
// ----------------
// All of the applications configurable defaults
// Each section is comented with a title, please continue reading

(function (application)
{
	'use strict';

	//window.screen = false; //always comment this line on production !!
	// Calculates the width of the device, it will try to use the real screen size.
	var screen_width = (window.screen) ? window.screen.availWidth : window.outerWidth || window.innerWidth;

	var Cart = SC.ENVIRONMENT.CART;

	//var Testing = (window.location.href.indexOf("testing=T") != -1);

	application.Configuration = {};

	_.extend(application.Configuration, {

		// header_macro will show an image with the url you set here
		logoUrl: 'https://checkout.netsuite.com/core/media/media.nl?id=45&c=297799&h=8ecf93901dad09546a4a'

	,	siteUrl : "http://www.folkways.si.edu"

		// depending on the application we are configuring, used by the NavigationHelper.js
	,	currentTouchpoint: 'checkout'

		// list of the applications required modules to be loaded
		// de dependencies to be loaded for each module are handled by
		// [require.js](http://requirejs.org/)
	,	modules: [
			// ItemDetails should always be the 1st to be added
			// there will be routing problmes if you change it
			['ItemDetails',  {startRouter: true}]
		,	['Cart', {startRouter: false}]
		,	['LoginRegister', {startRouter: true}]
		,	'BackToTop'
		,	'Profile'
		,	'CreditCard'
		,	'Address'
		,	'OrderWizard'
		,	'Facets.Model'
		,	'LanguageSupport'
		,	'MultiCurrencySupport'
		,	'MultiHostSupport'
		,	'NavigationHelper'
		,	'SiteSearch'
		,	'AjaxRequestsKiller'
		,	'ErrorManagement'
		,	'GoogleAnalytics'
		,	'Merchandising'

			// TODO: This modules need to be loaded on boot time, and they are needed within a module, so they are not caught by our fix.
		,	'OrderWizard.Module.PaymentMethod.Creditcard'
		,	'OrderWizard.Module.PaymentMethod.Invoice'
		,	'OrderWizard.Module.PaymentMethod.PayPal'
		,	'OrderWizard.Module.CustomTransactionFields'
		]

	,	defaultSearchUrl: 'search'

	,	startCheckoutWizard: true

	,	checkoutSteps: [
			{
				name: _('Shipping').translate()
			,	steps: [
					{
						name: _('Enter Shipping Address').translate()
					,	hideBackButton: true
					,	headerMacro: 'header'						//each step can define which main site header to show when the user is placed on it. By default the simplyfied macro is used, but the normal 'header' (or a custom one) can be used
					,	footerMacro: 'footer'						//as with the header, each step can define which site footer to use, by default the simplified footer is used.
					,	hideSummary: screen_width < 768 //hide summary on phone
					,	getName: function()
						{
							if (this.wizard.options.profile.get('addresses').length)
							{
								return _('Choose Shipping Address').translate();
							}
							else
							{
								return _('Enter Shipping Address').translate();
							}
						}
					,	url: 'shipping/address'
					,	modules: [
							'OrderWizard.Module.Address.Shipping'
						]
					}
				,	{
						name: _('Choose delivery method').translate()
					,	url: 'shipping/method'
					,	hideBackButton: true
					,	headerMacro: 'header'						//each step can define which main site header to show when the user is placed on it. By default the simplyfied macro is used, but the normal 'header' (or a custom one) can be used
					,	footerMacro: 'footer'						//as with the header, each step can define which site footer to use, by default the simplified footer is used.
					,	hideSummary: screen_width < 768 //hide summary on phone
					,	modules: [
							['OrderWizard.Module.Address.Shipping', {title: _('Ship To:').translate()}]
						,	'OrderWizard.Module.Shipmethod'
						]
					}
				]
			}
		,	{
				name: _('Payment').translate()
			,	steps: [
					{
						name: _('Choose Payment Method').translate()
					,	url: 'billing'
					,	hideSummary: screen_width < 768 //hide summary on phone
			,	headerMacro: 'header'						//each step can define which main site header to show when the user is placed on it. By default the simplyfied macro is used, but the normal 'header' (or a custom one) can be used
			,	footerMacro: 'footer'						//as with the header, each step can define which site footer to use, by default the simplified footer is used.
					,	bottomMessage: _('You will have an opportunity to review your order on the next step.').translate()
					,	modules: [
							'OrderWizard.Module.PaymentMethod.GiftCertificates'
						,	'OrderWizard.Module.PaymentMethod.Selector'
						//	configure the address module to show a "same as XXX address" checkbox
						,	['OrderWizard.Module.Address.Billing', {enable_same_as: true, title: _('Enter Billing Address').translate()}]
						,	'OrderWizard.Module.RegisterEmail'
						]
					}
				]
			}
		,	{
				name: _('Review & Place Order').translate()
			,	steps: [
					{
						name: _('Review Your Order').translate()
					,	url: 'review'
					,	continueButtonLabel: _('Place Order').translate()
					,	hideBackButton: true
			,	headerMacro: 'header'						//each step can define which main site header to show when the user is placed on it. By default the simplyfied macro is used, but the normal 'header' (or a custom one) can be used
			,	footerMacro: 'footer'						//as with the header, each step can define which site footer to use, by default the simplified footer is used.
					,	hideSummaryItems: true
					,	modules: [
							['OrderWizard.Module.ShowPayments', {edit_url_billing: '/billing', edit_url_address: '/billing'}]
						,	'OrderWizard.Module.CustomTransactionFields'
						,	['OrderWizard.Module.ShowShipments', {edit_url: '/shipping/address', show_edit_button: true}]
						,	'OrderWizard.Module.TermsAndConditions'
						]
					,	save: function()
						{
							return this.wizard.model.submit();
						}
					}
				,	{
						url: 'confirmation'
					,	headerMacro: 'header'
					,	hideSummaryItems: true
					,	hideContinueButton: true
					,	hideBackButton: true
					,	modules: [
							'OrderWizard.Module.Confirmation'
						,	'OrderWizard.Module.RegisterGuest'
						,	'OrderWizard.Module.ShowPayments'
						,	'OrderWizard.Module.ShowShipments'
						]
					,	present: function ()
						{
							this.wizard.application.trackTransaction(this.wizard.model);
						}
					}
				]
			}
		]

		// default macros
	,	macros: {

			itemOptions: {
				// each apply to specific item option types
				selectorByType:
				{
					select: 'itemDetailsOptionTile'
				,	'default': 'itemDetailsOptionText'
				}
				// for rendering selected options in the shopping cart
			,	selectedByType: {
					'default': 'shoppingCartOptionDefault'
				}
			}
			// default merchandising zone template
		,	merchandisingZone: 'merchandisingZone'
		}

		// array of links to be added to the header
		// this can also contain subcategories
	,	navigationTabs: [
			{
				text: _('Home').translate()
			,	href: '/'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#/'
				}
			}
		,	{
				text: _('Shop').translate()
			,	href: '/search'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#/search'
				}
			}
		]

		// options to be passed when querying the Search API
	,	searchApiMasterOptions: {
			Facets: {
				fieldset: 'search'
			}

		,	itemDetails: {
				fieldset: 'details'
			}

			// don't remove, get extended
		,	merchandisingZone: {}
		}

		// Analytics Settings
	,	tracking: {
			trackPageview: true
		,	google: {
				propertyID: 'UA-5756420-1'
				// [Tracking Between a Domain and a Sub-Directory on Another Domain](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingSite?hl=en#domainAndSubDirectory)
			,	domainName: 'checkout.netsuite.com'
			}
		}

		// Typeahead Settings
	,	typeahead: {
			minLength: 3
		,	maxResults: 8
		,	macro: 'typeahead'
		}

		// setting it to false will search in the current results
		// if on facet list page
	,	isSearchGlobal: true

		// url for the not available image
	,	imageNotAvailable: _.getAbsoluteUrl('img/no_image_available.jpeg')

		// map of image custom image sizes
		// usefull to be customized for smaller screens
	,	imageSizeMapping: {
			thumbnail: 'thumbnail' // 175 * 175
		,	main: 'main' // 600 * 600
		,	tinythumb: 'tinythumb' // 50 * 50
		,	zoom: 'zoom' // 1200 * 1200
		,	fullscreen: 'fullscreen' // 1600 * 1600
		}

		// Macro to be rendered in the header showing your name and nav links
		// we provide be 'headerProfile' or 'headerSimpleProfile'
	,	profileMacro: 'headerProfile'

	,	languagesEnabled: true

		// When showing your credit cards, which icons should we use
	,	creditCardIcons: {
			'VISA - WEB': 'img/visa.png'
		,	'Discover': 'img/discover.png'
		,	'M/C - WEB': 'img/master.png'
		,	'AMEX -WEB': 'img/american.png'
		}

		// Search preferences
	,	searchPrefs: {
			// keyword maximum string length - user won't be able to write more than 'maxLength' chars in the search box
			maxLength: 40

			// keyword formatter function will format the text entered by the user in the search box. This default implementation will remove invalid characters like *(){}+-=" that causes known problems
		,	keywordsFormatter: function (keywords)
			{
					// characters that cannot appear at any location
				var anyLocationRegex = /[\(\)\[\]\{\}\!\"\:]{1}/g
					// characters that cannot appear at the begining
				,	beginingRegex = /^[\*\-\+\~]{1}/g
					// replacement for invalid chars
				,	replaceWith = '';

				return keywords.replace(anyLocationRegex, replaceWith).replace(beginingRegex, replaceWith);
			}
		}

		//Invoice payment method terms and conditions text
	,	invoiceTermsAndConditions: _('<h4>Invoice Terms and Conditions</h4><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>').translate()
	});

	// Phone Specific
	if (screen_width < 768)
	{
		_.extend(application.Configuration, {});
	}
	// Tablet Specific
	else if (screen_width >= 768 && screen_width <= 1024)
	{
		_.extend(application.Configuration, {});
	}
	// Desktop Specific
	else
	{
		_.extend(application.Configuration, {});
	}

//	if ( Testing ) {

	    application.on("beforeStart", function() {

	    	var allItemsDownloadable = null;

	        if (Cart && Cart.lines.length) {

	            _.each(Cart.lines, function(line) {

	                var item = line['item'];

	                console.log("itemid", item["itemid"]);
	                console.log("custitem_isdigital", item["custitem_isdigital"]);

	                if ( item['custitem_isdigital'] == true && (allItemsDownloadable != false) ) {
	                    allItemsDownloadable = true;
	                }
	                else if ( ! item['custitem_isdigital'] ) {
	                	allItemsDownloadable = false;
	                }

	            });

	        }

	        console.log("allItemsDownloadable: "+ allItemsDownloadable);

	        if ( allItemsDownloadable ) {
	        	application.Configuration.checkoutSteps = application.Configuration.checkoutSteps.slice(1);
	        }

	        _.extend(application.Configuration, { allItemsDownloadable : (allItemsDownloadable) ? "T" : "F" });

	        if ( application.Configuration.allItemsDownloadable == "T" ) {
	        	application.Configuration.checkoutSteps[0].steps[0].modules[2][1].enable_same_as = false;
	        }

	    });

//	}

	application.getLayout().on('afterAppendView', function (view) {

        application.getLayout().$el.find('#wizard-content div[data-from-begining="3"] .form-actions:eq(1)').hide();

        if ( application.getLayout().$el.find('#wizard-content input#send-by-email') ) {
        	application.getLayout().$el.find('#wizard-content input#send-by-email').prop("checked", "checked").change();
        }

        if ( application.getConfig().allItemsDownloadable == "T" ) {

        	application.getLayout().$el.find("input#billaddress-isresidential, input#in-modal-isresidential").parent().parent().hide();

        	application.getLayout().$el.find(".shipments-shipping-details").hide();
        }

    });

})(SC.Application('Checkout'));
