// Configuration.js
// ----------------
// All of the applications configurable defaults
// Each section is comented with a title, please continue reading
(function (application)
{
	'use strict';

	application.Configuration = {};

	_.extend(application.Configuration, {

		// header_macro will show an image with the url you set here
		logoUrl: ''

		// depending on the application we are configuring, used by the NavigationHelper.js
	,	currentTouchpoint: 'customercenter'

		// list of the applications required modules to be loaded
		// de dependencies to be loaded for each module are handled by
		// [require.js](http://requirejs.org/)
	,	modules: [
			// ItemDetails should always be the 1st to be added
			// there will be routing problmes if you change it
			['ItemDetails',  {startRouter: false}]
		,	'Profile'
		,	['Cart', {startRouter: false}]
		,	['Address' , {startRouter: SC.ENVIRONMENT.siteSettings.is_logged_in}]
		,	'Content'
		,	['CreditCard', {startRouter: SC.ENVIRONMENT.siteSettings.is_logged_in}]
		,	'Facets.Model'
		,	'OrderHistory'
		,	'ReturnAuthorization'
		,	'OrderItem'
		,	'GoogleAnalytics'
		,	'GoogleUniversalAnalytics'
		,	'Receipt'
		,	'NavigationHelper'
		,	'Responsive'
		,	'AjaxRequestsKiller'
		,	'ErrorManagement'
		,	'Merchandising'
		,	'Case'
		]

		// Whats your Customer support url
	,	customerSupportURL: ''

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

		// Whats your return policy url.
		// If this is set to some value, a link to "Return Items" will appear on order details
		// eg: returnPolicyURL: '/s.nl/sc.5/.f'
	,	returnPolicyURL: ''

		// If you configure an object here it will display it in the index of my account
		// Ideal for promotions for clients
	,	homeBanners: [
			// {
			//	imageSource: "img/banner1.jpeg",
			//	linkUrl: "",
			//	linkTarget: ""
			// }
		]


		// options to be passed when querying the Search API
	,	searchApiMasterOptions: {
			Facets: {
				fieldset: 'search'
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
		}

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

		// Which template to render for the home view
		// We provide "home_tmpl" and "home_alt_tmpl"
	,	homeTemplate: 'home_tmpl'

		// When showing your credit cards, which icons should we use
	,	creditCardIcons: {
			'VISA - WEB': 'img/visa.png'
		,	'DISC -WEB': 'img/discover.png'
		,	'M/C - WEB': 'img/master.png'
		,	'Maestro': 'img/maestro.png'
		,	'AMEX -WEB': 'img/american.png'
		}

		// This object will be merged with specific pagination settings for each of the pagination calls
		// You can use it here to toggle settings for all pagination components
		// For information on the valid options check the pagination_macro.txt
	,	defaultPaginationSettings: {
			showPageList: true
		,	pagesToShow: 9
		,	showPageIndicator: false
		}
	,	filterRangeQuantityDays: 30
	,	is_basic: true
	,	facetDelimiters: {
			betweenFacetNameAndValue: '/'
		,	betweenDifferentFacets: '/'
		,	betweenDifferentFacetsValues: ','
		,	betweenRangeFacetsValues: 'to'
		,	betweenFacetsAndOptions: '?'
		,	betweenOptionNameAndValue: '='
		,	betweenDifferentOptions: '&'
		}
		// Output example: /brand/GT/style/Race,Street?display=table

		// eg: a different set of delimiters
		/*
		,	facetDelimiters: {
			,	betweenFacetNameAndValue: '-'
			,	betweenDifferentFacets: '/'
			,	betweenDifferentFacetsValues: '|'
			,	betweenRangeFacetsValues: '>'
			,	betweenFacetsAndOptions: '~'
			,	betweenOptionNameAndValue: '/'
			,	betweenDifferentOptions: '/'
		}
		*/
		// Output example: brand-GT/style-Race|Street~display/table

	,	collapseElements: false

		// Return Authorization configuration
	,	returnAuthorization: {

			reasons: [
				'Wrong Item Shipped'
			,	'Did not fit'
			,	'Quality did not meet my standards'
			,	'Not as pictured on the Website'
			,	'Damaged during shipping'
			,	'Changed my mind'
			,	'Item was defective'
			,	'Arrived too late'
			,	'Other (free text)'
			]
		}
	});

	// window.screen = false;
	// Calculates the width of the device, it will try to use the real screen size.
	var screen_width = (window.screen) ? window.screen.availWidth : window.outerWidth || window.innerWidth;

	// Phone Specific
	if (screen_width < 768)
	{
		_.extend(application.Configuration, {
			defaultPaginationSettings: {
				showPageList: false
			,	showPageIndicator: true
			}
		,	collapseElements: true
		});
	}
	// Tablet Specific
	else if (screen_width >= 768 && screen_width <= 1024)
	{
		_.extend(application.Configuration, {
			defaultPaginationSettings: {
				showPageList: true
			,	pagesToShow: 4
			,	showPageIndicator: false
			}
		});
	}
	// Desktop Specific
	else
	{
		_.extend(application.Configuration, {});
	}

})(SC.Application('MyAccount'));
