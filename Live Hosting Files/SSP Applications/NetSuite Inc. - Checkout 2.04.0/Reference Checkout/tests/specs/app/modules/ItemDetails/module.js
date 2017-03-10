define(['ItemDetailsPOS.View', 'ItemDetails.Model', 'ItemDetailsPos', 'LiveOrderPos.Model', 'ItemsKeyMapping', 'Application', 'jasmineTypeCheck', 'jQuery', 'Backbone', 'AjaxMock'], function (ItemDetailsView, ItemDetailsModel, ItemDetails, LiveOrderPosModel, ItemsKeyMapping)
{
	'use strict';

	var is_started = false;

	var sampleItemAttributes = {
		id: 12
	,	correlateditems_detail: []
	,	displayname: ''
	,	internalid: 12
	,	isbackorderable: true
	,	isinstock: true
	,	ispurchasable: true
	,	itemid: 'DeclinableItem'
	,	itemimages_detail: {}
	,	itemoptions_detail: {}
	,	itemtype: 'NonInvtPart'
	,	onlinecustomerprice_detail: {
			onlinecustomerprice: 0.51
		,	onlinecustomerprice_formatted: '$0.51'
		}
	,	pricelevel1: 0.51
	,	pricelevel1_formatted: '$0.51'
	,	outofstockbehavior: '- Default -'
	,	outofstockmessage: ''
	,	pagetitle: ''
	,	relateditems_detail: []
	,	relateditemsdescription: ''
	,	showoutofstockmessage: false
	,	stockdescription: ''
	,	storedetaileddescription: ''
	,	storedisplayimage: ''
	,	storedisplayname2: 'The DeclinableItem'
	};

	function getApplication()
	{
		console.log('getApplication() POS');
		return SC.Application('POS');
	}

	describe('Item Details View (Adding Item)', function () {
		var view;

		beforeEach(function()
		{
			if (!is_started)
			{
				// Here is the appliaction we will be using for this tests
				var application = getApplication();
				jQuery(application.start(function ()
				{
					is_started = true;
				}));
				waitsFor(function() {
					return is_started;
				});
				jQuery.ajax({url: '../../../../../templates/Templates.php', async: false}).done(function(data){
					eval(data);
					SC.compileMacros(SC.templates.macros);
				});

				view = new ItemDetailsView({
					application: application
				,	model: new ItemDetailsModel(sampleItemAttributes)
				,	baseUrl: 'www.test.com'
				});

				ItemsKeyMapping.mapAllApplications();

				ItemDetails.mountToApp(application);

				view.showContent();
				jQuery('body').append(view.el);
			}

			jQuery.ajaxMock.on();
		});

		afterEach(function(){
			SC.Application('POS').getCart().suspend();
		});

		it('application\'s should have an ItemsKeyMapping', function(){
			expect(SC.Application('POS').Configuration.itemKeyMapping).toBeTruthy();
		});

		it('should show the item title', function()
		{
			var el = jQuery('[itemprop=name]');
			expect(el.length).toBe(1);
			expect(el.text().trim()).toBe(sampleItemAttributes.storedisplayname2);
		});

		it('should show the item price', function()
		{
			var el = jQuery('.lead-price');
			expect(el.length).toBe(1);
			expect(el.text().trim()).toBe(sampleItemAttributes.onlinecustomerprice_detail.onlinecustomerprice_formatted);
		});

		it('should have a quantity input and add to cart button', function()
		{
			expect(jQuery('input.quantity').length).toBe(1);
			expect(jQuery('button.add-to-cart-btn').length).toBe(1);
		});

		it('should allow to add the line to the cart', function ()
		{
			jQuery.ajaxMock.url(LiveOrderPosModel.prototype.urlRoot, '');

			var quantity = Math.floor(Math.random() * 200) + 1;
			jQuery('#quantity').val(quantity);
			jQuery('[data-type="add-to-cart"]').click();


			expect(getApplication().getCart().get('lines').length).toEqual(1);
			expect(getApplication().getCart().get('lines').at(0).get('quantity')).toEqual(quantity);
		});

		describe('Item Details View (Stock Details)', function () {

			it('should display "In Stock" for non-inventory item that is in stock', function ()
			{
				view.model = new ItemDetailsModel({
						id: 6
					,	displayname: ''
					,	internalid: 6
					,	isbackorderable: true
					,	isinstock: true
					,	ispurchasable: true
					,	itemid: 'NonInv Item'
					,	itemimages_detail: {}
					,	itemoptions_detail: {}
					,	onlinecustomerprice_detail: {
							onlinecustomerprice_formatted: '$10.00'
						,	onlinecustomerprice: 10
						}
					,	onlinecustomerprice: 10
					,	onlinecustomerprice_formatted: '$10.00'
					,	pricelevel1: 10
					,	pricelevel1_formatted: '$10.00'
					,	outofstockbehavior: '- Default -'
					,	outofstockmessage: ''
					,	quantityavailable_detail: {
							locations: []
						,	quantityavailable: 0
						}
					,	showoutofstockmessage: false
					,	stockdescription: ''
					,	storedescription: ''
					,	storedisplayname2: 'NonInv Item'
					,	storedisplaythumbnail: ''
					,	upccode: '456'
					});

				view.showContent();

				jQuery('body').append(view.el);

				expect(jQuery('.stock-status').text().trim()).toEqual('In Stock');
			});

			it('should display "Out of Stock" for that is out of stock', function ()
			{
				view.model = new ItemDetailsModel({
						id: 6
					,	displayname: ''
					,	internalid: 6
					,	isbackorderable: true
					,	isinstock: false
					,	ispurchasable: true
					,	itemid: 'NonInv Item'
					,	itemimages_detail: {}
					,	itemoptions_detail: {}
					,	onlinecustomerprice_detail: {
							onlinecustomerprice_formatted: '$10.00'
						,	onlinecustomerprice: 10
						}
					,	onlinecustomerprice: 10
					,	onlinecustomerprice_formatted: '$10.00'
					,	pricelevel1: 10
					,	pricelevel1_formatted: '$10.00'
					,	outofstockbehavior: '- Default -'
					,	outofstockmessage: 'Out of Stock'
					,	quantityavailable_detail: {
							locations: []
						,	quantityavailable: 0
						}
					,	showoutofstockmessage: false
					,	stockdescription: ''
					,	storedescription: ''
					,	storedisplayname2: 'NonInv Item'
					,	storedisplaythumbnail: ''
					,	upccode: '456'
					});
				view.showContent();

				jQuery('body').append(view.el);

				expect(jQuery('.stock-status').text().trim()).toEqual('Out of Stock');
			});

			it('should display the stock amount & details for an inventory item that is in stock', function ()
			{
				SC.ENVIRONMENT.currentLocation = {internalid: 1};

				view.model = new ItemDetailsModel({
						id: 6
					,	displayname: ''
					,	internalid: 6
					,	isbackorderable: true
					,	isinstock: true
					,	ispurchasable: true
					,	itemid: 'Inv Item'
					,	itemimages_detail: {}
					,	itemoptions_detail: {}
					,	onlinecustomerprice_detail: {
							onlinecustomerprice_formatted: '$10.00'
						,	onlinecustomerprice: 10
						}
					,	onlinecustomerprice: 10
					,	onlinecustomerprice_formatted: '$10.00'
					,	pricelevel1: 10
					,	pricelevel1_formatted: '$10.00'
					,	outofstockbehavior: '- Default -'
					,	quantityavailable_detail: {
							locations: [{
								quantityavailable: 42
							,	internalid: 1
							}
							,	{
								quantityavailable: 42
							,	internalid: 2
							}]
						,	quantityavailable: 84
						}
					,	quantityavailable: 84
					,	stockdescription: ''
					,	storedescription: ''
					,	storedisplayname2: 'Inv Item'
					,	storedisplaythumbnail: ''
					,	upccode: '456'
					});
				view.showContent();

				jQuery('body').append(view.el);

				expect(jQuery('.stock-status').text().trim()).toEqual('42 In Stock');
				expect(jQuery('.stock-detailed').text().trim()).toEqual('84 In Stores');
			});

			it('should display an out of stock message if the inventory item is out of stock for the current location, as well as other stores stock', function ()
			{
				SC.ENVIRONMENT.currentLocation = { internalid: 2 };

				view.model = new ItemDetailsModel({
						id: 'dummyid'
					,	displayname: ''
					,	internalid: 6
					,	isbackorderable: true
					,	isinstock: true
					,	ispurchasable: true
					,	itemid: 'Inv Item'
					,	itemimages_detail: {}
					,	itemoptions_detail: {}
					,	onlinecustomerprice_detail: {
							onlinecustomerprice_formatted: '$10.00'
						,	onlinecustomerprice: 10
						}
					,	onlinecustomerprice: 10
					,	onlinecustomerprice_formatted: '$10.00'
					,	pricelevel1: 10
					,	pricelevel1_formatted: '$10.00'
					,	outofstockbehavior: '- Default -'
					,	quantityavailable_detail: {
							locations: [{
								quantityavailable: 42
							,	internalid: 1
							}]
						,	quantityavailable: 42
						}
					,	quantityavailable: 42
					,	stockdescription: ''
					,	storedescription: ''
					,	storedisplayname2: 'Inv Item'
					,	storedisplaythumbnail: ''
					,	upccode: '456'
					});
				view.showContent();

				jQuery('body').append(view.el);

				expect(jQuery('.stock-status').text().trim()).toEqual('Out of Stock');
				expect(jQuery('.stock-detailed').text().trim()).toEqual('42 In Stores');
			});
		});
	});
});
