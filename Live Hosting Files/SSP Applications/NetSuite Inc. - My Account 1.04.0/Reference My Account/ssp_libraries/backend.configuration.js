//Backend Configuration file
SC.Configuration = {

	cache: {
		// SiteSettings.js caches all properties (except touchpoints) using the application cacche. By default this is set to two hours.
		// The following duration is in seconds and must be between 5 mins and 2 hours
		siteSettings: 2 * 60 * 60
	}

	// These type of items are the ones that cannot be assigned a
	// shipping address/method in multi ship-to and therefore
	// will be excluded in part of the logic.
,	non_shippable_types: ['GiftCert', 'Service']

,	order_checkout_field_keys: {
		'items': [
				'amount'
			,	'promotionamount'
			,	'promotiondiscount'
			,	'orderitemid'
			,	'quantity'
			,	'onlinecustomerprice_detail'
			,	'internalid'
			,	'rate'
			,	'rate_formatted'
			,	'options'
			,	'itemtype'
			,	'itemid'
			]
		,	'giftcertificates': null
		,	'shipaddress': null
		,	'billaddress': null
		,	'payment': null
		,	'summary': null
		,	'promocodes': null
		,	'shipmethod': null
		,	'shipmethods': null
		,	'agreetermcondition': null
		,	'purchasenumber': null
	}

,	order_shopping_field_keys: {
		'items': [
				'amount'
			,	'promotionamount'
			,	'promotiondiscount'
			,	'orderitemid'
			,	'quantity'
			,	'onlinecustomerprice_detail'
			,	'internalid'
			,	'options'
			,	'itemtype'
			,	'rate'
			,	'rate_formatted'
		]
		,	'shipaddress': null
		,	'summary': null
		,	'promocodes': null
	}

,	items_fields_advanced_name: 'order'

,	items_fields_standard_keys: [
			'canonicalurl'
		,	'displayname'
		,	'internalid'
		,	'itemid'
		,	'itemoptions_detail'
		,	'itemtype'
		,	'minimumquantity'
		,	'onlinecustomerprice_detail'
		,	'pricelevel1'
		,	'pricelevel1_formatted'
		,	'isinstock'
		,	'ispurchasable'
		,	'isbackorderable'
		,	'outofstockmessage'
		,	'stockdescription'
		,	'showoutofstockmessage'
		,	'storedisplayimage'
		,	'storedisplayname2'
		,	'storedisplaythumbnail'
	]

	// product reviews configuration
,	product_reviews: {
		// maxFlagsCount is the number at which a review is marked as flagged by users
		maxFlagsCount: 2
	,	loginRequired: false
		// the id of the flaggedStatus. If maxFlagsCount is reached, this will be its new status.
	,	flaggedStatus: 4
		// id of the approvedStatus
	,	approvedStatus: '2'
		// id of pendingApprovalStatus
	,	pendingApprovalStatus:	1
	,	resultsPerPage: 25
	}

	// Product lists configuration.
	// Note: for activating the "single list" user experience use additionEnabled==false && list_templates.length === 1
,	product_lists: {

		// can the user modify product lists ?  This is add new ones, edit and delete them.
		additionEnabled: true

		// must the user be logged in for the product list experience to be enabled ?
	,	loginRequired: true

		// Predefined lists, a.k.a templates:
		// Administrators can define predefined list of templates. New customers will have these template lists
		// by default. This lists will be of type=predefined and they cannot be modified/deleted.
		// Note: Associated record will be created only when the customer add some product to the list.
	,	list_templates: [
			{
				templateid: '1'
			,	name: 'My list'
			,	description: 'An example predefined list'
			,	scope: {
					id: '2'
				,	name: 'private'
				}
			}

		,	{
				templateid: '2'
			,	name: 'Saved for Later'
			,	description: 'This is for the cart saved for later items'
			,	scope: {
					id: '2'
				,	name: 'private'
				}
			,	type: {
					id: '2'
				,	name: 'later'
				}
			}
		]

		// display modalities for product list items.
	,	itemsDisplayOptions: [
			{id: 'list', name: 'List', macro: 'productListDisplayFull', columns: 1, icon: 'icon-th-list', isDefault: true}
		// ,	{id: 'table', name: 'Table', macro: 'itemCellTable', columns: 2, icon: 'icon-th-large'}
		// ,	{id: 'grid', name: 'Grid', macro: 'itemCellGrid', columns: 4, icon: 'icon-th'}
		,	{id: 'condensed', name: 'Condensed', macro: 'productListDisplayCondensed', columns: 1, icon: 'icon-th-condensed'}
		]
	}

	// Support Cases configuration
,	cases: {
		// Initial required default values.
		default_values:
		{
			// Status value used when submitting a new case.
			status_start: {
				id: '1'
			,	name: 'Not Started'
			}

			// Status value used when closing an existing case.
		,	status_close: {
				id: '5'
			,	name: 'Closed'
			}

			// Case origin
		,	origin: {
				id: '-5'
			,	name: 'Web'
			}
		}
	}

	// Quote configuration
,	quote: {
		// Days before the expiration of the quote
		days_to_expire: 7
	}

	// Return Authorization Configuration
,	returnAuthorizations: {
		// Cancel Return System Path
		cancelUrlRoot: 'https://system.netsuite.com'
		// cancelUrlRoot: 'https://system.f.netsuite.com'
		// cancelUrlRoot: 'https://system.na1.netsuite.com'
		// cancelUrlRoot: 'https://system.na1.beta.netsuite.com'
		// cancelUrlRoot: 'https://system.sandbox.netsuite.com'
	}

,	results_per_page: 20
,	checkout_skip_login: false
};
