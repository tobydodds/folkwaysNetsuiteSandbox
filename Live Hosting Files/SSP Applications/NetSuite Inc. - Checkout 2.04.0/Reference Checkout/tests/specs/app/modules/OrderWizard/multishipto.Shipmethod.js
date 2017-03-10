define(['OrderWizard.Router', 'OrderWizard.Module.MultiShipTo.Shipmethod', './orderwizard.HelperTest', 'Address.Model'],
	function (OrderWizardRouter, module, TestHelper, Address)
{
	'use strict';

	describe('OrderWizard MultiShipTo Shipmethod', function ()
	{
		var steps =  [
				{
					name: 'Step Group 1'
				,	steps: [
						{
							name: 'Step 1'
						,	url: 'step/1/1'
						,	modules: [
								['OrderWizard.Module.MultiShipTo.Shipmethod', {is_read_only: false}]
							]
						}
					,	{
							name: 'Step 2'
						,	url: 'step/2/1'
						,	modules: [
								['OrderWizard.Module.MultiShipTo.Shipmethod', {is_read_only: true}]
							]
						}
					]
				}
			]
		,	helper = new TestHelper(steps, 'twoItemsWithMultiShipToShipmethods');
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

			it('Should package per address', function ()
			{
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

			it('Should render each package with it corresponding editable shipmethod', function ()
			{
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $packages = jQuery('[data-type="package"]')
					,	selected_package = $packages.first()
					,	address_id = selected_package.data('address-id')
					,	shipmethods = wizard.model.get('multishipmethods');

					expect($packages.length).toBe(2);
					expect(selected_package.find('[data-type="delivery-method-option"]').length).toBe(shipmethods[address_id].length);

					selected_package = $packages.last();
					address_id = selected_package.data('address-id');

					expect(selected_package.find('[data-type="delivery-method-option"]').length).toBe(shipmethods[address_id].length);
				});
			});

			it('Should allow set the ship method', function ()
			{
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var current_module = wizard.steps['step/1/1'].moduleInstances[0]
					,	$packages = jQuery('[data-type="package"]')
					,	selected_package = $packages.first()
					,	address_id = selected_package.data('address-id')
					,	shipmethods = wizard.model.get('multishipmethods')
					,	selected_delivery_method = selected_package.find('[data-type="delivery-method-option"]').last()
					,	delivery_id = selected_delivery_method.data('deliverymethod-id');

					spyOn(current_module, 'saveChanges').andCallFake(function()
					{
						return jQuery.Deferred().resolve();
					});

					selected_delivery_method.click();

					expect(shipmethods[address_id].get(delivery_id).get('check')).toBe(true);

					$packages = jQuery('[data-type="package"]');
					selected_package = $packages.last();
					address_id = selected_package.data('address-id');
					selected_delivery_method = selected_package.find('[data-type="delivery-method-option"]').last();
					delivery_id = selected_delivery_method.data('deliverymethod-id');

					expect(shipmethods[address_id].get(delivery_id).get('check')).toBeFalsy();

					selected_delivery_method.click();
					expect(shipmethods[address_id].get(delivery_id).get('check')).toBe(true);
				});
			});

			it('Should display a readonly version when specified', function ()
			{
				var shipmethods = wizard.model.get('multishipmethods');

				wizard.model.get('lines').each(function (line)
				{
					var selected_shipmethods = shipmethods[line.get('shipaddress')];
					line.set('shipmethod', selected_shipmethods.first().get('internalid'));
				});

				wizard.startWizard();
				wizard.goToNextStep();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $packages = jQuery('[data-type="package"]')
					,	selected_package = $packages.first();

					expect(selected_package.find('[data-type="delivery-method-option"]').length).toBe(1);

					selected_package = $packages.last();
					expect(selected_package.find('[data-type="delivery-method-option"]').length).toBe(1);
				});
			});
		});

		describe('Update Address', function ()
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

			it ('should retrieve shipping methods if the address update change country and-or zip code', function ()
			{
				var profile_addresses = wizard.options.profile.get('addresses');
				wizard.model.get('addresses').each(function (model_address)
				{
					profile_addresses.add(new Address(model_address.attributes), {silent: true});
				});

				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var current_module = wizard.steps['step/1/1'].moduleInstances[0]
					,	$packages = jQuery('[data-type="package"]')
					,	selected_package = $packages.first()
					,	address_id = selected_package.data('address-id');

					spyOn(current_module, 'reloadShppingMethodForAddress');
					profile_addresses.get(address_id).set('zip', '22800');

					expect(current_module.reloadShppingMethodForAddress.argsForCall[0]).toEqual([address_id.toString()]);
				});
			});

			it('should get in a invalid states (without setting the new delivery methods) after updating', function ()
			{
				var profile_addresses = wizard.options.profile.get('addresses');
				wizard.model.get('addresses').each(function (model_address)
				{
					profile_addresses.add(new Address(model_address.attributes), {silent: true});
				});

				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $packages = jQuery('[data-type="package"]')
					,	selected_package = $packages.first()
					,	address_id = selected_package.data('address-id').toString()
					,	package_lines = wizard.model.get('lines').where({'shipaddress': address_id})
					,	shipmethods = wizard.model.get('multishipmethods')
					,	unset_lines;

					wizard.model.get('lines').each(function (line)
					{
						line.set('shipmethod', shipmethods[line.get('shipaddress')].first().id);
					});

					unset_lines = _.find(package_lines, function (line)
					{
						return !line.get('shipmethod');
					});

					spyOn(wizard.model, 'save');

					expect(unset_lines).toBeUndefined();

					profile_addresses.get(address_id).set('zip', '22800');
					unset_lines = _.find(package_lines, function (line)
						{
							return !line.get('shipmethod');
						});

					expect(unset_lines).toBeDefined();
					expect(wizard.model.save).toHaveBeenCalled();
				});
			});

			it('should notify the user if when retrieving the delivery methods none is get back', function ()
			{
				var profile_addresses = wizard.options.profile.get('addresses');
				wizard.model.get('addresses').each(function (model_address)
				{
					profile_addresses.add(new Address(model_address.attributes), {silent: true});
				});

				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var current_module = wizard.steps['step/1/1'].moduleInstances[0]
					,	shipmethods = wizard.model.get('multishipmethods');

					wizard.model.get('lines').each(function (line)
					{
						line.set('shipmethod' , null, {silent: true});
					});
					_.each(_.keys(shipmethods), function (address_id)
					{
						shipmethods[address_id].reset();
					});

					expect(jQuery('.error-message-no-shipping-address').length).toBe(0);
					current_module.render();
					expect(jQuery('.error-message-no-shipping-address').length).toBe(2); //One per package

				});
			});
		});
	});
});