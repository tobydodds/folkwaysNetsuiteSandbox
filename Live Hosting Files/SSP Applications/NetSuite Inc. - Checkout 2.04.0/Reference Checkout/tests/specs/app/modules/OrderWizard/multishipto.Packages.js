define(['OrderWizard.Router', 'OrderWizard.Module.MultiShipTo.Packages', './orderwizard.HelperTest'],
	function (OrderWizardRouter, module, TestHelper)
{
	'use strict';

	describe('OrderWizard MultiShipTo Packages', function ()
	{
		var steps =  [
				{
					name: 'Step Group 1'
				,	steps: [
						{
							name: 'Step 1'
						,	url: 'step/1/1'
						,	modules: [
								'OrderWizard.Module.MultiShipTo.Packages'
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
		});

		describe('UI Interaction', function ()
		{
			it('should render nothing if there is not packages set', function ()
			{
				var view_rendered =  false
				,	wizard;

				helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;
				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $packages = jQuery('[data-type="package"]');
					expect($packages.length).toBe(0);
				});
			});

			it('should render a package if there is ony one and still are items to set', function ()
			{
				var view_rendered =  false
				,	first_address
				,	wizard;

				helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;
				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				first_address = wizard.options.profile.get('addresses').first();

				wizard.model.get('lines').first().set('shipaddress', first_address.get('internalid'));
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $packages = jQuery('[data-type="package"]');
					expect($packages.length).toBe(1);
				});
			});

			it('should render all packages when there is no items left', function ()
			{
				var view_rendered =  false
				,	first_address
				,	last_address
				,	extra_address = {
						addr1: 'extra 01'
					,	addr2: null
					,	addr3: null
					,	city: 'extra city 01'
					,	company: null
					,	country: 'extra country 01'
					,	defaultbilling: 'F'
					,	defaultshipping: 'F'
					,	fullname: 'extra address 01'
					,	internalid: '1'
					,	isresidential: 'T'
					,	isvalid: 'T'
					,	phone: '213133131345445'
					,	state: null
					,	zip: '12121212'
					}
				,	wizard
				,	addresses;

				helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;
				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				addresses = wizard.options.profile.get('addresses');

				addresses.add(extra_address);

				last_address = addresses.last();
				first_address =addresses.first();

				wizard.model.get('lines').first().set('shipaddress', first_address.get('internalid'));
				wizard.model.get('lines').last().set('shipaddress', last_address.get('internalid'));
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $packages = jQuery('[data-type="package"]');
					expect($packages.length).toBe(2);
				});
			});

			it('should render each package as a expander with its items', function ()
			{
				var view_rendered =  false
				,	first_address
				,	wizard;

				helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;
				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				first_address = wizard.options.profile.get('addresses').first();
				//Unset all lines/remove all packages
				wizard.model.get('lines').each(function (line)
				{
					line.unset('shipaddress');
				});
				//Set 1 line
				wizard.model.get('lines').first().set('shipaddress', first_address.get('internalid'));
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $packages = jQuery('[data-type="package"]')
					,	$accordion_items = jQuery('.items-container > .item-line');

					expect($packages.length).toBe(1);
					expect($accordion_items.length).toBe(1);
					expect($accordion_items.data('id')).toEqual(wizard.model.get('lines').first().get('item').get('internalid'));
				});
			});

			it('should unset shipping address when selecting remove for a item', function ()
			{
				var view_rendered =  false
				,	first_address
				,	wizard;

				helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;
				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				first_address = wizard.options.profile.get('addresses').first();
				//Unset all lines/remove all packages
				wizard.model.get('lines').each(function (line)
				{
					line.unset('shipaddress');
				});
				//Set 1 line
				wizard.model.get('lines').first().set('shipaddress', first_address.get('internalid'));
				wizard.model.get('lines').last().set('shipaddress', first_address.get('internalid'));
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $accordion_item = jQuery('.items-container > .item-line').first()
					,	$packages = jQuery('[data-type="package"]');

					expect($packages.length).toBe(1);

					expect(wizard.model.get('lines').first().get('shipaddress')).toBe(first_address.id);
					$accordion_item.find('[data-action="remove-item"]').click();
					expect(wizard.model.get('lines').first().get('shipaddress')).toBe(undefined);
				});
			});

			it('should remove package if last item is removed', function ()
			{
				var view_rendered =  false
				,	first_address
				,	wizard;

				helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;
				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				first_address = wizard.options.profile.get('addresses').first();
				//Unset all lines/remove all packages
				wizard.model.get('lines').each(function (line)
				{
					line.unset('shipaddress');
				});
				//Set 1 line
				wizard.model.get('lines').first().set('shipaddress', first_address.get('internalid'));
				spyOn(wizard.model, 'save').andCallFake(function ()
				{
					return jQuery.Deferred().resolve();
				});
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $accordion_item = jQuery('.items-container > .item-line').first()
					,	$packages = jQuery('[data-type="package"]');

					expect($packages.length).toBe(1);

					expect(wizard.model.get('lines').first().get('shipaddress')).toBe(first_address.id);
					$accordion_item.find('[data-action="remove-item"]').click();
					expect(wizard.model.get('lines').first().get('shipaddress')).toBe(undefined);

					$packages = jQuery('[data-type="package"]');
					expect($packages.length).toBe(0);
				});
			});
		});

	});
});