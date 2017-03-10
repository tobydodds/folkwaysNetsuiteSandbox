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

	application.Configuration = {};

	_.extend(application.Configuration, {

		// header_macro will show an image with the url you set here
		logoUrl: ''

	,	notShowCurrencySelector: true

		// depending on the application we are configuring, used by the NavigationHelper.js
	,	currentTouchpoint: 'checkout'

		// list of the applications required modules to be loaded
		// de dependencies to be loaded for each module are handled by
		// [require.js](http://requirejs.org/)
	,	modules: [
			// ItemDetails should always be the 1st to be added
			// there will be routing problmes if you change it
			['ItemDetails',  {startRouter: true}]
		,	'Profile'
		,	['Cart', {startRouter: false}]
		,	['LoginRegister', {startRouter: true}]
		,	'BackToTop'
		,	'CreditCard'
		,	'Content'
		,	'Address'
		,	'OrderWizard'
		,	'Facets.Model'
		,	'MultiCurrencySupport'
		,	'MultiHostSupport'
		,	'NavigationHelper'
		,	'SiteSearch'
		,	'AjaxRequestsKiller'
		,	'ErrorManagement'
		,	'GoogleAnalytics'
		,	'GoogleUniversalAnalytics'
		,	'GoogleAdWords'
		,	'Merchandising'
		,	'CheckoutSkipLogin'

			// TODO: This modules need to be loaded on boot time, and they are needed within a module, so they are not caught by our fix.
		,	'OrderWizard.Module.PaymentMethod.Creditcard'
		,	'OrderWizard.Module.PaymentMethod.Invoice'
		,	'OrderWizard.Module.PaymentMethod.PayPal'
		]

	,	defaultSearchUrl: 'search'

	,	startCheckoutWizard: true

// The checkoutSteps properties is an array that defines the entire Checkout experience. It is based on a Wizard, this is a list of
// steps that the user secuentially complete submitting the order at the end. Each step contains one or more modules that perform a logic
// task like showing or asking the user certain information.
// In this configuration file there three fully functional examples of the checkout experience:
// 1) The normal three steps checkout (uncommented), 2) the One Page Checkout (commented) and 3) a four step "Billing First" Checkout (commented).
// For trying the later two just replace the checkoutSteps property value with the desired commented one.

// The following describes the format of the checkoutSteps property
/*
checkoutSteps: [											//an array with the step groups conforming The Checkout
	{
		name: 'Step Group'									//the name of this Step Group
	,	steps: [											//an array of the steps of this step group
			{
				name: 'Step'								//literal name for this step
			,	getName: function()	{return 'a name'; }		//dynamic name for this step. If there is no getname() defined, name property will be used instead
			,	url: 'step-url'								//this step's url. Must be unique among all the steps
			,	continueButtonLabel: "Continue"				//The label of the 'Continue' button for this step, for example, for One Page Checkout it could be 'Place Order'
			,	hideBackButton: true						//if true the "Back" button will be hidden for this step
			,	hideContinueButton: true					//if true the "Continue" buttons in the page will be hidden for this step
			,	hideSecondContinueButtonOnPhone: true		//if true the second "Continue" button in the page will be hidden when displayed on a smartphone. Use this if there are too many "Continue" buttons in a step (i.e. top, bottom and summary buttons)
			,	hideSummaryItems: true						//if true the cart summary's items are not showed on this step
			,	hideSummary: true							//if true the cart summary is not showed on this step
			,	hideBreadcrumb: true						//if true the breadcrumb in the page will be hidden for this step
			,	headerMacro: 'header'						//each step can define which main site header to show when the user is placed on it. By default the simplyfied macro is used, but the normal 'header' (or a custom one) can be used
			,	footerMacro: 'footer'						//as with the header, each step can define which site footer to use, by default the simplified footer is used.
			,	bottomMessage: 'Some message at the bottom' //a message that will appear at the bottom of the step, under the "continue" and "back" buttons
			,	bottomMessageClass: 'classname'				//a class that the bottom mesage can have
			,	showStep: function(){return boolean;}		//Indicate if the entire step should be shown or not. The defautl implementation of this function check that all modules in the step are arvie (isActive) or not.
			,	modules: [									//Required, the list modules that form this step, the order will be respected vissually from top to bottom.
					'Module.Name'							//three different module syntax are supported String, array or object.
				,	['Module2', {edit_url: '/someurl'}]		//individual modules may accept configuration parameters that will be applied to the module for this step. In this case the edit_url is accepted by those modules that ask the user to edit data from modules in ahother step, so it must be a valid step url.
				,	{name: 'Module3', title: 'My module!'}	//also modules accept the property 'title' for showing a small title on top of the module.
				]
			,	save: function()							//a custom save function which 'this' context will be the Step (a Backbone view)
				{
					return this.wizard.model.submit();
				}
			}
		]
	}
]
*/

/* the normal three step checkout */

	,	checkoutSteps: [
			{
				name: _('Shipping').translate()
			,	steps: [
					{
						name: _('Enter Shipping Address').translate()
					,	hideBackButton: true
					,	hideSummary: screen_width < 768 //hide summary on phone
					,	hideSummaryItems: function ()
						{
							return !!this.wizard.model.get('ismultishipto');
						}
					,	getName: function()
						{
							// As in MST we emulate many step in one (Proxy) the real title is delegate to the module, wich is in the module name
							if (this.wizard.model.get('ismultishipto'))
							{
								return this.name;
							}
							else if (this.wizard.options.profile.get('addresses').length)
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
							['OrderWizard.Module.MultiShipTo.EnableLink', {change_url : 'shipping/address'}]
						,	['OrderWizard.Module.CartSummary', {container: '#wizard-step-content-right'}]
						,	'OrderWizard.Module.Proxy.Addresses'
						]
					}
				,	{
						name: _('Choose delivery method').translate()
					,	url: 'shipping/method'
					,	hideBackButton: false
					,	hideSummaryItems: function ()
						{
							return !!this.wizard.model.get('ismultishipto');
						}
					,	hideSummary: screen_width < 768 //hide summary on phone
					,	modules: [
							['OrderWizard.Module.Address.Shipping', {title: _('Ship To:').translate()}]
						,	['OrderWizard.Module.CartSummary', { container: '#wizard-step-content-right'}]
						,	[	'OrderWizard.Module.Proxy.Shipmethod'
							,	{
									is_read_only: false
								,	show_edit_address_url: true
								,	hide_accordion: true
								,	collapse_items: true
								}
							]
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
					,	hideSummaryItems: function ()
						{
							return !!this.wizard.model.get('ismultishipto');
						}
					,	bottomMessage: _('You will have an opportunity to review your order on the next step.').translate()
					,	bottomMessageClass: 'text-right'
					,	modules: [
							'OrderWizard.Module.PaymentMethod.GiftCertificates'
						,	'OrderWizard.Module.PaymentMethod.Selector'
						,	['OrderWizard.Module.CartSummary', { container: '#wizard-step-content-right'}]
						//	configure the address module to show a "same as XXX address" checkbox
						,	[	'OrderWizard.Module.Address.Billing'
							,	{
									enable_same_as: function () { return !this.wizard.model.get('ismultishipto');}
								,	title: _('Enter Billing Address').translate()
								}
							]
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
					,	hideBackButton: false
					,	hideSummaryItems: true
					,	modules: [
							['OrderWizard.Module.ShowPayments', {edit_url_billing: '/billing', edit_url_address: '/billing'}]
						,	['OrderWizard.Module.CartSummary', { container: '#wizard-step-content-right'}]
						,	[	'OrderWizard.Module.Proxy.ShowShipments'
							,	{
									edit_url: '/shipping/address'		//Used by show shipment SST
								,	show_edit_address_url: true			//Used by show shipments MST
								,	hide_title: true					//All SUB-MODULES does not show its titles
								,	edit_shipment_url: 'shipping/address'
								,	is_read_only: false
								,	show_combo: true
								,	show_edit_button: true
								,	hide_item_link: true
								}
							]
						,	'OrderWizard.Module.TermsAndConditions'
						]
					,	save: function()
						{
							return this.wizard.model.submit();
						}
					}
				,	{
						url: 'confirmation'
					,	hideSummaryItems: true
					,	hideContinueButton: true
					,	hideBackButton: true
					,	modules: [
							['OrderWizard.Module.Confirmation', { container: '#wizard-step-review-left', additional_confirmation_message: _('You will receive an email with this confirmation in a few minutes.').translate()}]
						,	['OrderWizard.Module.CartSummary', { container: '#wizard-step-review-right'}]
						,	'OrderWizard.Module.RegisterGuest'
						,	'OrderWizard.Module.ShowPayments'
						,	[	'OrderWizard.Module.Proxy.ShowShipments'
							,	{
									show_combo: true
								,	hide_items: true
								,	hide_item_link: false
								}
							]
						]
					,	present: function ()
						{
							this.wizard.application.trackTransaction(this.wizard.model);
						}
					}
				]
			}
		]

/* The One Page Checkout Scenario */
/*
		,	checkoutSteps: [
			{
				name: _('Place Order').translate()
			,	steps: [
					{
						name: _('Checkout').translate()
					,	url: 'opc'
					,	continueButtonLabel: _('Continue').translate()
					,	hideBackButton: true
					,	hideBreadcrumb: true
					,	hideSummaryItems: function ()
						{
							return !!this.wizard.model.get('ismultishipto');
						}
					,	hideSecondContinueButtonOnPhone: false
					,	modules: [
							['OrderWizard.Module.MultiShipTo.EnableLink', {change_url : '/opc'}]
						,	['OrderWizard.Module.CartSummary', { container: '#wizard-step-content-right'}]
						,	[	'OrderWizard.Module.Proxy.Addresses.OPC'
							,	{
									hide_if_valid_addresses: true
								,	hide_title: true //All SUB-MODULES does not show its titles
								,	title: _('Enter Shipping Address').translate()
								}
							]
						,	'OrderWizard.Module.MultiShipTo.NonShippableItems'
						,	[	'OrderWizard.Module.Proxy.Shipmethod'
							,	{
									is_read_only: false
								,	hide_title: true //All SUB-MODULES does not show its titles
								,	hide_items: true
								,	title: _('Choose delivery method').translate()
								}
							]
						,	['OrderWizard.Module.PaymentMethod.GiftCertificates', {title: _('Choose Payment Method').translate()}]
						,	['OrderWizard.Module.PaymentMethod.Selector', {
								modules: [
									{
										classModule: 'OrderWizard.Module.PaymentMethod.Creditcard'
									,	name: _('Credit / Debit Card').translate()
									,	type: 'creditcard'
									,	options: {}
									}
								,	{
										classModule: 'OrderWizard.Module.PaymentMethod.Invoice'
									,	name: _('Invoice').translate()
									,	type: 'invoice'
									,	options: {}
									}
								,	{
										classModule: 'OrderWizard.Module.PaymentMethod.PayPal'
									,	name: _('PayPal').translate()
									,	type: 'paypal'
									,	options: {backFromPaypalBehavior: 'stay'} // other value also supported 'advance'
									}
								]
							}]
						,	['OrderWizard.Module.Address.Billing', {enable_same_as: function () { return !this.wizard.model.get('ismultishipto');}, title: _('Enter Billing Address').translate()}]
						,	'OrderWizard.Module.RegisterEmail'
						,	'OrderWizard.Module.TermsAndConditions'
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
					,	hideBreadcrumb: true
					,	hideSummaryItems: true
					,	modules: [
							['OrderWizard.Module.ShowPayments', {edit_url_billing: '/opc', edit_url_address: '/opc'}]
						,	['OrderWizard.Module.CartSummary', { container: '#wizard-step-content-right'}]
						,	[	'OrderWizard.Module.Proxy.ShowShipments'
							,	{
									edit_url: '/opc'
								,	edit_shipment_url: '/opc'
								,	show_edit_address_url: true
								,	is_read_only: false
								,	show_combo: true
								,	show_edit_button: true
								,	hide_item_link: true
								}
							]
						,	'OrderWizard.Module.TermsAndConditions'
						]
					,	save: function()
						{
							if (this.wizard.isPaypal() && !this.wizard.isPaypalComplete())
							{
								return this._save();
							}
							else
							{
								return this.wizard.model.submit();
							}

						}
					}
				,	{
						url: 'confirmation'
					,	hideSummaryItems: true
					,	hideContinueButton: true
					,	hideBreadcrumb: true
					,	hideBackButton: true
					,	modules: [
							['OrderWizard.Module.Confirmation', {additional_confirmation_message: _('You will receive an email with this confirmation in a few minutes.').translate()}]
						,	['OrderWizard.Module.CartSummary', { container: '#wizard-step-content-right'}]
						,	'OrderWizard.Module.RegisterGuest'
						,	'OrderWizard.Module.ShowPayments'
						,	['OrderWizard.Module.Proxy.ShowShipments', { show_combo: true, hide_items: false, hide_item_link: false }]
						]
					,	present: function ()
						{
							this.wizard.application.trackTransaction(this.wizard.model);
						}
					}
				]
			}
		]
*/
/* The Billing First Scenario */
/*
,	checkoutSteps: [
			{
				name: _('Addresses').translate()
			,	steps: [
					{
						name: _('Enter Billing Address').translate()
					,	url: 'billing/address'
					,	hideBackButton: true
					,	hideSummary: screen_width < 768 //hide summary on phone
					,	modules: [
							'OrderWizard.Module.Address.Billing'
						,	['OrderWizard.Module.CartSummary', { container: '#wizard-step-content-right'}]
						]
					}
				,	{
						name: _('Enter Shipping Address').translate()
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
					,	hideBackButton: true
					,	hideSummary: screen_width < 768 //hide summary on phone
					,	modules: [
							['OrderWizard.Module.MultiShipTo.EnableLink', {change_url : 'shipping/address'}]
						,	['OrderWizard.Module.CartSummary', { container: '#wizard-step-content-right'}]
						,	[	'OrderWizard.Module.Address.Billing'
							,	{
									edit_url: '/billing/address'
								,	title: _('Billing Address').translate()
								,	isActive: function ()
									{
										return this.wizard.model.getIfThereAreDeliverableItems();
									}
								}
							]
						,	[	'OrderWizard.Module.Proxy.Addresses'
							,	{
									enable_same_as: function ()
									{
										return !this.wizard.model.get('ismultishipto');
									}
								,	hide_title: true
								,	title: _('Shipping Address').translate()
								}
							]
						]
					}
				]
			}
		,	{
				name: _('Shipping method').translate()
			,	steps: [
					{
						name: _('Choose delivery method').translate()
					,	url: 'shipping/method'
					,	hideSummary: screen_width < 768 //hide summary on phone
					,	modules: [
							['OrderWizard.Module.MultiShipTo.EnableLink', {change_url : 'shipping/address'}]
						,	['OrderWizard.Module.CartSummary', { container: '#wizard-step-content-right'}]
						,	['OrderWizard.Module.Address.Shipping', {title:_('Ship To:').translate(), edit_url: '/shipping/address'}]
						,	[	'OrderWizard.Module.Proxy.Shipmethod'
							,	{
									is_read_only: false
								,	show_edit_address_url: true
								,	hide_accordion: true
								,	collapse_items: true
								}
							]
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
						// for each Step, a message that will appear at the end of the step can be configured.
					,	bottomMessage: _('You will have an opportunity to review your order on the next step.').translate()
					,	hideSummary: screen_width < 768 //hide summary on phone
					,	modules: [
							'OrderWizard.Module.PaymentMethod.GiftCertificates'
						,	['OrderWizard.Module.CartSummary', { container: '#wizard-step-content-right'}]
						,	'OrderWizard.Module.PaymentMethod.Selector'
						//	configure the address module to show a "same as XXX address" checkbox
						,	['OrderWizard.Module.Address.Billing', {enable_same_as: false, edit_url: 'billing/address'}]
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
					,	hideSummaryItems: true
					,	modules: [
							['OrderWizard.Module.ShowPayments', {edit_url_billing: '/billing', edit_url_address: '/billing'}]
						,	['OrderWizard.Module.CartSummary', { container: '#wizard-step-content-right'}]
						,	[	'OrderWizard.Module.Proxy.ShowShipments'
							,	{
									edit_url: '/shipping/address'
								,	show_edit_address_url: true
								,	is_read_only: false
								,	show_combo: true
								,	show_edit_button: true
								,	hide_item_link: true
								}
							]
						,	'OrderWizard.Module.TermsAndConditions'
						]
					,	save: function()
						{
							return this.wizard.model.submit();
						}
					}
				,	{
						url: 'confirmation'
					,	hideContinueButton: true
					,	hideSummaryItems: true
					,	hideBackButton: true
					,	modules: [
							['OrderWizard.Module.Confirmation', {additional_confirmation_message: _('You will receive an email with this confirmation in a few minutes.').translate()}]
						,	'OrderWizard.Module.RegisterGuest'
						,	['OrderWizard.Module.CartSummary', { container: '#wizard-step-content-right'}]
						,	'OrderWizard.Module.ShowPayments'
						,	[	'OrderWizard.Module.Proxy.ShowShipments'
							,	{
									show_combo: true
								,	hide_items: true
								,	hide_item_link: false
								}
							]
						]
					,	present: function ()
						{
							this.wizard.application.trackTransaction(this.wizard.model);
						}
					}
				]
			}
		]
*/

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

		,	typeAhead: {
				fieldset: 'typeahead'
			}
		}

		// Analytics Settings
		// You need to set up both popertyID and domainName to make the default trackers work
	,	tracking: {
			// [Google Universal Analytics](https://developers.google.com/analytics/devguides/collection/analyticsjs/)
			googleUniversalAnalytics: {
				propertyID: ''
			,	domainName: ''
			}
			// [Google Analytics](https://developers.google.com/analytics/devguides/collection/gajs/)
		,	google: {
				propertyID: ''
			,	domainName: ''
			}
			// [Google AdWords](https://support.google.com/adwords/answer/1722054/)
		,	googleAdWordsConversion: {
				id: 0
			,	value: 0
			,	label: ''
			}
		}

		// Typeahead Settings
	,	typeahead: {
			minLength: 3
		,	maxResults: 8
		,	macro: 'typeahead'
		,	sort: 'relevance:asc'
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
			'VISA': 'img/visa.png'
		,	'Discover': 'img/discover.png'
		,	'Master Card': 'img/master.png'
		,	'Maestro': 'img/maestro.png'
		,	'American Express': 'img/american.png'
		}

		// Whether to show or not the Credit Cards help
	,	showCreditCardHelp: true

		// Credit Card help title
	,	creditCardHelpTitle: _('Where to find your Security Code').translate()

		// CVV All cards image
	,	imageCvvAllCards: _.getAbsoluteUrl('img/cvv_all_cards.jpg')

		// CVV American card image
	,	imageCvvAmericanCard: _.getAbsoluteUrl('img/cvv_american_card.jpg')

		// define the url of paypal logo.
	,	paypal_logo: 'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg'

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

	,	collapseElements: false
	});

	// Phone Specific
	if (screen_width < 768)
	{
		_.extend(application.Configuration, {
			collapseElements: true
		});
	}
	// Tablet Specific
	else if (screen_width >= 768 && screen_width <= 978)
	{
		_.extend(application.Configuration, {});
	}
	// Desktop Specific
	else
	{
		_.extend(application.Configuration, {});
	}

})(SC.Application('Checkout'));
