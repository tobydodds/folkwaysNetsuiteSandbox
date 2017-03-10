define(['OrderWizard.Router', 'OrderWizard.Module.MultiShipTo.Set.Addresses.Packages', './orderwizard.HelperTest', 'Cart'],
	function (OrderWizardRouter, module, TestHelper)
{
	'use strict';

	describe('OrderWizard MultiShipTo Set Addresses per Package', function ()
	{
		var steps =  [
				{
					name: 'Step Group 1'
				,	steps: [
						{
							name: 'Step 1'
						,	url: 'step/1/1'
						,	modules: [
								'OrderWizard.Module.MultiShipTo.Set.Addresses.Packages'
							]
						}
					]
				}
			]
		,	helper = new TestHelper(steps, 'twoItems');
		helper.initialize();

		beforeEach(function ()
		{
			runs(function ()
			{
				helper.beforeEach();
			});

			// Makes sure the application is started before continue
			waitsFor(function ()
			{
				return helper.isBeforeEachReady();
			});
		});

		afterEach(function ()
		{
			helper.afterEach();
			helper.application.getCart().set(helper.sample_cart.twoItems);
		});

		describe('UI Interaction', function ()
		{
			var view_rendered =  false
			,	wizard;

			beforeEach(function ()
			{
				view_rendered =  false;

				helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;
				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
			});

			it('Should display each of the selected addresses', function ()
			{
				runs(function ()
				{
					wizard.model.get('addresses').first().set('check', true);
					wizard.startWizard();
				});

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $combo = jQuery('[data-type="set-shipments-address-selector"]')
					,	addresses = wizard.application.getUser().get('addresses');
					expect($combo.length).toBe(1); //Make sure that the selector was rendered
					expect($combo.find('option').length).toBe(addresses.length); //Make sure that each addresses is shown (Becarefull: only valid address will be shown)
					expect($combo.find('option').first().val()).toBe(addresses.first().id);
				});
			});

			it('Should display each of the items in the order with an order of 1 un selected item', function ()
			{
				var view_rendered =  false
				,	local_cart = JSON.parse(JSON.stringify(helper.sample_cart.twoItems))
				,	wizard;

				local_cart.lines.splice(1,1);
				helper.application.getCart().set(local_cart);

				helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;
				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				wizard.model.get('addresses').first().set('check', true);
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $lines = jQuery('.multishipto-item-table-row');
					expect($lines.length).toBe(1);
					expect($lines.filter('[data-id="'+ local_cart.lines[0].internalid +'"]').length).toBe(1);
				});
			});

			it('Should display each of the items in the order with an order of 2 un selected item', function ()
			{
				wizard.model.get('addresses').first().set('check', true);
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $lines = jQuery('.multishipto-item-table-row');
					expect($lines.length).toBe(2);
					expect($lines.filter('[data-id="'+ helper.sample_cart.twoItems.lines[0].internalid +'"]').length).toBe(1);
					expect($lines.filter('[data-id="'+ helper.sample_cart.twoItems.lines[1].internalid +'"]').length).toBe(1);
				});
			});

			it('Should display 1 item of an order with 2 item an one already set', function ()
			{
				wizard.model.get('addresses').first().set('check', true);

				wizard.model.get('lines').
					findWhere({internalid: helper.sample_cart.twoItems.lines[0].internalid}).
					set('shipaddress', 'FAKEADDRESS');

				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $lines = jQuery('.multishipto-item-table-row');
					expect($lines.length).toBe(1);
					expect($lines.filter('[data-id="'+ helper.sample_cart.twoItems.lines[1].internalid +'"]').length).toBe(1);
				});
			});

			it('Should select each item by clicking them', function ()
			{
				wizard.model.get('addresses').first().set('check', true);

				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $lines = jQuery('.multishipto-item-table-row');
					expect($lines.length).toBe(2);
					var line1_id = helper.sample_cart.twoItems.lines[0].internalid
					,	line2_id = helper.sample_cart.twoItems.lines[1].internalid
					,	selector1 = '[data-id="'+ line1_id +'"]'
					,	selector2 = '[data-id="'+ line2_id +'"]'
					,	line1 = wizard.model.get('lines').findWhere({internalid: line1_id})
					,	line2 = wizard.model.get('lines').findWhere({internalid: line2_id});

					expect(line1.get('check')).toBeFalsy();
					jQuery(selector1).click();
					expect(line1.get('check')).toBe(true);

					expect(line2.get('check')).toBeFalsy();
					jQuery(selector2).click();
					expect(line2.get('check')).toBe(true);
				});
			});

			it('Should enable set shipment only when items are selected', function ()
			{
				wizard.model.get('addresses').first().set('check', true);

				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var	line1_id = helper.sample_cart.twoItems.lines[0].internalid
					,	selector1 = '[data-id="'+ line1_id +'"]'
					,	line1 = wizard.model.get('lines').findWhere({internalid: line1_id});

					expect(jQuery('[data-action="submit-step"]').is(':disabled')).toBe(true);
					expect(jQuery('[data-type="multishipto-address-selected"]').length).toBe(0);
					expect(jQuery('[data-type="item-selected-count"]').html()).toBe('0');

					jQuery(selector1).click();
					expect(line1.get('check')).toBe(true);

					expect(jQuery('[data-type="create-shipments"]').is(':disabled')).toBe(false);
					expect(jQuery('[data-type="multishipto-address-selected"]').length).toBe(1);
					expect(jQuery('[data-type="item-selected-count"]').html()).toBe('1');

					jQuery('[data-type="set-shipments-address-selector"]').trigger('change');

					var selected_address = parseInt(jQuery('[data-type="set-shipments-address-selector"]').val(), 10);

					expect(jQuery('[data-type="multishipto-address-selected"] .address .main-container').data('id')).toBe(selected_address);

				});
			});

			it('Should generate a new shipment by click Set Shipmemnt', function ()
			{
				wizard.model.get('addresses').first().set('check', true);

				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $lines = jQuery('.multishipto-item-table-row')
					,	addresses = wizard.application.getUser().get('addresses');

					expect($lines.length).toBe(2);

					var line1_id = helper.sample_cart.twoItems.lines[0].internalid
					,	selector1 = '[data-id="'+ line1_id +'"]'
					,	line1 = wizard.model.get('lines').findWhere({internalid: line1_id});

					jQuery(selector1).click();
					expect(line1.get('check')).toBe(true);
					jQuery('[data-type="create-shipments"]').click();

					expect(line1.get('shipaddress')).toEqual(addresses.first().get('internalid'));
				});
			});

			it ('Should create a package with the specified quantity by item (Split Line)', function ()
			{
				wizard.model.get('lines').first().set('quantity', 3);
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $lines = jQuery('.multishipto-item-table-row');
					$lines.first().click();
					$lines = jQuery('.multishipto-item-table-row');

					//Specify quantity
					expect($lines.first().find('.total-quantity').text()).toEqual('3');
					$lines.first().find('[data-action="split-quantity"]').val(1);
					$lines.first().find('[data-action="split-quantity"]').click();

					//Create shipment
					jQuery('[data-type="create-shipments"]').click();

					//Validate
					expect(JSON.parse(jasmine.Ajax.requests.at(0).params).lines[0].splitquantity).toBe(1);
				});
			});

			it ('Should create a package with all the quantity by item if an ionvalid quantity is specified (Split Line)', function ()
			{
				wizard.model.get('lines').first().set('quantity', 3);
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $lines = jQuery('.multishipto-item-table-row');
					$lines.first().click();
					$lines = jQuery('.multishipto-item-table-row');

					//Specify quantity
					expect($lines.first().find('.total-quantity').text()).toEqual('3');
					$lines.first().find('[data-action="split-quantity"]').val('a');
					$lines.first().find('[data-action="split-quantity"]').click();

					//Create shipment
					jQuery('[data-type="create-shipments"]').click();

					//Validate
					expect(JSON.parse(jasmine.Ajax.requests.at(0).params).lines[0].splitquantity).toBe(null);
				});
			});

			it ('Should create a package with all the quantity by item (Split Line)', function ()
			{
				wizard.model.get('lines').first().set('quantity', 3);
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $lines = jQuery('.multishipto-item-table-row');
					$lines.first().click();
					$lines = jQuery('.multishipto-item-table-row');

					//Specify quantity
					expect($lines.first().find('.total-quantity').text()).toEqual('3');

					//Create shipment
					jQuery('[data-type="create-shipments"]').click();

					//Validate
					expect(JSON.parse(jasmine.Ajax.requests.at(0).params).lines[0].splitquantity).toBe(null);
				});
			});

		});
	});

});
