//Models.Init.js
// Init.js
// -------
// Global variables to be used accross models
// This is the head of combined file Model.js

/* exported container, session, settings, customer, context, order */
var container = nlapiGetWebContainer()
,	session = container.getShoppingSession()
//,	settings = session.getSiteSettings()
,	customer = session.getCustomer()
,	context = nlapiGetContext()
,	order = session.getOrder();

//Model.js
// SiteSettings.js
// ---------------
// Pre-processes the SiteSettings to be used on the site
Application.defineModel('SiteSettings', {

	cache: nlapiGetCache('Application')

	// cache duration time in seconds - by default 2 hours - this value can be between 5 mins and 2 hours
,	cacheTtl: SC.Configuration.cache.siteSettings

,	get: function ()
	{
		'use strict';

		var basic_settings = session.getSiteSettings(['siteid', 'touchpoints']);

		// cache name contains the siteid so each site has its own cache.
		var settings = this.cache.get('siteSettings-' + basic_settings.siteid);

		if (!settings || !this.cacheTtl) {

			var i
			,	countries
			,	shipToCountries;

			settings = session.getSiteSettings();

			// 'settings' is a global variable and contains session.getSiteSettings()
			if (settings.shipallcountries === 'F')
			{
				if (settings.shiptocountries)
				{
					shipToCountries = {};

					for (i = 0; i < settings.shiptocountries.length; i++)
					{
						shipToCountries[settings.shiptocountries[i]] = true;
					}
				}
			}

			// Get all available countries.
			var allCountries = session.getCountries();

			if (shipToCountries)
			{
				// Remove countries that are not in the shipping contuntires
				countries = {};

				for (i = 0; i < allCountries.length; i++)
				{
					if (shipToCountries[allCountries[i].code])
					{
						countries[allCountries[i].code] = allCountries[i];
					}
				}
			}
			else
			{
				countries = {};

				for (i = 0; i < allCountries.length; i++)
				{
					countries[allCountries[i].code] = allCountries[i];
				}
			}

			// Get all the states for countries.
			var allStates = session.getStates();

			if (allStates)
			{
				for (i = 0; i < allStates.length; i++)
				{
					if (countries[allStates[i].countrycode])
					{
						countries[allStates[i].countrycode].states = allStates[i].states;
					}
				}
			}

			// Adds extra information to the site settings
			settings.countries = countries;
			settings.phoneformat = context.getPreference('phoneformat');
			settings.minpasswordlength = context.getPreference('minpasswordlength');
			settings.campaignsubscriptions = context.getFeature('CAMPAIGNSUBSCRIPTIONS');
			settings.analytics.confpagetrackinghtml = _.escape(settings.analytics.confpagetrackinghtml);

			// Other settings that come in window object
			settings.groupseparator = window.groupseparator;
			settings.decimalseparator = window.decimalseparator;
			settings.negativeprefix = window.negativeprefix;
			settings.negativesuffix = window.negativesuffix;
			settings.dateformat = window.dateformat;
			settings.longdateformat = window.longdateformat;
			settings.isMultiShippingRoutesEnabled = context.getSetting('FEATURE', 'MULTISHIPTO') === 'T' && SC.Configuration.isMultiShippingEnabled;

			this.cache.put('siteSettings-' + settings.siteid, JSON.stringify(settings), this.cacheTtl);
		}
		else
		{
			settings = JSON.parse(settings);
		}

		// never cache the following:
		settings.is_logged_in = session.isLoggedIn();
		settings.touchpoints = basic_settings.touchpoints;
		settings.shopperCurrency = session.getShopperCurrency();

		// delete unused fields
		delete settings.entrypoints;

		return settings;
	}
});

//Model.js
// Address.js
// ----------
// Handles fetching, creating and updating addresses
Application.defineModel('Address', {

	// model validation
	validation: {
		addressee: {required: true, msg: 'Full Name is required'}
	,	addr1: {required: true, msg: 'Address is required'}
	,	country: {required: true, msg: 'Country is required'}
	,	state: function (value, attr, computedState)
		{
			'use strict';

			var selected_country = computedState.country;

			if (selected_country && session.getStates([selected_country]) && !value)
			{
				return 'State is required';
			}
		}
	,	city: {required: true, msg: 'City is required'}
	,	zip: function (value, attr, computedState)
		{
			'use strict';

			var selected_country = computedState.country
			,	countries = session.getCountries();

			if (!selected_country && !value || selected_country && countries[selected_country] && countries[selected_country].isziprequired === 'T' && !value)
			{
				return 'State is required';
			}
		}
	,	phone: {required: true, msg: 'Phone Number is required'}
	}

// our model has "fullname" and "company" insted of  the fields "addresse" and "attention" used on netsuite.
// this function prepare the address object for sending it to the frontend
,	wrapAddressee: function (address)
	{
		'use strict';

		if (address.attention && address.addressee)
		{
			address.fullname = address.attention;
			address.company = address.addressee;
		}
		else
		{
			address.fullname = address.addressee;
			address.company = null;
		}

		delete address.attention;
		delete address.addressee;

		return address;
	}

// this function prepare the address object for sending it to the frontend
,	unwrapAddressee: function (address)
	{
		'use strict';

		if (address.company)
		{
			address.attention = address.fullname;
			address.addressee = address.company;
		}
		else
		{
			address.addressee = address.fullname;
			address.attention = null;
		}

		delete address.fullname;
		delete address.company;
		delete address.check;

		return address;
	}

// return an address by id
,	get: function (id)
	{
		'use strict';

		return this.wrapAddressee(customer.getAddress(id));
	}

// return default billing address
,	getDefaultBilling: function ()
	{
		'use strict';

		return _.find(customer.getAddressBook(), function (address)
		{
			return (address.defaultbilling === 'T');
		});
	}

// return default shipping address
,	getDefaultShipping: function ()
	{
		'use strict';

		return _.find(customer.getAddressBook(), function (address)
		{
			return address.defaultshipping === 'T';
		});
	}

// returns all user's addresses
,	list: function ()
	{
		'use strict';

		var self = this;

		return  _.map(customer.getAddressBook(), function (address)
		{
			return self.wrapAddressee(address);
		});
	}

// update an address
,	update: function (id, data)
	{
		'use strict';

		data = this.unwrapAddressee(data);

		// validate the model
		this.validate(data);
		data.internalid = id;

		return customer.updateAddress(data);
	}

// add a new address to a customer
,	create: function (data)
	{
		'use strict';

		data = this.unwrapAddressee(data);
		// validate the model
		this.validate(data);

		return customer.addAddress(data);
	}

// remove an address
,	remove: function (id)
	{
		'use strict';

		return customer.removeAddress(id);
	}
});

//Model.js
// Profile.js
// ----------------
// This file define the functions to be used on profile service
Application.defineModel('Profile', {
	
	validation: {
		firstname: {required: true, msg: 'First Name is required'}
	
	// This code is commented temporally, because of the inconsistences between Checkout and My Account regarding the require data from profile information (Checkout can miss last name)
	,	lastname: {required: true, msg: 'Last Name is required'}

	,	email: {required: true, pattern: 'email', msg: 'Email is required'}
	,	confirm_email: {equalTo: 'email', msg: 'Emails must match'}
	}
	
,	get: function ()
	{
		'use strict';

		var profile = {};
		
		//Only can you get the profile information if you are logged in.
		if (session.isLoggedIn()) {

			//Define the fields to be returned
			this.fields = this.fields || ['isperson', 'email', 'internalid', 'name', 'overduebalance', 'phoneinfo', 'companyname', 'firstname', 'lastname', 'middlename', 'emailsubscribe', 'campaignsubscriptions', 'paymentterms', 'creditlimit', 'balance', 'creditholdoverride'];

			profile = customer.getFieldValues(this.fields);

			//Make some attributes more friendly to the response
			profile.phone = profile.phoneinfo.phone;
			profile.altphone = profile.phoneinfo.altphone;
			profile.fax = profile.phoneinfo.fax;
			profile.priceLevel = (session.getShopperPriceLevel().internalid) ? session.getShopperPriceLevel().internalid : session.getSiteSettings(['defaultpricelevel']).defaultpricelevel;
			profile.type = profile.isperson ? 'INDIVIDUAL' : 'COMPANY';
			profile.isGuest = session.getCustomer().isGuest() ? 'T' : 'F';
			
			profile.creditlimit = parseFloat(profile.creditlimit || 0);
			profile.creditlimit_formatted = formatCurrency(profile.creditlimit);

			profile.balance = parseFloat(profile.balance || 0);
			profile.balance_formatted = formatCurrency(profile.balance);

			profile.balance_available = profile.creditlimit - profile.balance;
			profile.balance_available_formatted = formatCurrency(profile.balance_available);
		}

		return profile;
	}
	
,	update: function (data)
	{
		'use strict';
		
		var login = nlapiGetLogin();

		if (data.current_password && data.password && data.password === data.confirm_password)
		{
			//Updating password
			return login.changePassword(data.current_password, data.password);
		}

		this.currentSettings = customer.getFieldValues();
		
		//Define the customer to be updated

		var customerUpdate = {
			internalid: parseInt(nlapiGetUser(), 10)
		};

		//Assign the values to the customer to be updated

		customerUpdate.firstname = data.firstname;
		
		if(data.lastname !== '')
		{
			customerUpdate.lastname = data.lastname;
		}

		if(this.currentSettings.lastname === data.lastname)
		{
			delete this.validation.lastname;
		}
	
		customerUpdate.companyname = data.companyname;
		

		customerUpdate.phoneinfo = {
				altphone: data.altphone
			,	phone: data.phone
			,	fax: data.fax
		};
		
		if(data.phone !== '')
		{
			customerUpdate.phone = data.phone;
		}

		if(this.currentSettings.phone === data.phone)
		{
			delete this.validation.phone;
		}
		
		customerUpdate.emailsubscribe = (data.emailsubscribe && data.emailsubscribe !== 'F') ? 'T' : 'F';
		
		if (!(this.currentSettings.companyname === '' || this.currentSettings.isperson || session.getSiteSettings(['registration']).registration.companyfieldmandatory !== 'T'))
		{
			this.validation.companyname = {required: true, msg: 'Company Name is required'};
		}
		
		if (!this.currentSettings.isperson)
		{
			delete this.validation.firstname;
			delete this.validation.lastname;
		}
		
		//Updating customer data
		if (data.email && data.email !== this.currentSettings.email && data.email === data.confirm_email)
		{
			if(data.isGuest === 'T')
			{
				customerUpdate.email = data.email;
			}
			else
			{
				login.changeEmail(data.current_password, data.email, true);
			}
		}

		// Patch to make the updateProfile call work when the user is not updating the email
		data.confirm_email = data.email;
		
		this.validate(data);
		// check if this throws error
		customer.updateProfile(customerUpdate);
		
		if (data.campaignsubscriptions)
		{
			customer.updateCampaignSubscriptions(data.campaignsubscriptions);
		}
		
		return this.get();
		
	}
});

//Model.js
// PlacedOrder.js
// ----------
// Handles fetching orders
Application.defineModel('PlacedOrder', {

	list: function (data)
	{
		'use strict';

		data = data || {};
		// if the store has multiple currencies we add the currency column to the query
		var	isMultiCurrency = context.getFeature('MULTICURRENCY')
		,	total_field = isMultiCurrency ? 'fxamount' : 'total'
		,	filters = [
				new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			,	new nlobjSearchFilter('mainline', null, 'is', 'T')
			]
		,	columns = [
				new nlobjSearchColumn('internalid')
			,	new nlobjSearchColumn('trackingnumbers')
			,	new nlobjSearchColumn('trandate')
			,	new nlobjSearchColumn('tranid')
			,	new nlobjSearchColumn('status')
			,	new nlobjSearchColumn(total_field)
			];

		if (isMultiCurrency)
		{
			columns.push(new nlobjSearchColumn('currency'));
		}

		// if the site is multisite we add the siteid to the search filter
		if (context.getFeature('MULTISITE') && session.getSiteSettings(['siteid']).siteid)
		{
			filters.push(new nlobjSearchFilter('website', null, 'anyof', [session.getSiteSettings(['siteid']).siteid,'@NONE@']));
		}


		if (data.from && data.to)
		{
			var offset = new Date().getTimezoneOffset() * 60 * 1000;

			filters.push(new nlobjSearchFilter('trandate', null, 'within', new Date(parseInt(data.from, 10) + offset), new Date(parseInt(data.to, 10) + offset)));
		}

		switch (data.sort)
		{
			case 'number':
				columns[3].setSort(data.order > 0);
			break;

			case 'amount':
				columns[5].setSort(data.order > 0);
			break;

			default:
				columns[2].setSort(data.order > 0);
				columns[0].setSort(data.order > 0);
		}

		var result = Application.getPaginatedSearchResults({
				record_type: 'salesorder'
			,	filters: filters
			,	columns: columns
			,	page: data.page || 1
			,	results_per_page : data.results_per_page
			});

		result.records = _.map(result.records || [], function (record)
		{
			return {
				internalid: record.getValue('internalid')
			,	date: record.getValue('trandate')
			,	order_number: record.getValue('tranid')
			,	status: record.getText('status')
			,	summary: {
					total: toCurrency(record.getValue(total_field))
				,	total_formatted: formatCurrency(record.getValue(total_field))
				}
				// we might need to change that to the default currency
			,	currency: isMultiCurrency ? {internalid: record.getValue('currency'), name: record.getText('currency')} : null
				// Normalizes tracking number's values
			,	trackingnumbers: record.getValue('trackingnumbers') ? record.getValue('trackingnumbers').split('<BR>') : null
			,	type: record.getRecordType()
			};
		});

		return result;
	}

,	get: function (id)
	{
		'use strict';

		var placed_order = nlapiLoadRecord('salesorder', id)
		,	result = this.createResult(placed_order);

		this.setAddresses(placed_order, result);
		this.setShippingMethods(placed_order, result);
		this.setLines(placed_order, result);
		this.setFulfillments(id, result);
		this.setPaymentMethod(placed_order, result);
		this.setReceipts(result, placed_order);
		this.setReturnAuthorizations(result, placed_order);

		result.promocode = (placed_order.getFieldValue('promocode')) ? {
			internalid: placed_order.getFieldValue('promocode')
		,	name: placed_order.getFieldText('promocode')
		,	code: placed_order.getFieldText('couponcode')
		} : null;

		// convert the obejcts to arrays
		result.addresses = _.values(result.addresses);
		result.shipmethods = _.values(result.shipmethods);
		result.lines = _.values(result.lines);
		result.receipts = _.values(result.receipts);

		return result;
	}

,	setPaymentMethod: function (placed_order, result)
	{
		'use strict';

		return setPaymentMethodToResult(placed_order, result);
	}

,	createResult: function (placed_order)
	{
		'use strict';

		return {
			internalid: placed_order.getId()
		,	type: placed_order.getRecordType()
		,	trantype: placed_order.getFieldValue('type')
		,	order_number: placed_order.getFieldValue('tranid')
		,	purchasenumber: placed_order.getFieldValue('otherrefnum')
		,	dueDate: placed_order.getFieldValue('duedate')
		,	amountDue: toCurrency(placed_order.getFieldValue('amountremainingtotalbox'))
		,	amountDue_formatted: formatCurrency(placed_order.getFieldValue('amountremainingtotalbox'))
		,	memo: placed_order.getFieldValue('memo')
		,   date: placed_order.getFieldValue('trandate')
		,   status: placed_order.getFieldValue('status')
		,	isReturnable: this.isReturnable(placed_order)
		,	summary: {
				subtotal: toCurrency(placed_order.getFieldValue('subtotal'))
			,	subtotal_formatted: formatCurrency(placed_order.getFieldValue('subtotal'))

			,	taxtotal: toCurrency(placed_order.getFieldValue('taxtotal'))
			,	taxtotal_formatted: formatCurrency(placed_order.getFieldValue('taxtotal'))

			,	tax2total: toCurrency(0)
			,	tax2total_formatted: formatCurrency(0)

			,	shippingcost: toCurrency(placed_order.getFieldValue('shippingcost'))
			,	shippingcost_formatted: formatCurrency(placed_order.getFieldValue('shippingcost'))

			,	handlingcost: toCurrency(placed_order.getFieldValue('althandlingcost'))
			,	handlingcost_formatted: formatCurrency(placed_order.getFieldValue('althandlingcost'))

			,	estimatedshipping: 0
			,	estimatedshipping_formatted: formatCurrency(0)

			,	taxonshipping: toCurrency(0)
			,	taxonshipping_formatted: formatCurrency(0)

			,	discounttotal: toCurrency(placed_order.getFieldValue('discounttotal'))
			,	discounttotal_formatted: formatCurrency(placed_order.getFieldValue('discounttotal'))

			,	taxondiscount: toCurrency(0)
			,	taxondiscount_formatted: formatCurrency(0)

			,	discountrate: toCurrency(0)
			,	discountrate_formatted: formatCurrency(0)

			,	discountedsubtotal: toCurrency(0)
			,	discountedsubtotal_formatted: formatCurrency(0)

			,	giftcertapplied: toCurrency(placed_order.getFieldValue('giftcertapplied'))
			,	giftcertapplied_formatted: formatCurrency(placed_order.getFieldValue('giftcertapplied'))

			,	total: toCurrency(placed_order.getFieldValue('total'))
			,	total_formatted: formatCurrency(placed_order.getFieldValue('total'))
			}

		,	currency: context.getFeature('MULTICURRENCY') ?
			{
				internalid: placed_order.getFieldValue('currency')
			,	name: placed_order.getFieldValue('currencyname')
			} : null
		};
	}

,	isReturnable: function (placed_order)
	{
		'use strict';

		var status_id = placed_order.getFieldValue('statusRef');

		return status_id !== 'pendingFulfillment' && status_id !== 'pendingApproval' && status_id !== 'closed';
	}

,	setFulfillments: function (createdfrom, result)
	{
		'use strict';

		var self = this

		,	filters = [
				new nlobjSearchFilter('createdfrom', null, 'is', createdfrom)
			,	new nlobjSearchFilter('cogs', null, 'is', 'F')
			,	new nlobjSearchFilter('shipping', null, 'is', 'F')
			,	new nlobjSearchFilter('shiprecvstatusline', null, 'is', 'F')
			]

		,	columns = [
				new nlobjSearchColumn('quantity')
			,	new nlobjSearchColumn('item')
			,	new nlobjSearchColumn('shipaddress')
			,	new nlobjSearchColumn('shipmethod')
			,	new nlobjSearchColumn('shipto')
			,	new nlobjSearchColumn('trackingnumbers')
			,	new nlobjSearchColumn('trandate')
			,	new nlobjSearchColumn('status')

				// Ship Address
			,	new nlobjSearchColumn('shipaddress')
			,	new nlobjSearchColumn('shipaddress1')
			,	new nlobjSearchColumn('shipaddress2')
			,	new nlobjSearchColumn('shipaddressee')
			,	new nlobjSearchColumn('shipattention')
			,	new nlobjSearchColumn('shipcity')
			,	new nlobjSearchColumn('shipcountry')
			,	new nlobjSearchColumn('shipstate')
			,	new nlobjSearchColumn('shipzip')
			]

		,	fulfillments = Application.getAllSearchResults('itemfulfillment', filters, columns)

		,	fulfillment_id = [];

		result.fulfillments = {};

		fulfillments.forEach(function (ffline)
		{
			if (ffline.getValue('status') === 'shipped')
			{
				var shipaddress = self.addAddress({
					internalid: ffline.getValue('shipaddress')
				,	country: ffline.getValue('shipcountry')
				,	state: ffline.getValue('shipstate')
				,	city: ffline.getValue('shipcity')
				,	zip: ffline.getValue('shipzip')
				,	addr1: ffline.getValue('shipaddress1')
				,	addr2: ffline.getValue('shipaddress2')
				,	attention: ffline.getValue('shipattention')
				,	addressee: ffline.getValue('shipaddressee')
				}, result);

				result.fulfillments[ffline.getId()] = result.fulfillments[ffline.getId()] || {
					internalid: ffline.getId()
				,	shipaddress: shipaddress
				,	shipmethod: {
						internalid : ffline.getValue('shipmethod')
					,	name : ffline.getText('shipmethod')
					}
				,	date: ffline.getValue('trandate')
				,	trackingnumbers: ffline.getValue('trackingnumbers') ? ffline.getValue('trackingnumbers').split('<BR>') : null
				,	lines: []
				};

				result.fulfillments[ffline.getId()].lines.push({
					item_id: ffline.getValue('item')
				,	quantity: ffline.getValue('quantity')
				,	rate: 0
				,	rate_formatted: formatCurrency(0)
				});

				fulfillment_id.push(ffline.getId());
			}
		});

		if (fulfillment_id.length)
		{
			filters = [
				new nlobjSearchFilter('internalid', null, 'anyof', createdfrom)
			,	new nlobjSearchFilter('fulfillingtransaction', null, 'anyof', fulfillment_id)
			];

			columns = [
				new nlobjSearchColumn('line')
			,	new nlobjSearchColumn('item')
			,	new nlobjSearchColumn('rate')
			,	new nlobjSearchColumn('fulfillingtransaction')
			];

			Application.getAllSearchResults('salesorder', filters, columns).forEach(function (line)
			{
				var foundline = _.find(result.fulfillments[line.getValue('fulfillingtransaction')].lines, function (ffline)
				{
					return ffline.item_id === line.getValue('item') && !ffline.line_id;
				});

				foundline.line_id = result.internalid + '_' + line.getValue('line');
				foundline.rate = parseFloat(line.getValue('rate')) * foundline.quantity;
				foundline.rate_formatted = formatCurrency(foundline.rate);
				delete foundline.item_id;
			});
		}

		result.fulfillments = _.values(result.fulfillments);
	}

,	setLines: function (placed_order, result)
	{
		'use strict';

		result.lines = {};
		var items_to_preload = []
		,	amount;

		for (var i = 1; i <= placed_order.getLineItemCount('item'); i++) {

			if (placed_order.getLineItemValue('item', 'itemtype', i) === 'Discount' && placed_order.getLineItemValue('item', 'discline', i))
			{
				var discline = placed_order.getLineItemValue('item', 'discline', i);

				amount = Math.abs(parseFloat(placed_order.getLineItemValue('item', 'amount', i)));

				result.lines[discline].discount = (result.lines[discline].discount) ? result.lines[discline].discount + amount : amount;
				result.lines[discline].total = result.lines[discline].amount + result.lines[discline].tax_amount - result.lines[discline].discount;
			}
			else
			{
				var rate = toCurrency(placed_order.getLineItemValue('item', 'rate', i))
				,	item_id = placed_order.getLineItemValue('item', 'item', i)
				,	item_type = placed_order.getLineItemValue('item', 'itemtype', i);

				amount = toCurrency(placed_order.getLineItemValue('item', 'amount', i));

				var	tax_amount = toCurrency(placed_order.getLineItemValue('item', 'tax1amt', i)) || 0
				,	total = amount + tax_amount;

				result.lines[placed_order.getLineItemValue('item', 'line', i)] = {
					internalid: placed_order.getLineItemValue('item', 'id', i)
				,   quantity: parseInt(placed_order.getLineItemValue('item', 'quantity', i), 10)

				,   rate: rate

				,   amount: amount

				,	tax_amount: tax_amount
				,	tax_rate: placed_order.getLineItemValue('item', 'taxrate1', i)
				,	tax_code: placed_order.getLineItemValue('item', 'taxcode_display', i)
				,	isfulfillable: placed_order.getLineItemValue('item', 'fulfillable', i) === 'T'

				,	discount: 0

				,	total: total

				,	item: item_id
				,	type: item_type
				,   options: getItemOptionsObject(placed_order.getLineItemValue('item', 'options', i))
				,   shipaddress: placed_order.getLineItemValue('item', 'shipaddress', i) ? result.listAddresseByIdTmp[placed_order.getLineItemValue('item', 'shipaddress', i)] : null
				,   shipmethod:  placed_order.getLineItemValue('item', 'shipmethod', i) || null
				};

				items_to_preload[item_id] = {
					id: item_id
				,	type: item_type
				};
			}

		}

		// Preloads info about the item
		this.store_item = Application.getModel('StoreItem');

		items_to_preload = _.values(items_to_preload);

		this.store_item.preloadItems(items_to_preload);

		// The api wont bring disabled items so we need to query them directly
		var items_to_query = []
		,	self = this;

		_.each(result.lines, function (line)
		{
			if (line.item)
			{
				var item = self.store_item.get(line.item, line.type);
				if (!item || typeof item.itemid === 'undefined')
				{
					items_to_query.push(line.item);
				}
			}
		});

		if (items_to_query.length > 0)
		{
			var filters = [
					new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
				,	new nlobjSearchFilter('internalid', null, 'is', result.internalid)
				,	new nlobjSearchFilter('internalid', 'item', 'anyof', items_to_query)
				]

			,	columns = [
					new nlobjSearchColumn('internalid', 'item')
				,	new nlobjSearchColumn('type', 'item')
				,	new nlobjSearchColumn('parent', 'item')
				,	new nlobjSearchColumn('displayname', 'item')
				,	new nlobjSearchColumn('storedisplayname', 'item')
				,	new nlobjSearchColumn('itemid', 'item')
				]

			,	inactive_items_search = Application.getAllSearchResults('transaction', filters, columns);

			_.each(inactive_items_search, function (item)
			{
				var inactive_item = {
					internalid: item.getValue('internalid', 'item')
				,	type: item.getValue('type', 'item')
				,	displayname: item.getValue('displayname', 'item')
				,	storedisplayname: item.getValue('storedisplayname', 'item')
				,	itemid: item.getValue('itemid', 'item')
				};

				self.store_item.set(inactive_item);
			});
		}

		result.lines = _.values(result.lines);

		_.each(result.lines, function (line)
		{
			line.rate_formatted = formatCurrency(line.rate);
			line.amount_formatted = formatCurrency(line.amount);
			line.tax_amount_formatted = formatCurrency(line.tax_amount);
			line.discount_formatted = formatCurrency(line.discount);
			line.total_formatted = formatCurrency(line.total);
			line.item = self.store_item.get(line.item, line.type);
		});

		// remove the temporary address list by id
		delete result.listAddresseByIdTmp;
	}

,	setShippingMethods: function (placed_order, result)
	{
		'use strict';
		result.shipmethods = {};

		if (placed_order.getLineItemCount('shipgroup') <= 0)
		{
			result.shipmethods[placed_order.getFieldValue('shipmethod')] = {
				internalid: placed_order.getFieldValue('shipmethod')
			,	name: placed_order.getFieldText('shipmethod')
			,	rate: toCurrency(placed_order.getFieldValue('shipping_rate'))
			,	rate_formatted: formatCurrency(placed_order.getFieldValue('shipping_rate'))
			,	shipcarrier: placed_order.getFieldValue('carrier')
			};
		}

		for (var i = 1; i <= placed_order.getLineItemCount('shipgroup') ; i++)
		{
			result.shipmethods[placed_order.getLineItemValue('shipgroup', 'shippingmethodref', i)] = {
				internalid: placed_order.getLineItemValue('shipgroup', 'shippingmethodref', i)
			,    name: placed_order.getLineItemValue('shipgroup', 'shippingmethod', i)
			,    rate: toCurrency(placed_order.getLineItemValue('shipgroup', 'shippingrate', i))
			,    rate_formatted: formatCurrency(placed_order.getLineItemValue('shipgroup', 'shippingrate', i))
			,    shipcarrier: placed_order.getLineItemValue('shipgroup', 'shippingcarrier', i)
			};

		}

		result.shipmethod = placed_order.getFieldValue('shipmethod');
	}

,	addAddress: function (address, result)
	{
		'use strict';
		result.addresses = result.addresses || {};

		address.fullname = (address.attention) ? address.attention : address.addressee;
		address.company = (address.attention) ? address.addressee : null;

		delete address.attention;
		delete address.addressee;

		address.internalid =	(address.country || '')  + '-' +
								(address.state || '') + '-' +
								(address.city || '') + '-' +
								(address.zip || '') + '-' +
								(address.addr1 || '') + '-' +
								(address.addr2 || '') + '-' +
								(address.fullname || '') + '-' +
								(address.company || '');

		address.internalid = address.internalid.replace(/\s/g, '-');

		if (!result.addresses[address.internalid])
		{
			result.addresses[address.internalid] = address;
		}

		return address.internalid;
	}

,	setAddresses: function (placed_order, result)
	{
		'use strict';
		result.addresses = {};
		result.listAddresseByIdTmp ={};
		for (var i = 1; i <= placed_order.getLineItemCount('iladdrbook') ; i++)
		{
			// Adds all the addresses in the address book
			result.listAddresseByIdTmp[placed_order.getLineItemValue('iladdrbook', 'iladdrinternalid', i)] = this.addAddress({
				internalid: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddr', i)
			,	country: placed_order.getLineItemValue('iladdrbook', 'iladdrshipcountry', i)
			,	state: placed_order.getLineItemValue('iladdrbook', 'iladdrshipstate', i)
			,	city: placed_order.getLineItemValue('iladdrbook', 'iladdrshipcity', i)
			,	zip: placed_order.getLineItemValue('iladdrbook', 'iladdrshipzip', i)
			,	addr1: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddr1', i)
			,	addr2: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddr2', i)
			,	attention: placed_order.getLineItemValue('iladdrbook', 'iladdrshipattention', i)
			,	addressee: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddressee', i)
			}, result);
		}

		// Adds Bill Address
		result.billaddress = this.addAddress({
			internalid: placed_order.getFieldValue('billaddress')
		,	country: placed_order.getFieldValue('billcountry')
		,	state: placed_order.getFieldValue('billstate')
		,	city: placed_order.getFieldValue('billcity')
		,	zip: placed_order.getFieldValue('billzip')
		,	addr1: placed_order.getFieldValue('billaddr1')
		,	addr2: placed_order.getFieldValue('billaddr2')
		,	attention: placed_order.getFieldValue('billattention')
		,	addressee: placed_order.getFieldValue('billaddressee')
		}, result);

		// Adds Shipping Address
		result.shipaddress = (placed_order.getFieldValue('shipaddress')) ? this.addAddress({
			internalid: placed_order.getFieldValue('shipaddress')
		,	country: placed_order.getFieldValue('shipcountry')
		,	state: placed_order.getFieldValue('shipstate')
		,	city: placed_order.getFieldValue('shipcity')
		,	zip: placed_order.getFieldValue('shipzip')
		,	addr1: placed_order.getFieldValue('shipaddr1')
		,	addr2: placed_order.getFieldValue('shipaddr2')
		,	attention: placed_order.getFieldValue('shipattention')
		,	addressee: placed_order.getFieldValue('shipaddressee')
		}, result) : null;
	}

,	setReceipts: function (result)
	{
		'use strict';

		result.receipts = Application.getModel('Receipts').list({
			orderid: result.internalid
		});

		return this;
	}

,	setReturnAuthorizations: function (result)
	{
		'use strict';

		result.returnauthorizations = Application.getModel('ReturnAuthorization').list({
			createdfrom: result.internalid
		});

		return this;
	}
});


//Model.js
Application.defineModel('ReturnAuthorization', {

	validation: {}

,	get: function (id)
	{
		'use strict';

		var is_multicurrency = context.getFeature('MULTICURRENCY')
		,	amount_field = is_multicurrency ? 'fxamount' : 'amount'

		,	filters = [
				new nlobjSearchFilter('internalid', null, 'is', id)
			]

		,	columns = [
				// Basic info
				new nlobjSearchColumn('mainline')
			,	new nlobjSearchColumn('trandate')
			,	new nlobjSearchColumn('status')
			,	new nlobjSearchColumn('tranid')
			,	new nlobjSearchColumn('memo')

				// Summary
			,	new nlobjSearchColumn('total')
			,	new nlobjSearchColumn('taxtotal')			
			,	new nlobjSearchColumn('shippingamount')

				// Created from
			,	new nlobjSearchColumn('internalid', 'createdfrom')
			,	new nlobjSearchColumn('tranid', 'createdfrom')
			,	new nlobjSearchColumn('type', 'createdfrom')

				// Items
			,	new nlobjSearchColumn('internalid', 'item')
			,	new nlobjSearchColumn('type', 'item')
			,	new nlobjSearchColumn('quantity')
			,	new nlobjSearchColumn('options')
			,	new nlobjSearchColumn(amount_field)
			,	new nlobjSearchColumn('rate')
			];

		if (is_multicurrency)
		{
			columns.push(new nlobjSearchColumn('currency'));
		}

		var return_authorizations = Application.getAllSearchResults('returnauthorization', filters, columns)
		,	main_return_authorization = _.find(return_authorizations, function (return_authorization)
			{
				return return_authorization.getValue('mainline') === '*';
			});

		return {
			internalid: main_return_authorization.getId()
		,	type: main_return_authorization.getRecordType()

		,	date: main_return_authorization.getValue('trandate')
		,	tranid: main_return_authorization.getValue('tranid')
		,	comment: main_return_authorization.getValue('memo')

		,	status: {
				id: main_return_authorization.getValue('status')
			,	label: main_return_authorization.getText('status')
			}

		,	isCancelable: this.isCancelable(main_return_authorization)
		,	createdfrom: this.getCreatedFrom(return_authorizations)
		,	summary: this.getSummary(main_return_authorization)
		,	lines: this.getLines(return_authorizations)
		};
	}

,	isCancelable: function (record)
	{
		'use strict';

		return record.getValue('status') === 'pendingApproval';
	}

,	getCreatedFrom: function (records)
	{
		'use strict';

		var created_from = _.find(records, function (return_authorization)
		{
			return return_authorization.getValue('internalid', 'createdfrom');
		});

		if (created_from)
		{
			return {
				internalid: created_from.getValue('internalid', 'createdfrom')
			,	tranid: created_from.getValue('tranid', 'createdfrom')
			,	type: created_from.getValue('type', 'createdfrom')
			};
		}
	}

,	getLines: function (records)
	{
		'use strict';

		var result_lines = []
		,	items_to_query = []
		,	items_to_preload = {}
		,	amount_field = context.getFeature('MULTICURRENCY') ? 'fxamount' : 'amount'
		,	returnable_item_types = ['InvtPart', 'NonInvtPart', 'Kit']
		,	main_return_authorization = _.find(records, function (return_authorization)
			{
				return return_authorization.getValue('mainline') === '*';
			})

		,	loaded_lines = _.filter(records, function (line)
			{
				// Sales Tax Group have negative internal ids. Only valid returnable items should be shown.
				return parseInt(line.getValue('internalid', 'item'), 10) > 0 && _.contains(returnable_item_types, line.getValue('type', 'item'));
			})

		,	store_item = Application.getModel('StoreItem');

		_.each(loaded_lines, function (record)
		{
			var amount = record.getValue(amount_field)
			,	rate = record.getValue('rate')
			,	item_id = record.getValue('internalid', 'item')
			,	item_type = record.getValue('type', 'item');

			items_to_preload[item_id] = {
				id: item_id
			,	type: item_type
			};

			result_lines.push({
				// As we are returning the item, the quantity is negative
				// don't want to show that to the customer.
				quantity: Math.abs(record.getValue('quantity'))
			,	options: getItemOptionsObject(record.getValue('options'))

			,	item: item_id
			,	type: item_type

			,	reason: record.getValue('memo')

			,	amount: toCurrency(amount)
			,	amount_formatted: formatCurrency(amount)

			,	rate: toCurrency(rate)
			,	rate_formatted: formatCurrency(rate)
			});
		});

		items_to_preload = _.values(items_to_preload);
		store_item.preloadItems(items_to_preload);


		_.each(result_lines, function (line)
		{
			if (line.item)
			{
				var item = store_item.get(line.item, line.type);
				if (!item || typeof item.itemid === 'undefined')
				{
					items_to_query.push(line.item);
				}
			}
		});

		if (items_to_query.length > 0)
		{
			var filters = [
					new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
				,	new nlobjSearchFilter('internalid', null, 'is', main_return_authorization.getId())
				,	new nlobjSearchFilter('internalid', 'item', 'anyof', items_to_query)
				]

			,	columns = [
					new nlobjSearchColumn('internalid', 'item')
				,	new nlobjSearchColumn('type', 'item')
				,	new nlobjSearchColumn('parent', 'item')
				,	new nlobjSearchColumn('displayname', 'item')
				,	new nlobjSearchColumn('storedisplayname', 'item')
				,	new nlobjSearchColumn('itemid', 'item')
				]

			,	inactive_items_search = Application.getAllSearchResults('transaction', filters, columns);

			_.each(inactive_items_search, function (item)
			{
				var inactive_item = {
					internalid: item.getValue('internalid', 'item')
				,	type: item.getValue('type', 'item')
				,	displayname: item.getValue('displayname', 'item')
				,	storedisplayname: item.getValue('storedisplayname', 'item')
				,	itemid: item.getValue('itemid', 'item')
				};

				store_item.set(inactive_item);
			});
		}

		_.each(result_lines, function (line)
		{
			line.item = store_item.get(line.item, line.type);
		});

		return result_lines;
	}

,	getSummary: function (record)
	{
		'use strict';

		var total = record.getValue('total')
		,	taxtotal = record.getValue('taxtotal')
		,	shipping = record.getValue('shippingamount');

		return {
			total: toCurrency(total)
		,	total_formatted: formatCurrency(total)

		,	taxtotal: toCurrency(taxtotal)
		,	taxtotal_formatted: formatCurrency(taxtotal)

		,	shippingamount: toCurrency(shipping)
		,	shippingamount_formatted: formatCurrency(shipping)

		,	currency: context.getFeature('MULTICURRENCY') ? {
				internalid: record.getValue('currency')
			,	name: record.getText('currency')
			} : null
		};
	}

,	update: function (id, data, headers)
	{
		'use strict';

		if (data.status === 'cancelled')
		{
			nlapiRequestURL(SC.Configuration.returnAuthorizations.cancelUrlRoot + '/app/accounting/transactions/returnauthmanager.nl?type=cancel&id=' + id, null, headers);
		}
	}

,	create: function (data)
	{
		'use strict';

		var return_authorization = nlapiTransformRecord(data.type, data.id, 'returnauthorization');

		this.setLines(return_authorization, data.lines);

		return_authorization.setFieldValue('memo', data.comments);

		return nlapiSubmitRecord(return_authorization);
	}

,	findLine: function (line_id, lines)
	{
		'use strict';

		return _.findWhere(lines, {
			id: line_id
		});
	}

,	setLines: function (return_authorization, lines)
	{
		'use strict';

		var line_count = return_authorization.getLineItemCount('item')
		,	add_line = true
		,	i = 1;

		while (add_line && i <= line_count)
		{
			add_line = this.findLine(return_authorization.getLineItemValue('item', 'id', i), lines);

			if (add_line)
			{
				return_authorization.setLineItemValue('item', 'quantity', i, add_line.quantity);
				return_authorization.setLineItemValue('item', 'description', i, add_line.reason);
			}
			else
			{
				return_authorization.removeLineItem('item', i);
			}

			i++;
		}

		return !add_line ? this.setLines(return_authorization, lines) : this;
	}

,	list: function (data)
	{
		'use strict';

		var is_multicurrency = context.getFeature('MULTICURRENCY')

		,	amount_field = is_multicurrency ? 'fxamount' : 'amount'

		,	filters = [
				new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			]

		,	columns = [
				new nlobjSearchColumn('internalid', 'item')
			,	new nlobjSearchColumn('type', 'item')
			,	new nlobjSearchColumn('parent', 'item')
			,	new nlobjSearchColumn('displayname', 'item')
			,	new nlobjSearchColumn('storedisplayname', 'item')
			,	new nlobjSearchColumn('internalid')
			,	new nlobjSearchColumn('taxtotal')
			,	new nlobjSearchColumn('rate')
			,	new nlobjSearchColumn('total')
			,	new nlobjSearchColumn('mainline')
			,	new nlobjSearchColumn('trandate')
			,	new nlobjSearchColumn('internalid')
			,	new nlobjSearchColumn('tranid')
			,	new nlobjSearchColumn('status')
			,	new nlobjSearchColumn('options')
			,	new nlobjSearchColumn('linesequencenumber').setSort()
			,	new nlobjSearchColumn(amount_field)
			,	new nlobjSearchColumn('quantity')
			]

		,	return_authorizations = null;

		if (data.createdfrom)
		{
			filters.push(new nlobjSearchFilter('createdfrom', null, 'anyof', data.createdfrom));
		}

		this.setDateFromTo(data.from, data.to, filters);

		switch (data.sort)
		{
			case 'number':
				columns[12].setSort(data.order > 0);
			break;

			default:
				columns[10].setSort(data.order > 0);
				columns[11].setSort(data.order > 0);
		}

		if (is_multicurrency)
		{
			columns.push(new nlobjSearchColumn('currency'));
		}

		if (data.page)
		{
			filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));

			return_authorizations = Application.getPaginatedSearchResults({
				record_type: 'returnauthorization'
			,	filters: filters
			,	columns: columns
			,	page: data.page
			});

			return_authorizations.records = _.map(return_authorizations.records, function (record)
			{
				return {
					internalid: record.getId()
				,	status: record.getText('status')
				,	tranid: record.getValue('tranid')
				,	date: record.getValue('trandate')

				,	summary: {
						total: toCurrency(record.getValue('total'))
					,	total_formatted: formatCurrency(record.getValue('total'))
					}

				,	currency: is_multicurrency ? {
						internalid: record.getValue('currency')
					,	name: record.getText('currency')
					} : null
				};
			});
		}
		else
		{
			return_authorizations = this.parseResults(Application.getAllSearchResults('returnauthorization', filters, columns));
		}

		return return_authorizations;
	}

,	setDateFromTo: function (from, to, filters)
	{
		'use strict';

		if (from)
		{
			filters.push(new nlobjSearchFilter('trandate', null, 'onorafter', this.setDateInt(from), null));
		}

		if (to)
		{
			filters.push(new nlobjSearchFilter('trandate', null, 'onorbefore', this.setDateInt(to), null));
		}
	}

,	setDateInt: function (date)
	{
		'use strict';

		var offset = new Date().getTimezoneOffset() * 60 * 1000;

		return new Date(parseInt(date, 10) + offset);
	}

,	parseResults: function (return_authorizations)
	{
		'use strict';

		var return_address = context.getPreference('returnaddresstext')
		,	is_multicurrency = context.getFeature('MULTICURRENCY')
		,	amount_field = is_multicurrency ? 'fxamount' : 'amount'
		,	store_item = Application.getModel('StoreItem')
		,	return_authorization_id = 0
		,	current_return = null
		,	grouped_result = {};

		// the query returns the transaction headers mixed with the lines so we have to group the returns authorization
		_.each(return_authorizations, function (returnauthorization)
		{
			return_authorization_id = returnauthorization.getId();
			// create the return authorization
			if (!grouped_result[return_authorization_id])
			{
				grouped_result[return_authorization_id] = {lines: []};
			}

			current_return = grouped_result[return_authorization_id];

			// asterisk means true
			if (returnauthorization.getValue('mainline') === '*' || !current_return.internalid)
			{
				// if it's the mainline we add some fields
				_.extend(current_return, {
					internalid: returnauthorization.getValue('internalid')
				,	status: returnauthorization.getText('status')
				,	date: returnauthorization.getValue('trandate')
				,	summary: {
						total: toCurrency(returnauthorization.getValue('total'))
					,	total_formatted: formatCurrency(returnauthorization.getValue('total'))
					}
				,	type: 'returnauthorization'
				,	tranid: returnauthorization.getValue('tranid')
				,	currency: is_multicurrency ? {
						internalid: returnauthorization.getValue('currency')
					,	name: returnauthorization.getText('currency')
					} : null
				});

				// it the autorizhation is approved, add the return's information
				if (returnauthorization.getValue('status') !== 'pendingApproval')
				{
					current_return.order_number = returnauthorization.getValue('tranid');
					current_return.return_address = return_address;
				}
			}

			if (returnauthorization.getValue('mainline') !== '*')
			{
				// if it's a line, we add it to the lines collection of the return authorization
				current_return.lines.push({
					internalid: returnauthorization.getValue('internalid') + '_' + returnauthorization.getValue('linesequencenumber')
				,	quantity: returnauthorization.getValue('quantity')
				,	rate: toCurrency(returnauthorization.getValue('rate'))
				,	amount: toCurrency(returnauthorization.getValue(amount_field))
				,	tax_amount: toCurrency(returnauthorization.getValue('taxtotal'))
				,	total: toCurrency(returnauthorization.getValue('total'))

				,	options: getItemOptionsObject(returnauthorization.getValue('options'))
					// add item information to order's line, the storeitem collection was preloaded in the getOrderLines function
				,	item: store_item.get(
						returnauthorization.getValue('internalid', 'item')
					,	returnauthorization.getValue('type', 'item')
					)
				});
			}
		});

		return _.values(grouped_result);
	}
});


//Model.js
/* jshint -W053 */
// We HAVE to use "new String"
// So we (disable the warning)[https://groups.google.com/forum/#!msg/jshint/O-vDyhVJgq4/hgttl3ozZscJ]
// LiveOrder.js
// -------
// Defines the model used by the live-order.ss service
// Available methods allow fetching and updating Shopping Cart's data
Application.defineModel('LiveOrder', {

	get: function ()
	{
		'use strict';

		var order_fields = this.getFieldValues()
		,	result = {};

		try
		{
			result.lines = this.getLines(order_fields);
		}
		catch (e)
		{
			if (e.code === 'ERR_CHK_ITEM_NOT_FOUND')
			{
				return this.get();
			}
			else
			{
				throw e;
			}
		}

		order_fields = this.hidePaymentPageWhenNoBalance(order_fields);

		result.lines_sort = this.getLinesSort();
		result.latest_addition = context.getSessionObject('latest_addition');

		result.promocode = this.getPromoCode(order_fields);

		result.ismultishipto = this.getIsMultiShipTo(order_fields);
		// Ship Methods
		if (result.ismultishipto)
		{
			result.multishipmethods = this.getMultiShipMethods(result.lines);

			// These are set so it is compatible with non multiple shipping.
			result.shipmethods = [];
			result.shipmethod = null;
		}
		else
		{
			result.shipmethods = this.getShipMethods(order_fields);
			result.shipmethod = order_fields.shipmethod ? order_fields.shipmethod.shipmethod : null;
		}

		// Addresses
		result.addresses = this.getAddresses(order_fields);
		result.billaddress = order_fields.billaddress ? order_fields.billaddress.internalid : null;
		result.shipaddress = !result.ismultishipto ? order_fields.shipaddress.internalid : null;

		// Payment
		result.paymentmethods = this.getPaymentMethods(order_fields);

		// Paypal complete
		result.isPaypalComplete = context.getSessionObject('paypal_complete') === 'T';

		// Some actions in the live order may change the url of the checkout so to be sure we re send all the touchpoints
		result.touchpoints = session.getSiteSettings(['touchpoints']).touchpoints;

		// Terms And Conditions
		result.agreetermcondition = order_fields.agreetermcondition === 'T';

		// Summary
		result.summary = order_fields.summary;

		// Transaction Body Field
		result.options = this.getTransactionBodyField();

		return result;
	}

,	update: function (data)
	{
		'use strict';

		var current_order = this.get();

		// Only do this if it's capable of shipping multiple items.
		if (this.isMultiShippingEnabled)
		{
			if (this.isSecure && this.isLoggedIn)
			{
				order.setEnableItemLineShipping(!!data.ismultishipto);
			}

			// Do the following only if multishipto is active (is the data recevie determine that MST is enabled and pass the MST Validation)
			if (data.ismultishipto)
			{
				order.removeShippingAddress();

				order.removeShippingMethod();

				this.removePromoCode(current_order);

				this.splitLines(data,current_order);

				this.setShippingAddressAndMethod(data, current_order);
			}
		}

		if (!this.isMultiShippingEnabled || !data.ismultishipto)
		{

			this.setShippingAddress(data, current_order);

			this.setShippingMethod(data, current_order);

			this.setPromoCode(data, current_order);
		}

		this.setBillingAddress(data, current_order);

		this.setPaymentMethods(data);

		this.setTermsAndConditions(data);

		this.setTransactionBodyField(data);

	}

,	submit: function ()
	{
		'use strict';

		var paypal_address = _.find(customer.getAddressBook(), function (address){ return !address.phone && address.isvalid === 'T'; })
		,	confirmation = order.submit();
		// We need remove the paypal's address because after order submit the address is invalid for the next time.
		this.removePaypalAddress(paypal_address);

		context.setSessionObject('paypal_complete', 'F');

		if (this.isMultiShippingEnabled)
		{
			order.setEnableItemLineShipping(false); // By default non order should be MST
		}

		return confirmation;
	}

,	isSecure: request.getURL().indexOf('https') === 0

,	isLoggedIn: session.isLoggedIn()

,	isMultiShippingEnabled: context.getSetting('FEATURE', 'MULTISHIPTO') === 'T' && SC.Configuration.isMultiShippingEnabled

,	addAddress: function (address, addresses)
	{
		'use strict';

		if (!address)
		{
			return null;
		}

		addresses = addresses || {};

		if (!address.fullname)
		{
			address.fullname = address.attention ? address.attention : address.addressee;
		}

		if (!address.company)
		{
			address.company = address.attention ? address.addressee : null;
		}

		delete address.attention;
		delete address.addressee;

		if (!address.internalid)
		{
			address.internalid =	(address.country || '') + '-' +
									(address.state || '') + '-' +
									(address.city || '') + '-' +
									(address.zip || '') + '-' +
									(address.addr1 || '') + '-' +
									(address.addr2 || '') + '-' +
									(address.fullname || '') + '-' +
									address.company;

			address.internalid = address.internalid.replace(/\s/g, '-');
		}

		if (address.internalid !== '-------null')
		{
			addresses[address.internalid] = address;
		}

		return address.internalid;
	}

,	hidePaymentPageWhenNoBalance: function (order_fields)
	{
		'use strict';

		if (this.isSecure && this.isLoggedIn && order_fields.payment && session.getSiteSettings(['checkout']).checkout.hidepaymentpagewhennobalance === 'T' && order_fields.summary.total === 0)
		{
			order.removePayment();
			order_fields = this.getFieldValues();
		}
		return order_fields;
	}

,	redirectToPayPal: function ()
	{
		'use strict';

		var touchpoints = session.getSiteSettings( ['touchpoints'] ).touchpoints
		,	continue_url = 'https://' + request.getHeader('Host') + touchpoints.checkout
		,	joint = ~continue_url.indexOf('?') ? '&' : '?';

		continue_url = continue_url + joint + 'paypal=DONE&fragment=' + request.getParameter('next_step');

		session.proceedToCheckout({
			cancelurl: touchpoints.viewcart
		,	continueurl: continue_url
		,	createorder: 'F'
		,	type: 'paypalexpress'
		,	shippingaddrfirst: 'T'
		,	showpurchaseorder: 'T'
		});
	}

,	redirectToPayPalExpress: function ()
	{
		'use strict';

		var touchpoints = session.getSiteSettings( ['touchpoints'] ).touchpoints
		,	continue_url = 'https://' + request.getHeader('Host') + touchpoints.checkout
		,	joint = ~continue_url.indexOf('?') ? '&' : '?';

		continue_url = continue_url + joint + 'paypal=DONE';

		session.proceedToCheckout({
			cancelurl: touchpoints.viewcart
		,	continueurl: continue_url
		,	createorder: 'F'
		,	type: 'paypalexpress'
		});
	}

,	backFromPayPal: function ()
	{
		'use strict';

		var Profile = Application.getModel('Profile')
		,	customer_values = Profile.get()
		,	bill_address = order.getBillingAddress()
		,	ship_address = order.getShippingAddress();

		if (customer_values.isGuest === 'T' && session.getSiteSettings(['registration']).registration.companyfieldmandatory === 'T')
		{
			customer_values.companyname = 'Guest Shopper';
			customer.updateProfile(customer_values);
		}

		if (ship_address.internalid && ship_address.isvalid === 'T' && !bill_address.internalid)
		{
			order.setBillingAddress(ship_address.internalid);
		}

		context.setSessionObject('paypal_complete', 'T');
	}

	// remove the shipping address or billing address if phone number is null (address not valid created by Paypal.)

,	removePaypalAddress: function (paypal_address)
	{
		'use strict';

		try
		{
			if (paypal_address && paypal_address.internalid)
			{
				customer.removeAddress(paypal_address.internalid);
			}
		}
		catch (e)
		{
			// ignore this exception, it is only for the cases that we can't remove paypal's address.
			// This exception will not send to the front-end
			var error = Application.processError(e);
			console.log('Error ' + error.errorStatusCode + ': ' + error.errorCode + ' - ' + error.errorMessage);
		}
	}

,	addLine: function (line_data)
	{
		'use strict';

		// Adds the line to the order
		var line_id = order.addItem({
			internalid: line_data.item.internalid.toString()
		,	quantity: _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1
		,	options: line_data.options || {}
		});


		if (this.isMultiShippingEnabled)
		{
			// Sets it ship address (if present)
			line_data.shipaddress && order.setItemShippingAddress(line_id, line_data.shipaddress);

			// Sets it ship method (if present)
			line_data.shipmethod && order.setItemShippingMethod(line_id, line_data.shipmethod);
		}

		// Stores the latest addition
		context.setSessionObject('latest_addition', line_id);

		// Stores the current order
		var lines_sort = this.getLinesSort();
		lines_sort.unshift(line_id);
		this.setLinesSort(lines_sort);

		return line_id;
	}

,	addLines: function (lines_data)
	{
		'use strict';

		var items = [];

		_.each(lines_data, function (line_data)
		{
			var item = {
					internalid: line_data.item.internalid.toString()
				,	quantity:  _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1
				,	options: line_data.options || {}
			};

			items.push(item);
		});

		var lines_ids = order.addItems(items)
		,	latest_addition = _.last(lines_ids).orderitemid
		// Stores the current order
		,	lines_sort = this.getLinesSort();

		lines_sort.unshift(latest_addition);
		this.setLinesSort(lines_sort);

		context.setSessionObject('latest_addition', latest_addition);

		return lines_ids;
	}

,	removeLine: function (line_id)
	{
		'use strict';

		// Removes the line
		order.removeItem(line_id);

		// Stores the current order
		var lines_sort = this.getLinesSort();
		lines_sort = _.without(lines_sort, line_id);
		this.setLinesSort(lines_sort);
	}

,	updateLine: function (line_id, line_data)
	{
		'use strict';

		var lines_sort = this.getLinesSort()
		,	current_position = _.indexOf(lines_sort, line_id)
		,	original_line_object = order.getItem(line_id);

		this.removeLine(line_id);

		if (!_.isNumber(line_data.quantity) || line_data.quantity > 0)
		{
			var new_line_id;
			try
			{
				new_line_id = this.addLine(line_data);
			}
			catch (e)
			{
				// we try to roll back the item to the original state
				var roll_back_item = {
					item: { internalid: parseInt(original_line_object.internalid, 10) }
				,	quantity: parseInt(original_line_object.quantity, 10)
				};

				if (original_line_object.options && original_line_object.options.length)
				{
					roll_back_item.options = {};
					_.each(original_line_object.options, function (option)
					{
						roll_back_item.options[option.id.toLowerCase()] = option.value;
					});
				}

				new_line_id = this.addLine(roll_back_item);

				e.errorDetails = {
					status: 'LINE_ROLLBACK'
				,	oldLineId: line_id
				,	newLineId: new_line_id
				};

				throw e;
			}

			lines_sort = _.without(lines_sort, line_id, new_line_id);
			lines_sort.splice(current_position, 0, new_line_id);
			this.setLinesSort(lines_sort);
		}
	}

,	splitLines: function (data, current_order)
	{
		'use strict';
		_.each(data.lines, function (line)
		{
			if (line.splitquantity)
			{
				var splitquantity = typeof line.splitquantity === 'string' ? parseInt(line.splitquantity,10) : line.splitquantity
				,	original_line = _.find(current_order.lines, function (order_line)
					{
						return order_line.internalid === line.internalid;
					})
				,	remaining = original_line ? (original_line.quantity - splitquantity) : -1;

				if (remaining > 0 && splitquantity > 0)
				{
					order.splitItem({
						'orderitemid' : original_line.internalid
					,	'quantities': [
							splitquantity
						,	remaining
						]
					});
				}
			}
		});
	}

,	removePromoCode: function(current_order)
	{
		'use strict';
		if(current_order.promocode && current_order.promocode.code)
		{
			order.removePromotionCode(current_order.promocode.code);
		}
	}

,	getFieldValues: function ()
	{
		'use strict';

		var order_field_keys = this.isSecure ? SC.Configuration.order_checkout_field_keys : SC.Configuration.order_shopping_field_keys;

		if (this.isMultiShippingEnabled)
		{
			if (!_.contains(order_field_keys.items, 'shipaddress'))
			{
				order_field_keys.items.push('shipaddress');
			}
			if (!_.contains(order_field_keys.items, 'shipmethod'))
			{
				order_field_keys.items.push('shipmethod');
			}
			order_field_keys.ismultishipto = null;
		}

		return order.getFieldValues(order_field_keys, false);
	}

,	getPromoCode: function (order_fields)
	{
		'use strict';

		if (order_fields.promocodes && order_fields.promocodes.length)
		{
			return {
					internalid: order_fields.promocodes[0].internalid
				,	code: order_fields.promocodes[0].promocode
				,	isvalid: true
			};
		}
		else
		{
			return null;
		}
	}

,	getMultiShipMethods: function (lines)
	{
		'use strict';
		// Get multi ship methods
		var multishipmethods = {};

		_.each(lines, function (line)
		{
			if (line.shipaddress)
			{
				multishipmethods[line.shipaddress] = multishipmethods[line.shipaddress] || [];

				multishipmethods[line.shipaddress].push(line.internalid);
			}
		});

		_.each(_.keys(multishipmethods), function (address)
		{
			var methods = order.getAvailableShippingMethods(multishipmethods[address], address);

			_.each(methods, function (method)
			{
				method.internalid = method.shipmethod;
				method.rate_formatted = formatCurrency(method.rate);
				delete method.shipmethod;
			});

			multishipmethods[address] = methods;
		});

		return multishipmethods;
	}

,	getShipMethods: function (order_fields)
	{
		'use strict';

		var shipmethods = _.map(order_fields.shipmethods, function (shipmethod)
		{
			var rate = toCurrency(shipmethod.rate.replace( /^\D+/g, '')) || 0;

			return {
				internalid: shipmethod.shipmethod
			,	name: shipmethod.name
			,	shipcarrier: shipmethod.shipcarrier
			,	rate: rate
			,	rate_formatted: shipmethod.rate
			};
		});

		return shipmethods;
	}

,	getLinesSort: function ()
	{
		'use strict';
		return context.getSessionObject('lines_sort') ? context.getSessionObject('lines_sort').split(',') : [];
	}

,	getPaymentMethods: function (order_fields)
	{
		'use strict';
		var paymentmethods = []
		,	giftcertificates = order.getAppliedGiftCertificates()
		,	paypal = _.findWhere(session.getPaymentMethods(), {ispaypal: 'T'});

		if (order_fields.payment && order_fields.payment.creditcard && order_fields.payment.creditcard.paymentmethod && order_fields.payment.creditcard.paymentmethod.creditcard === 'T' && order_fields.payment.creditcard.paymentmethod.ispaypal !== 'T')
		{
			// Main
			var cc = order_fields.payment.creditcard;
			paymentmethods.push({
				type: 'creditcard'
			,	primary: true
			,	creditcard: {
					internalid: cc.internalid
				,	ccnumber: cc.ccnumber
				,	ccname: cc.ccname
				,	ccexpiredate: cc.expmonth + '/' + cc.expyear
				,	ccsecuritycode: cc.ccsecuritycode
				,	expmonth: cc.expmonth
				,	expyear: cc.expyear
				,	paymentmethod: {
						internalid: cc.paymentmethod.internalid
					,	name: cc.paymentmethod.name
					,	creditcard: cc.paymentmethod.creditcard === 'T'
					,	ispaypal: cc.paymentmethod.ispaypal === 'T'
					}
				}
			});
		}
		else if (order_fields.payment && paypal && paypal.internalid === order_fields.payment.paymentmethod)
		{
			paymentmethods.push({
				type: 'paypal'
			,	primary: true
			,	complete: context.getSessionObject('paypal_complete') === 'T'
			});
		}
		else if (order_fields.payment && order_fields.payment.paymentterms === 'Invoice')
		{
			var customer_invoice = customer.getFieldValues([
				'paymentterms'
			,	'creditlimit'
			,	'balance'
			,	'creditholdoverride'
			]);

			paymentmethods.push({
				type: 'invoice'
			,	primary: true
			,	paymentterms: customer_invoice.paymentterms
			,	creditlimit: parseFloat(customer_invoice.creditlimit || 0)
			,	creditlimit_formatted: formatCurrency(customer_invoice.creditlimit)
			,	balance: parseFloat(customer_invoice.balance || 0)
			,	balance_formatted: formatCurrency(customer_invoice.balance)
			,	creditholdoverride: customer_invoice.creditholdoverride
			,	purchasenumber: order_fields.purchasenumber
			});
		}

		if (giftcertificates && giftcertificates.length)
		{
			_.forEach(giftcertificates, function (giftcertificate)
			{
				paymentmethods.push({
					type: 'giftcertificate'
				,	giftcertificate: {
						code: giftcertificate.giftcertcode

					,	amountapplied: toCurrency(giftcertificate.amountapplied || 0)
					,	amountapplied_formatted: formatCurrency(giftcertificate.amountapplied || 0)

					,	amountremaining: toCurrency(giftcertificate.amountremaining || 0)
					,	amountremaining_formatted: formatCurrency(giftcertificate.amountremaining || 0)

					,	originalamount: toCurrency(giftcertificate.originalamount || 0)
					,	originalamount_formatted: formatCurrency(giftcertificate.originalamount || 0)
					}
				});
			});
		}

		return paymentmethods;
	}

,	getTransactionBodyField: function ()
	{
		'use strict';

		var options = {};

		if (this.isSecure)
		{
			_.each(order.getCustomFieldValues(), function (option)
			{
				options[option.name] = option.value;
			});

		}
		return options;
	}

,	getAddresses: function (order_fields)
	{
		'use strict';

		var self = this
		,	addresses = {}
		,	address_book = this.isLoggedIn && this.isSecure ? customer.getAddressBook() : [];

		address_book = _.object(_.pluck(address_book, 'internalid'), address_book);
		// General Addresses
		if (order_fields.ismultishipto === 'T')
		{
			_.each(order_fields.items || [], function (line)
			{
				if (line.shipaddress && !addresses[line.shipaddress])
				{
					self.addAddress(address_book[line.shipaddress], addresses);
				}
			});
		}
		else
		{
			this.addAddress(order_fields.shipaddress, addresses);
		}

		this.addAddress(order_fields.billaddress, addresses);

		return _.values(addresses);
	}

	// Set Order Lines into the result
	// Standarizes the result of the lines
,	getLines: function (order_fields)
	{
		'use strict';

		var lines = [];
		if (order_fields.items && order_fields.items.length)
		{
			var self = this
			,	items_to_preload = []
			,	address_book = this.isLoggedIn && this.isSecure ? customer.getAddressBook() : []
			,	item_ids_to_clean = [];

			address_book = _.object(_.pluck(address_book, 'internalid'), address_book);

			_.each(order_fields.items, function (original_line)
			{
				// Total may be 0
				var	total = (original_line.promotionamount) ? toCurrency(original_line.promotionamount) : toCurrency(original_line.amount)
				,	discount = toCurrency(original_line.promotiondiscount) || 0
				,	line_to_add
				,	is_shippable = original_line.isfulfillable !== false;

				line_to_add = {
					internalid: original_line.orderitemid
				,	quantity: original_line.quantity
				,	rate: parseFloat(original_line.rate)
				,	rate_formatted: original_line.rate_formatted
				,	amount: toCurrency(original_line.amount)
				,	tax_amount: 0
				,	tax_rate: null
				,	tax_code: null
				,	discount: discount
				,	total: total
				,	item: original_line.internalid
				,	itemtype: original_line.itemtype
				,	isshippable: is_shippable
				,	options: original_line.options
				,	shipaddress: original_line.shipaddress
				,	shipmethod: original_line.shipmethod
				};

				lines.push(line_to_add);

				if (line_to_add.shipaddress && !address_book[line_to_add.shipaddress])
				{
					line_to_add.shipaddress = null;
					line_to_add.shipmethod = null;
					item_ids_to_clean.push(line_to_add.internalid);
				}
				else
				{
					items_to_preload.push({
						id: original_line.internalid
					,	type: original_line.itemtype
					});
				}
			});

			if (item_ids_to_clean.length)
			{
				order.setItemShippingAddress(item_ids_to_clean, null);
				order.setItemShippingMethod(item_ids_to_clean, null);
			}

			var store_item = Application.getModel('StoreItem')
			,	restart = false;

			store_item.preloadItems(items_to_preload);

			lines.forEach(function (line)
			{
				line.item = store_item.get(line.item, line.itemtype);

				if (!line.item)
				{
					self.removeLine(line.internalid);
					restart = true;
				}
				else
				{
					line.rate_formatted = formatCurrency(line.rate);
					line.amount_formatted = formatCurrency(line.amount);
					line.tax_amount_formatted = formatCurrency(line.tax_amount);
					line.discount_formatted = formatCurrency(line.discount);
					line.total_formatted = formatCurrency(line.total);
				}
			});

			if (restart)
			{
				throw {code: 'ERR_CHK_ITEM_NOT_FOUND'};
			}

			// Sort the items in the order they were added, this is because the update operation alters the order
			var lines_sort = this.getLinesSort();

			if (lines_sort.length)
			{
				lines = _.sortBy(lines, function (line)
				{
					return _.indexOf(lines_sort, line.internalid);
				});
			}
			else
			{
				this.setLinesSort(_.pluck(lines, 'internalid'));
			}
		}

		return lines;
	}

,	getIsMultiShipTo: function (order_fields)
	{
		'use strict';
		return this.isMultiShippingEnabled && order_fields.ismultishipto === 'T';
	}

,	setLinesSort: function (lines_sort)
	{
		'use strict';
		return context.setSessionObject('lines_sort', lines_sort || []);
	}

,	setBillingAddress: function (data, current_order)
	{
		'use strict';

		if (data.sameAs)
		{
			data.billaddress = data.shipaddress;
		}

		if (data.billaddress !== current_order.billaddress)
		{
			if (data.billaddress)
			{
				if (data.billaddress && !~data.billaddress.indexOf('null'))
				{
					// Heads Up!: This "new String" is to fix a nasty bug
					order.setBillingAddress(new String(data.billaddress).toString());
				}
			}
			else if (this.isSecure)
			{
				order.removeBillingAddress();
			}
		}
	}

,	setShippingAddressAndMethod: function (data, current_order)
	{
		'use strict';

		var current_package
		,	packages = {}
		,	item_ids_to_clean = []
		,	original_line;

		_.each(data.lines, function (line)
		{
			original_line = _.find(current_order.lines, function (order_line)
			{
				return order_line.internalid === line.internalid;
			});

			if (original_line && original_line.isshippable)
			{
				if (line.shipaddress)
				{
					packages[line.shipaddress] = packages[line.shipaddress] || {
						shipMethodId: null,
						itemIds: []
					};

					packages[line.shipaddress].itemIds.push(line.internalid);
					if (!packages[line.shipaddress].shipMethodId && line.shipmethod)
					{
						packages[line.shipaddress].shipMethodId = line.shipmethod;
					}
				}
				else
				{
					item_ids_to_clean.push(line.internalid);
				}
			}
		});

		//CLEAR Shipping address and shipping methods
		if (item_ids_to_clean.length)
		{
			order.setItemShippingAddress(item_ids_to_clean, null);
			order.setItemShippingMethod(item_ids_to_clean, null);
		}

		//SET Shipping address and shipping methods
		_.each(_.keys(packages), function (address_id)
		{
			current_package = packages[address_id];
			order.setItemShippingAddress(current_package.itemIds, parseInt(address_id, 10));

			if (current_package.shipMethodId)
			{
				order.setItemShippingMethod(current_package.itemIds, parseInt(current_package.shipMethodId, 10));
			}
		});
	}

,	setShippingAddress: function (data, current_order)
	{
		'use strict';

		if (data.shipaddress !== current_order.shipaddress)
		{
			if (data.shipaddress)
			{
				if (this.isSecure && !~data.shipaddress.indexOf('null'))
				{
					// Heads Up!: This "new String" is to fix a nasty bug
					order.setShippingAddress(new String(data.shipaddress).toString());
				}
				else
				{
					var address = _.find(data.addresses, function (address)
					{
						return address.internalid === data.shipaddress;
					});

					address && order.estimateShippingCost(address);
				}
			}
			else if (this.isSecure)
			{
				order.removeShippingAddress();
			}
			else
			{
				order.estimateShippingCost({
					zip: null
				,	country: null
				});
			}
		}
	}

,	setPaymentMethods: function (data)
	{
		'use strict';

		// Because of an api issue regarding Gift Certificates, we are going to handle them separately
		var gift_certificate_methods = _.where(data.paymentmethods, {type: 'giftcertificate'})
		,	non_certificate_methods = _.difference(data.paymentmethods, gift_certificate_methods);

		// Payment Methods non gift certificate
		if (this.isSecure && non_certificate_methods && non_certificate_methods.length && this.isLoggedIn)
		{
			_.sortBy(non_certificate_methods, 'primary').forEach(function (paymentmethod)
			{

				if (paymentmethod.type === 'creditcard' && paymentmethod.creditcard)
				{

					var credit_card = paymentmethod.creditcard
					,	require_cc_security_code = session.getSiteSettings(['checkout']).checkout.requireccsecuritycode === 'T'
					,	cc_obj = credit_card && {
									internalid: credit_card.internalid
								,	ccnumber: credit_card.ccnumber
								,	ccname: credit_card.ccname
								,	ccexpiredate: credit_card.ccexpiredate
								,	expmonth: credit_card.expmonth
								,	expyear:  credit_card.expyear
								,	paymentmethod: {
										internalid: credit_card.paymentmethod.internalid
									,	name: credit_card.paymentmethod.name
									,	creditcard: credit_card.paymentmethod.creditcard ? 'T' : 'F'
									,	ispaypal:  credit_card.paymentmethod.ispaypal ? 'T' : 'F'
									}
								};

					if (credit_card.ccsecuritycode)
					{
						cc_obj.ccsecuritycode = credit_card.ccsecuritycode;
					}

					if (!require_cc_security_code || require_cc_security_code && credit_card.ccsecuritycode)
					{
						// the user's default credit card may be expired so we detect this using try&catch and if it is we remove the payment methods.
						try
						{
							order.removePayment();

							order.setPayment({
								paymentterms: 'CreditCard'
							,	creditcard: cc_obj
							});

							context.setSessionObject('paypal_complete', 'F');
						}
						catch (e)
						{
							if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT')
							{
								order.removePayment();
							}
							throw e;
						}
					}
					// if the the given credit card don't have a security code and it is required we just remove it from the order
					else if (require_cc_security_code && !credit_card.ccsecuritycode)
					{
						order.removePayment();
					}
				}
				else if (paymentmethod.type === 'invoice')
				{
					order.removePayment();

					try
					{
						order.setPayment({ paymentterms: 'Invoice' });
					}
					catch (e)
					{
						if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT')
						{
							order.removePayment();
						}
						throw e;
					}


					paymentmethod.purchasenumber && order.setPurchaseNumber(paymentmethod.purchasenumber);

					context.setSessionObject('paypal_complete', 'F');
				}
				else if (paymentmethod.type === 'paypal' && context.getSessionObject('paypal_complete') === 'F')
				{
					order.removePayment();

					var paypal = _.findWhere(session.getPaymentMethods(), {ispaypal: 'T'});
					paypal && order.setPayment({paymentterms: '', paymentmethod: paypal.internalid});
				}
			});
		}
		else if (this.isSecure && this.isLoggedIn)
		{
			order.removePayment();
		}

		gift_certificate_methods = _.map(gift_certificate_methods, function (gift_certificate) { return gift_certificate.giftcertificate; });
		this.setGiftCertificates(gift_certificate_methods);
	}

,	setGiftCertificates:  function (gift_certificates)
	{
		'use strict';

		// Remove all gift certificates so we can re-enter them in the appropriate order
		order.removeAllGiftCertificates();

		_.forEach(gift_certificates, function (gift_certificate)
		{
			order.applyGiftCertificate(gift_certificate.code);
		});
	}

,	setShippingMethod: function (data, current_order)
	{
		'use strict';
		if ((!this.isMultiShippingEnabled || !data.ismultishipto) && this.isSecure && data.shipmethod !== current_order.shipmethod)
		{
			var shipmethod = _.findWhere(current_order.shipmethods, {internalid: data.shipmethod});

			if (shipmethod)
			{
				order.setShippingMethod({
					shipmethod: shipmethod.internalid
				,	shipcarrier: shipmethod.shipcarrier
				});
			}
			else
			{
				order.removeShippingMethod();
			}
		}
	}

,	setPromoCode: function (data, current_order)
	{
		'use strict';
		if (data.promocode && (!current_order.promocode || data.promocode.code !== current_order.promocode.code))
		{
			try
			{
				order.applyPromotionCode(data.promocode.code);
			}
			catch (e)
			{
				order.removePromotionCode(data.promocode.code);
				current_order.promocode && order.removePromotionCode(current_order.promocode.code);
				throw e;
			}
		}
		else if (!data.promocode && current_order.promocode)
		{
			order.removePromotionCode(current_order.promocode.code);
		}
	}

,	setTermsAndConditions: function(data)
	{
		'use strict';
		var require_terms_and_conditions = session.getSiteSettings(['checkout']).checkout.requiretermsandconditions;

		if (require_terms_and_conditions.toString() === 'T' && this.isSecure && !_.isUndefined(data.agreetermcondition))
		{
			order.setTermsAndConditions(data.agreetermcondition);
		}
	}

,	setTransactionBodyField: function(data)
	{
		'use strict';
		// Transaction Body Field
		if (this.isSecure && !_.isEmpty(data.options))
		{
			order.setCustomFieldValues(data.options);
		}
	}

});


//Model.js
// OrderItem.js
// ----------
// Handles fetching of ordered items
Application.defineModel('OrderItem', {

	search: function (order_id, query, query_filters)
	{
		'use strict';

		var filters = [
				new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			,	new nlobjSearchFilter('quantity', null, 'greaterthan', 0)
			,	new nlobjSearchFilter('mainline', null, 'is', 'F')
			,	new nlobjSearchFilter('cogs', null, 'is', 'F')
			,	new nlobjSearchFilter('taxline', null, 'is', 'F')
			,	new nlobjSearchFilter('shipping', null, 'is', 'F')
			,	new nlobjSearchFilter('transactiondiscount', null, 'is', 'F')
			,	new nlobjSearchFilter('isonline', 'item', 'is', 'T')
			,	new nlobjSearchFilter('isinactive', 'item', 'is', 'F')
			,   new nlobjSearchFilter('type', 'item', 'noneof', 'GiftCert')
			]

		,	columns = [
				new nlobjSearchColumn('internalid', 'item', 'group')
			,	new nlobjSearchColumn('type', 'item', 'group')
			,	new nlobjSearchColumn('parent', 'item', 'group')
			,	new nlobjSearchColumn('options', null, 'group')
			// to sort by price we fetch the max onlinecustomerprice
			,	new nlobjSearchColumn('onlinecustomerprice', 'item', 'max')
			// to sort by recently purchased we grab the last date the item was purchased
			,	new nlobjSearchColumn('trandate', null, 'max')
			// to sort by frequently purchased we count the number of orders which contains an item
			,	new nlobjSearchColumn('internalid', null, 'count')
			]

		,	item_name =  new nlobjSearchColumn('formulatext','item', 'group');

		// when sorting by name, if the item has displayname we sort by that field, if not we sort by itemid
		item_name.setFormula('case when LENGTH({item.displayname}) > 0 then {item.displayname} else {item.itemid} end');

		columns.push(item_name);

		// if the site is multisite we add the siteid to the search filter
		if (context.getFeature('MULTISITE') && session.getSiteSettings(['siteid']))
		{
			filters.push(new nlobjSearchFilter('website', 'item', 'is', session.getSiteSettings(['siteid']).siteid));
			filters.push(new nlobjSearchFilter('website', null, 'anyof', [session.getSiteSettings(['siteid']).siteid, '@NONE@']));
		}

		// show only items from one order
		if (order_id)
		{
			filters.push(new nlobjSearchFilter('internalid', null, 'is', order_id));
			columns.push(new nlobjSearchColumn('tranid', null, 'group'));
		}

		if (query_filters.date.from && query_filters.date.to)
		{
			var offset = new Date().getTimezoneOffset() * 60 * 1000;
			filters.push(new nlobjSearchFilter('trandate', null, 'within', new Date(parseInt(query_filters.date.from, 10) + offset), new Date(parseInt(query_filters.date.to, 10) + offset)));
		}

		if (query)
		{
			filters.push(
				new nlobjSearchFilter('itemid', 'item', 'contains', query).setLeftParens(true).setOr(true)
			,	new nlobjSearchFilter('displayname', 'item', 'contains', query).setRightParens(true)
			);
		}

		// select field to sort by
		switch (query_filters.sort)
		{
			// sort by name
			case 'name':
				item_name.setSort(query_filters.order > 0);
			break;

			// sort by price
			case 'price':
				columns[4].setSort(query_filters.order > 0);
			break;

			// sort by recently purchased
			case 'date':
				columns[5].setSort(query_filters.order > 0);
			break;

			// sort by frequenlty purchased
			case 'quantity':
				columns[6].setSort(query_filters.order > 0);
			break;

			default:
				columns[6].setSort(true);
			break;
		}
		// fetch items
		var result = Application.getPaginatedSearchResults({
				record_type: 'salesorder'
			,	filters: filters
			,	columns: columns
			,	page: query_filters.page
			,	column_count: new nlobjSearchColumn('formulatext', null, 'count').setFormula('CONCAT({item}, {options})')
			})
		// prepare an item collection, this will be used to preload item's details
		,	items_info = _.map(result.records, function (line)
			{
				return {
					id: line.getValue('internalid', 'item', 'group')
				,	type: line.getValue('type', 'item', 'group')
				};
			});

		if (items_info.length)
		{
			var store_item = Application.getModel('StoreItem');

			// preload order's items information
			store_item.preloadItems(items_info);

			result.records = _.map(result.records, function (line)
			{
				// prepare the collection for the frontend
				return {
						item: store_item.get( line.getValue('internalid', 'item', 'group'), line.getValue('type', 'item', 'group') )
					,	tranid: line.getValue('tranid', null, 'group') ||  null
					,	options_object: getItemOptionsObject( line.getValue('options', null, 'group') )
					,	trandate: line.getValue('trandate', null, 'max')
				};
			});
		}

		return result;
	}
});

//Model.js
// Receipts.js
// ----------
// Handles fetching receipts

var PlacedOrder = Application.getModel('PlacedOrder');

Application.defineModel('Receipts', _.extend({}, PlacedOrder, {

	_getReceiptType: function (type)
	{
		'use strict';

		var receipt_type = ['CustInvc', 'CashSale'];

		if (type === 'invoice')
		{
			receipt_type = ['CustInvc'];
		}
		else if (type === 'cashsale')
		{
			receipt_type = ['CashSale'];
		}

		return receipt_type;
	}

,	_getReceiptStatus: function (type, status)
	{
		'use strict';

		if (type === 'CustInvc')
		{
			status = this._getInvoiceStatus(status);
		}
		else if (type === 'CashSale')
		{
			status = this._getCashSaleStatus(status);
		}

		return type + ':' + status;
	}

,	_getCashSaleStatus: function (status)
	{
		'use strict';

		var response = null;

		switch (status)
		{
			case 'unapproved':
				response = 'A';
			break;

			case 'notdeposited':
				response = 'B';
			break;

			case 'deposited':
				response = 'C';
			break;
		}

		return response;
	}

,	_getInvoiceStatus: function (status)
	{
		'use strict';

		var response = null;

		switch (status)
		{
			case 'open':
				response = 'A';
			break;

			case 'paid':
				response = 'B';
			break;
		}

		return response;
	}

	// gets all the user's receipts
,	list: function (options)
	{
		'use strict';

		options = options || {};

		var reciept_type = this._getReceiptType(options.type)
		,	isMultiCurrency = context.getFeature('MULTICURRENCY')
		,	settings_site_id = session.getSiteSettings(['siteid'])
		,	site_id = settings_site_id && settings_site_id.siteid
		,	amount_field = isMultiCurrency ? 'fxamount' : 'amount'
		,	filters = [
				new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			,	new nlobjSearchFilter('mainline', null, 'is', 'T')
			,	new nlobjSearchFilter('type', null, 'anyof', reciept_type)
			]

		,	columns = [
				new nlobjSearchColumn('internalid').setSort(true)
			,	new nlobjSearchColumn('tranid')
			,	new nlobjSearchColumn('trandate').setSort(true)
			,	new nlobjSearchColumn('status')
			,	new nlobjSearchColumn('type')
			,	new nlobjSearchColumn('closedate')
			,	new nlobjSearchColumn('mainline')
			,	new nlobjSearchColumn('duedate')
			,	new nlobjSearchColumn(amount_field)
			]
		,	amount_remaining;

		if (isMultiCurrency)
		{
			amount_remaining = new nlobjSearchColumn('formulanumeric').setFormula('{amountremaining} / {exchangerate}');
		}
		else
		{
			amount_remaining = new nlobjSearchColumn('amountremaining');
		}

		columns.push(amount_remaining);

		// if the store has multiple currencies we add the currency column to the query
		if (isMultiCurrency)
		{
			columns.push(new nlobjSearchColumn('currency'));
		}

		// if the site is multisite we add the siteid to the search filter
		if (context.getFeature('MULTISITE') && site_id)
		{
			filters.push(new nlobjSearchFilter('website', null, 'anyof', [site_id, '@NONE@']));
		}

		if (options.status)
		{
			var self = this;

			filters.push(
				new nlobjSearchFilter('status', null, 'anyof', _.map(reciept_type, function (type)
				{
					return self._getReceiptStatus(type, options.status);
				}))
			);
		}

		if (options.orderid)
		{
			filters.push(new nlobjSearchFilter('createdfrom', null, 'anyof', options.orderid));
		}

		if (options.internalid)
		{
			filters.push(new nlobjSearchFilter('internalid', null, 'anyof', options.internalid));
		}

		var results = Application.getAllSearchResults(options.type === 'invoice' ? 'invoice' : 'transaction', filters, columns)
		,	now = new Date().getTime();


		return _.map(results || [], function (record)
		{

			var due_date = record.getValue('duedate')
			,	close_date = record.getValue('closedate')
			,	tran_date = record.getValue('trandate')
			,	due_in_milliseconds = new Date(due_date).getTime() - now
			,	total = toCurrency(record.getValue(amount_field))
			,	total_formatted = formatCurrency(record.getValue(amount_field));

			return {
				internalid: record.getId()
			,	tranid: record.getValue('tranid')
			,	order_number: record.getValue('tranid') // Legacy attribute
			,	date: tran_date // Legacy attribute
			,	summary: { // Legacy attribute
					total: total
				,	total_formatted: total_formatted
				}
			,	total: total
			,	total_formatted: total_formatted
			,	recordtype: record.getValue('type')
			,	mainline: record.getValue('mainline')
			,	amountremaining: toCurrency(record.getValue(amount_remaining))
			,	amountremaining_formatted: formatCurrency(record.getValue(amount_remaining))
			,	closedate: close_date
			,	closedateInMilliseconds: new Date(close_date).getTime()
			,	trandate: tran_date
			,	tranDateInMilliseconds: new Date(tran_date).getTime()
			,	duedate: due_date
			,	dueinmilliseconds: due_in_milliseconds
			,	isOverdue: due_in_milliseconds <= 0 && ((-1 * due_in_milliseconds) / 1000 / 60 / 60 / 24) >= 1
			,	status: {
					internalid: record.getValue('status')
				,	name: record.getText('status')
				}
			,	currency: {
					internalid: record.getValue('currency')
				,	name: record.getText('currency')
				}
			};
		});

	}

,	setAdjustments: function (receipt, result)
	{
		'use strict';

		result.payments = [];
		result.credit_memos = [];
		result.deposit_applications = [];

		var isMultiCurrency = context.getFeature('MULTICURRENCY')
		,	amount_field = isMultiCurrency ? 'appliedtoforeignamount' : 'appliedtolinkamount'
		,	filters = [
				new nlobjSearchFilter('appliedtotransaction', null, 'is', receipt.getId())
			,	new nlobjSearchFilter('type', null, 'anyof', ['CustCred', 'DepAppl', 'CustPymt'])
			]
		,	columns = [
				new nlobjSearchColumn('total')
			,	new nlobjSearchColumn('tranid')
			,	new nlobjSearchColumn('status')
			,	new nlobjSearchColumn('trandate')
			,	new nlobjSearchColumn('appliedtotransaction')
			,	new nlobjSearchColumn('amountremaining')
			,	new nlobjSearchColumn('amountpaid')
			,	new nlobjSearchColumn('amount')
			,	new nlobjSearchColumn('type')
			,	new nlobjSearchColumn(amount_field)
			]
		,	searchresults = nlapiSearchRecord('transaction', null, filters, columns);

		if (searchresults)
		{
			_.each(searchresults, function (payout)
			{
				var array = (payout.getValue('type') === 'CustPymt') ? result.payments :
							(payout.getValue('type') === 'CustCred') ? result.credit_memos :
							(payout.getValue('type') === 'DepAppl') ? result.deposit_applications : null;

				if (array)
				{
					var internal_id = payout.getId()
					,	duplicated_item = _.findWhere(array, {internalid: internal_id});

					if (!duplicated_item)
					{
						array.push({
							internalid: internal_id
						,	tranid: payout.getValue('tranid')
						,	appliedtoforeignamount : toCurrency(payout.getValue(amount_field))
						,	appliedtoforeignamount_formatted : formatCurrency(payout.getValue(amount_field))
						});
					}
					else
					{
						duplicated_item.appliedtoforeignamount += toCurrency(payout.getValue(amount_field));
						duplicated_item.appliedtoforeignamount_formatted = formatCurrency(duplicated_item.appliedtoforeignamount);
					}
				}
			});
		}
	}

,	setSalesRep: function (receipt, result)
	{
		'use strict';

		var salesrep_id = receipt.getFieldValue('salesrep')
		,	salesrep_name = receipt.getFieldText('salesrep');

		if (salesrep_id)
		{
			result.salesrep = {
				name: salesrep_name
			,	internalid: salesrep_id
			};

			var filters = [
				new nlobjSearchFilter('internalid', null, 'is', receipt.getId())
			,	new nlobjSearchFilter('internalid', 'salesrep', 'is', 'salesrep')
			]

			,	columns = [
					new nlobjSearchColumn('duedate')
				,	new nlobjSearchColumn('salesrep')
				,	new nlobjSearchColumn('email','salesrep')
				,	new nlobjSearchColumn('entityid','salesrep')
				,	new nlobjSearchColumn('mobilephone','salesrep')
				,	new nlobjSearchColumn('fax','salesrep')
			];

			var search_results = nlapiSearchRecord('invoice', null, filters, columns);

			if (search_results)
			{
				var invoice = search_results[0];
				result.salesrep.phone = invoice.getValue('phone','salesrep');
				result.salesrep.email = invoice.getValue('email','salesrep');
				result.salesrep.fullname = invoice.getValue('entityid','salesrep');
				result.salesrep.mobilephone = invoice.getText('mobilephone','salesrep');
				result.salesrep.fax = invoice.getValue('fax','salesrep');
			}
		}
	}

,	get: function (id, type)
	{
		'use strict';
		// get the transaction header
		var filters = [
				new nlobjSearchFilter('mainline', null, 'is', 'T')
			,	new nlobjSearchFilter('type', null, 'anyof', this._getReceiptType(type))
			,	new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			,	new nlobjSearchFilter('internalid', null, 'is', id)
			]
		,	columns = [
				new nlobjSearchColumn('status')
			,	new nlobjSearchColumn('createdfrom')
			,	new nlobjSearchColumn('total')
			,	new nlobjSearchColumn('taxtotal')
			]

		,	mainline = Application.getAllSearchResults('transaction', filters, columns);

		if (!mainline[0])
		{
			throw forbiddenError;
		}

		var	receipt = nlapiLoadRecord(mainline[0].getRecordType(), id)
		,	result = this.createResult(receipt);

		this.setAddresses(receipt, result);
		this.setLines(receipt, result);
		this.setPaymentMethod(receipt, result);

		if (type === 'invoice')
		{
			this.setAdjustments(receipt, result);
			this.setSalesRep(receipt, result);
		}

		result.promocode = receipt.getFieldValue('promocode') ? {
			internalid: receipt.getFieldValue('promocode')
		,	name: receipt.getFieldText('promocode')
		,	code: receipt.getFieldText('couponcode')
		} : null;

		result.lines = _.reject(result.lines, function (line)
		{
			return line.quantity === 0;
		});

		result.status = mainline[0].getText(columns[0]);
		result.internal_status = mainline[0].getValue(columns[0]);

		result.createdfrom = {
			id: mainline[0].getValue(columns[1])
		,	name: mainline[0].getText(columns[1])
		};

		result.summary.total = toCurrency(mainline[0].getValue('total'));
		result.summary.total_formatted = formatCurrency(mainline[0].getValue('total'));
		result.summary.taxtotal = toCurrency(mainline[0].getValue('taxtotal'));
		result.summary.taxtotal_formatted = formatCurrency(mainline[0].getValue('taxtotal'));

		// convert the obejcts to arrays
		result.addresses = _.values(result.addresses);
		result.lines = _.values(result.lines);

		this.setReturnAuthorizations(result, receipt);
		
		if (result.createdfrom && result.createdfrom.id)
		{
			this.setFulfillments(result.createdfrom.id, result);
		}		

		return result;
	}
}));


//Model.js
// CreditCard.js
// ----------------
// This file define the functions to be used on Credit Card service
Application.defineModel('CreditCard', {
	
	validation: {
		ccname: {required: true, msg: 'Name is required'}
	,	paymentmethod: {required: true, msg: 'Card Type is required'}
	,	ccnumber: {required: true, msg: 'Card Number is required'}
	,	expmonth: {required: true, msg: 'Expiration is required'}
	,	expyear: {required: true, msg: 'Expiration is required'}
	}
	
,	get: function (id)
	{
		'use strict';

		//Return a specific credit card
		return customer.getCreditCard(id);
	}
	
,	getDefault: function ()
	{
		'use strict';

		//Return the credit card that the customer setted to default
		return _.find(customer.getCreditCards(), function (credit_card)
		{
			return credit_card.ccdefault === 'T';
		});
	}
	
,	list: function ()
	{
		'use strict';

		//Return all the credit cards with paymentmethod
		return _.filter(customer.getCreditCards(), function (credit_card)
		{
			return credit_card.paymentmethod;
		});
	}
	
,	update: function (id, data)
	{
		'use strict';

		//Update the credit card if the data is valid
		this.validate(data);
		data.internalid = id;

		return customer.updateCreditCard(data);
	}
	
,	create: function (data)
	{
		'use strict';

		//Create a new credit card if the data is valid
		this.validate(data);

		return customer.addCreditCard(data);
	}
	
,	remove: function (id)
	{
		'use strict';

		//Remove a specific credit card
		return customer.removeCreditCard(id);
	}
});

//Model.js
// StoreItem.js
// ----------
// Handles the fetching of items information for a collection of order items
// If you want to fetch multiple items please use preloadItems before/instead calling get() multiple times.

/* jshint -W053 */
// We HAVE to use "new String"
// So we (disable the warning)[https:// groups.google.com/forum/#!msg/jshint/O-vDyhVJgq4/hgttl3ozZscJ]
Application.defineModel('StoreItem', {

	// Returns a collection of items with the items iformation
	// the 'items' parameter is an array of objects {id,type}
	preloadItems: function (items)
	{
		'use strict';

		var self = this
		,	items_by_id = {}
		,	parents_by_id = {};

		items = items || [];

		this.preloadedItems = this.preloadedItems || {};

		items.forEach(function (item)
		{
			if (!item.id || !item.type || item.type === 'Discount' || item.type === 'OthCharge' || item.type === 'Markup')
			{
				return;
			}
			if (!self.preloadedItems[item.id])
			{
				items_by_id[item.id] = {
					internalid: new String(item.id).toString()
				,	itemtype: item.type
				,	itemfields: SC.Configuration.items_fields_standard_keys
				};
			}
		});

		if (!_.size(items_by_id))
		{
			return this.preloadedItems;
		}

		var items_details = this.getItemFieldValues(items_by_id);

		// Generates a map by id for easy access. Notice that for disabled items the array element can be null
		_.each(items_details, function (item)
		{
			if (item && typeof item.itemid !== 'undefined')
			{
				if (item.itemoptions_detail && item.itemoptions_detail.matrixtype === 'child')
				{
					parents_by_id[item.itemoptions_detail.parentid] = {
						internalid: new String(item.itemoptions_detail.parentid).toString()
					,	itemtype: item.itemtype
					,	itemfields: SC.Configuration.items_fields_standard_keys
					};
				}

				self.preloadedItems[item.internalid] = item;
			}
		});

		if (_.size(parents_by_id))
		{
			var parents_details = this.getItemFieldValues(parents_by_id);

			_.each(parents_details, function (item)
			{
				if (item && typeof item.itemid !== 'undefined')
				{
					self.preloadedItems[item.internalid] = item;
				}
			});
		}

		// Adds the parent inforamtion to the child
		_.each(this.preloadedItems, function (item)
		{
			if (item.itemoptions_detail && item.itemoptions_detail.matrixtype === 'child')
			{
				item.matrix_parent = self.preloadedItems[item.itemoptions_detail.parentid];
			}
		});

		return this.preloadedItems;
	}

,	getItemFieldValues: function (items_by_id)
	{
		'use strict';

		var	item_ids = _.values(items_by_id)
		,	is_advanced = session.getSiteSettings(['sitetype']).sitetype === 'ADVANCED';

		// Check if we have access to fieldset
		if (is_advanced)
		{
			try
			{
				// SuiteCommerce Advanced website have fieldsets
				return session.getItemFieldValues(SC.Configuration.items_fields_advanced_name, _.pluck(item_ids, 'internalid')).items;
			}
			catch (e)
			{
				throw invalidItemsFieldsAdvancedName;
			}
		}
		else
		{
			// Sitebuilder website version doesn't have fieldsets
			return session.getItemFieldValues(item_ids);
		}
	}

	// Return the information for the given item
,	get: function (id, type)
	{
		'use strict';

		this.preloadedItems = this.preloadedItems || {};

		if (!this.preloadedItems[id])
		{
			this.preloadItems([{
				id: id
			,	type: type
			}]);
		}
		return this.preloadedItems[id];
	}

,	set: function (item)
	{
		'use strict';

		this.preloadedItems = this.preloadedItems || {};

		if (item.internalid)
		{
			this.preloadedItems[item.internalid] = item;
		}
	}
});

//Model.js
// Case.js
// ----------
// Handles fetching, creating and updating cases.
Application.defineModel('Case', { 

	// ## General settings
	configuration: SC.Configuration.cases

	// Dummy date for cases with no messages. Not common, but it could happen.
,	dummy_date: new Date(1970, 1 ,1)

	// Returns a new Case record
,	getNew: function ()
	{
		'use strict';

		var case_record = nlapiCreateRecord('supportcase');
		
		// Categories
		var category_field = case_record.getField('category');
		var category_options = category_field.getSelectOptions();
		var category_option_values = [];
		
		_(category_options).each(function (category_option) {
			var category_option_value = {
				id: category_option.id
			,	text: category_option.text
			};
			
			category_option_values.push(category_option_value);
		});

		// Origins
		var origin_field = case_record.getField('origin');
		var origin_options = origin_field.getSelectOptions();
		var origin_option_values = [];
		
		_(origin_options).each(function (origin_option) {
			var origin_option_value = {
				id: origin_option.id
			,	text: origin_option.text
			};
			
			origin_option_values.push(origin_option_value);
		});

		// Statuses
		var status_field = case_record.getField('status');
		var status_options = status_field.getSelectOptions();
		var status_option_values = [];
		
		_(status_options).each(function (status_option) {
			var status_option_value = {
				id: status_option.id
			,	text: status_option.text
			};
			
			status_option_values.push(status_option_value);
		});

		// Priorities
		var priority_field = case_record.getField('priority');
		var priority_options = priority_field.getSelectOptions();
		var priority_option_values = [];
		
		_(priority_options).each(function (priority_option) {
			var priority_option_value = {
				id: priority_option.id
			,	text: priority_option.text
			};
			
			priority_option_values.push(priority_option_value);
		});

		// New record to return
		var newRecord = {
			categories: category_option_values
		,	origins: origin_option_values
		,	statuses: status_option_values
		,	priorities: priority_option_values
		};

		return newRecord;
	}

,	getColumnsArray: function ()
	{
		'use strict';

		return [
			new nlobjSearchColumn('internalid')
		,	new nlobjSearchColumn('casenumber')
		,	new nlobjSearchColumn('title')
		,	new nlobjSearchColumn('status')
		,	new nlobjSearchColumn('origin')
		,	new nlobjSearchColumn('category')
		,	new nlobjSearchColumn('company')
		,	new nlobjSearchColumn('createddate')
		,	new nlobjSearchColumn('lastmessagedate')
		,	new nlobjSearchColumn('priority')
		,	new nlobjSearchColumn('email')
		];
	}

	// Returns a Case based on a given id
,	get: function (id)
	{
		'use strict';

		var filters = [new nlobjSearchFilter('internalid', null, 'is', id),	new nlobjSearchFilter('isinactive', null, 'is', 'F')]
		,	columns = this.getColumnsArray()
		,	result = this.searchHelper(filters, columns, 1, true);

		if (result.records.length >= 1)
		{
			return result.records[0];
		}
		else
		{
			throw notFoundError;
		}
	}

	// Retrieves all Cases for a given user
,	search: function (customer_id, list_header_data)
	{
		'use strict';

		var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F')]
		,	columns = this.getColumnsArray()
		,	selected_filter = parseInt(list_header_data.filter, 10);
		
		if (!_.isNaN(selected_filter))
		{
			filters.push(new nlobjSearchFilter('status', null, 'anyof', selected_filter));
		}

		this.setSortOrder(list_header_data.sort, list_header_data.order, columns);

		return this.searchHelper(filters, columns, list_header_data.page, false);
	}

,	searchHelper: function (filters, columns, page, join_messages)
	{
		'use strict';
		
		var self = this
		,	result = Application.getPaginatedSearchResults({
				record_type: 'supportcase'
			,	filters: filters
			,	columns: columns
			,	page: page
			});

		result.records = _.map(result.records, function (case_record)
		{
			var current_record_id = case_record.getId()
			,	created_date = nlapiStringToDate(case_record.getValue('createddate'))
			,	last_message_date = nlapiStringToDate(case_record.getValue('lastmessagedate'))
			,	support_case = {
					internalid: current_record_id
				,	caseNumber: case_record.getValue('casenumber')
				,	title: case_record.getValue('title')
				,	grouped_messages: []
				,	status: {	
						id: case_record.getValue('status')
					,	name: case_record.getText('status')
					}
				,	origin: {
						id: case_record.getValue('origin')
					,	name: case_record.getText('origin')
					}
				,	category: {
						id: case_record.getValue('category')
					,	name: case_record.getText('category')
					}
				,	company: {
						id: case_record.getValue('company')
					,	name: case_record.getText('company')
					}
				,	priority: {
						id: case_record.getValue('priority')
					,	name: case_record.getText('priority')
					}
				,	createdDate: nlapiDateToString(created_date ? created_date : self.dummy_date, 'date')
				,	lastMessageDate: nlapiDateToString(last_message_date ? last_message_date : self.dummy_date, 'date')
				,	email: case_record.getValue('email')
				};
			
			if (join_messages)
			{
				self.appendMessagesToCase(support_case);
			}

			return support_case;
		});

		return result;
	}

,	stripHtmlFromMessage: function (message)
	{
		'use strict';

		return message.replace(/<br\s*[\/]?>/gi, '\n').replace(/<(?:.|\n)*?>/gm, '');
	}

	// When requesting a case detail, messages are included in the response.
,	appendMessagesToCase: function (support_case)
	{
		'use strict';

		var message_columns = {
					message_col: new nlobjSearchColumn('message', 'messages')
				,	message_date_col: new nlobjSearchColumn('messagedate', 'messages').setSort(true)
				,	author_col: new nlobjSearchColumn('author', 'messages')					
			}
		,	message_filters = [new nlobjSearchFilter('internalid', null, 'is', support_case.internalid), new nlobjSearchFilter('internalonly', 'messages', 'is', 'F')]
		,	message_records = Application.getAllSearchResults('supportcase', message_filters, _.values(message_columns))
		,	grouped_messages = []
		,	messages_count = 0
		,	self = this;

		_(message_records).each(function (message_record) 
		{
			var customer_id = nlapiGetUser() + ''
			,	message_date_tmp = nlapiStringToDate(message_record.getValue('messagedate', 'messages'))
			,	message_date = message_date_tmp ? message_date_tmp : self.dummy_date
			,	message_date_to_group_by = message_date.getFullYear() + '-' + (message_date.getMonth() + 1) + '-' + message_date.getDate()
			,	message = {
					author: message_record.getValue('author', 'messages') === customer_id ? 'You' : message_record.getText('author', 'messages')
				,	text: self.stripHtmlFromMessage(message_record.getValue('message', 'messages'))
				,	messageDate: nlapiDateToString(message_date, 'timeofday')
				,	initialMessage: false
				};

			if (grouped_messages[message_date_to_group_by])
			{
				grouped_messages[message_date_to_group_by].messages.push(message);
			}
			else
			{
				grouped_messages[message_date_to_group_by] = {
					date: self.getMessageDate(message_date)
				,	messages: [message]
				};
			}

			messages_count ++;

			if (messages_count === message_records.length)
			{
				message.initialMessage = true;
			}
		});

		support_case.grouped_messages = _(grouped_messages).values();
		support_case.messages_count = messages_count;
	}

,	getMessageDate: function (validJsDate)
	{
		'use strict';

		var today = new Date()
		,	today_dd = today.getDate()
		,	today_mm = today.getMonth()
		,	today_yyyy = today.getFullYear()
		,	dd = validJsDate.getDate()
		,	mm = validJsDate.getMonth()
		,	yyyy = validJsDate.getFullYear();

		if (today_dd === dd && today_mm === mm && today_yyyy === yyyy)
		{
			return 'Today';
		}
		
		return nlapiDateToString(validJsDate, 'date');
	}
	
	// Creates a new Case record
,	create: function (customerId, data)
	{
		'use strict';
		
		customerId = customerId || nlapiGetUser() + '';
		
		var newCaseRecord = nlapiCreateRecord('supportcase');
		
		data.title && newCaseRecord.setFieldValue('title', this.sanitize(data.title));
		data.message && newCaseRecord.setFieldValue('incomingmessage', this.sanitize(data.message));
		data.category && newCaseRecord.setFieldValue('category', data.category);
		data.email && newCaseRecord.setFieldValue('email', data.email);
		customerId && newCaseRecord.setFieldValue('company', customerId);

		var default_values = this.configuration.default_values;

		newCaseRecord.setFieldValue('status', default_values.status_start.id); // Not Started
		newCaseRecord.setFieldValue('origin', default_values.origin.id); // Web

		return nlapiSubmitRecord(newCaseRecord);
	}

,	setSortOrder: function (sort, order, columns) 
	{
		'use strict';

		switch (sort)
		{
			case 'createdDate':
				columns[7].setSort(order > 0);
			break;

			case 'lastMessageDate':
				columns[8].setSort(order > 0);
			break;

			default:
				columns[1].setSort(order > 0);
		}
	}

	// Sanitize html input
,	sanitize: function (text)
	{
		'use strict';

		return text ? text.replace(/<br>/g, '\n').replace(/</g, '&lt;').replace(/\>/g, '&gt;') : '';
	}

	// Updates a Support Case given its id
,	update: function (id, data)
	{
		'use strict';

		if (data && data.status)
		{
			if (data.reply && data.reply.length > 0)
			{
				nlapiSubmitField('supportcase', id, ['incomingmessage', 'messagenew', 'status'], [this.sanitize(data.reply), 'T', data.status.id]);
			}
			else
			{
				nlapiSubmitField('supportcase', id, ['status'], data.status.id);
			}
		}
	}
});

