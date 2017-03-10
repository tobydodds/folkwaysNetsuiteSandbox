define(['OrderWizard.Router', 'OrderWizard.Module.Confirmation', './orderwizard.HelperTest'],
	function (OrderWizardRouter, module, TestHelper)
{
	'use strict';

	var confirmation_data = {'confirmationnumber':'2717-416', 'internalid':605, 'reasoncode':null, 'statuscode':'success'};

	describe('OrderWizard Module Confirmation', function ()
	{
		var steps =  [
				{
					name: 'Step Group 1'
				,	steps: [
						{
							name: 'Step 1'
						,	url: 'step/1/1'
						,	modules: [
								'OrderWizard.Module.Confirmation'
							]
						}
					]
				}
			]
		,	helper = new TestHelper(steps, 'withConfirmation', {
				preserveConfirmation: true
			});

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
				if (helper.isBeforeEachReady())
				{
					helper.wizardOptions.model.set('confirmation', confirmation_data);
				}
				return helper.isBeforeEachReady();
			});
		});

		afterEach(function ()
		{
			helper.afterEach();
		});

		describe('Update url', function ()
		{
			it('the url should have the parameter "last_order_id"', function ()
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
					expect(_.parseUrlOptions(window.location.hash).last_order_id).toBe('' + helper.application.getCart().get('confirmation').internalid);
				});
			});

		});

	});


	describe('OrderWizard Module Confirmation without additional confirmation message', function ()
	{
		var steps =  [
				{
					name: 'Step Group 1'
				,	steps: [
						{
							name: 'Step 1'
						,	url: 'step/1/1'
						,	modules: [
								'OrderWizard.Module.Confirmation'
							]
						}
					]
				}
			]
		,	helper = new TestHelper(steps, 'withConfirmation');
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
				if (helper.isBeforeEachReady())
				{
					helper.wizardOptions.model.set('confirmation', confirmation_data);
				}
				return helper.isBeforeEachReady();
			});
		});

		afterEach(function ()
		{
			helper.afterEach();
		});

		describe('UI Interaction', function ()
		{
			it('should not render additional confirmation message', function ()
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
					if (helper.isBeforeEachReady())
					{
						helper.wizardOptions.model.set('confirmation', confirmation_data);
					}
					return view_rendered;
				});

				runs(function ()
				{
					var $messagge = jQuery('.additional_confirmation_message');
					expect($messagge.length).toBe(0);
				});
			});

		});

	});

	describe('OrderWizard Module Confirmation with additional confirmation message', function ()
	{
		var steps =  [
				{
					name: 'Step Group 1'
				,	steps: [
						{
							name: 'Step 1'
						,	url: 'step/1/1'
						,	modules: [
								['OrderWizard.Module.Confirmation', {additional_confirmation_message: 'THANKS!'}]
							]
						}
					]
				}
			]
		,	helper = new TestHelper(steps, 'withConfirmation');
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
				if (helper.isBeforeEachReady())
				{
					helper.wizardOptions.model.set('confirmation', confirmation_data);
				}
				return helper.isBeforeEachReady();
			});
		});

		afterEach(function ()
		{
			helper.afterEach();
		});

		describe('UI Interaction', function ()
		{
			it('should render additional confirmation message', function ()
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
					var $messagge = jQuery('.additional_confirmation_message');
					expect($messagge.length).toBe(1);
				});
			});

			it('should be the same of configuration file', function ()
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
					var $messagge = jQuery('.additional_confirmation_message');
					expect($messagge.html()).toBe('THANKS!');
				});
			});

		});

	});

});