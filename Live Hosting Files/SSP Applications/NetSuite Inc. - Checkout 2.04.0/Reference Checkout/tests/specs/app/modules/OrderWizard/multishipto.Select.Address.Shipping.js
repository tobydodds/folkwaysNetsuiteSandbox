define(['OrderWizard.Router', 'OrderWizard.Module.MultiShipTo.Select.Addresses.Shipping', './orderwizard.HelperTest'],
	function (OrderWizardRouter, module, TestHelper)
{
	'use strict';

	describe('OrderWizard MultiShipTo Select Shipping Address', function ()
	{
		var module_options = {}
		,	steps =  [
				{
					name: 'Step Group 1'
				,	steps: [
						{
							name: 'Step 1'
						,	url: 'step/1/1'
						,	modules: [
								['OrderWizard.Module.MultiShipTo.Select.Addresses.Shipping', module_options]
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
			var wizard
			,	view_rendered = false
			,	second_address = {
					addr1: '8908 the other street'
				,	addr2: ''
				,	addr3: ''
				,	city: 'The big one'
				,	company: null
				,	country: 'US'
				,	defaultbilling: 'F'
				,	defaultshipping: 'T'
				,	fullname: 'Main Shipping Address'
				,	internalid: '1313'
				,	isresidential: 'F'
				,	isvalid: 'T'
				,	phone: '(658) 901-6677'
				,	state: 'VT'
				,	zip: '11800'
				};

			afterEach(function ()
			{
				helper.application.getLayout().off('afterAppendView', null);
			});

			beforeEach(function ()
			{
				helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;
				// module_options = {};
				_.each(_.keys(module_options), function (key)
				{
					delete module_options[key];
				});
				view_rendered = false;

				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});
			});

			it('should render only a link when this is specified by options', function ()
			{
				module_options.hide_if_valid_addresses = true;

				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				wizard.options.profile.get('addresses').add(second_address, {silent: true});
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $address_link = jQuery('[data-type="add-edit-addreses-link"]');
					expect($address_link.length).toBe(1);
				});
			});

			it('should re-render a show when a new address is added', function ()
			{
				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $addresses = jQuery('.address');
					expect($addresses.length).toBe(1);

					wizard.options.profile.get('addresses').add(second_address);

					$addresses = jQuery('.address');
					expect($addresses.length).toBe(2);
				});
			});

			it('should show all addreses when show only a link and this link is clicked', function ()
			{
				module_options.hide_if_valid_addresses = true;

				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				wizard.options.profile.get('addresses').add(second_address, {silent: true});
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $address_link = jQuery('[data-type="add-edit-addreses-link"]')
					,	$addresses = jQuery('.address');

					expect($addresses.length).toBe(0);
					expect($address_link.length).toBe(1);

					$address_link.first().click();

					$address_link = jQuery('[data-type="add-edit-addreses-link"]');
					$addresses = jQuery('.address');

					expect($address_link.length).toBe(0);
					expect($addresses.length).toBe(2);
				});
			});

			it('should at rendiring erase any previous error (erros when there are not enough valid addresses)', function ()
			{
				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $addresses = jQuery('.address')
					,	$warning_message = jQuery('[data-type="alert-placeholder-module"] > .alert');

					if (!$warning_message.length)
					{
						$warning_message = $warning_message.add('<div>');
					}

					expect($addresses.length).toBe(1);
					expect($warning_message.length).toBe(1);

					wizard.options.profile.get('addresses').add(second_address);

					$addresses = jQuery('.address');
					$warning_message = jQuery('[data-type="alert-placeholder-module"] > .alert');

					expect($addresses.length).toBe(2);
					expect($warning_message.length).toBe(0);
				});
			});

			it('should show a save button when specified and there are not enought valid address', function ()
			{
				module_options.showSaveButton = true;
				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);

				wizard.model.get('addresses').reset();
				wizard.options.profile.get('addresses').reset();

				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					expect(jQuery('#address-module-form-placeholder').length).toBe(1);
					expect(jQuery('#address-module-form-placeholder [data-action="submit"]').length).toBe(1);
				});
			});

			it('should validate and save a new address when an address form is rendered in-line', function ()
			{
				module_options.showSaveButton = true;
				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);

				wizard.model.get('addresses').reset();
				wizard.options.profile.get('addresses').reset();

				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var module = wizard.steps['step/1/1'].moduleInstances[0]
					,	continue_button = jQuery('.btn-continue').last();

					expect(jQuery('#address-module-form-placeholder').length).toBe(1);
					jQuery('#shipaddress-fullname').text('ADDRESS FULL NAME');
					jQuery('#shipaddress-addr1').text('HERE Street 123');
					jQuery('#shipaddress-city').text('NY');
					// jQuery('#shipaddress-country')
					jQuery('#shipaddress-state').text('The State');
					jQuery('#shipaddress-zip').text('11800');
					jQuery('#shipaddress-phone').text('5551231324');

					spyOn(module.addressView.model, 'save');

					jQuery('#address-module-form-placeholder [data-action="submit"]').click();
					continue_button.removeAttr('disabled'); //In the case of OPC the continue button is not disabled, so here we force to be enabled
					continue_button.click();

					expect(module.addressView.model.save.calls.length).toBe(2);
				});
			});

			it('should display an error when press continue with less than 1 valid addresses', function ()
			{
				wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				wizard.model.get('addresses').reset();
				wizard.options.profile.get('addresses').reset();
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var module = wizard.steps['step/1/1'].moduleInstances[0]
					,	continue_button = jQuery('.btn-continue').last();

					spyOn(module, 'manageError');

					continue_button.removeAttr('disabled');
					continue_button.click();

					expect(module.manageError).toHaveBeenCalled();


				});
			});

		});
	});
});