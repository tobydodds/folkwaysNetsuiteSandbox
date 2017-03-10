define(['OrderWizard.Router', 'OrderWizard.Module.CartSummary', './orderwizard.HelperTest', 'User.Model'],
	function (OrderWizardRouter, module, TestHelper)
{
	'use strict';

	describe('OrderWizard Cart Summary Module', function ()
	{
		var steps =  [
				{
					name: 'Step Group 1'
				,	steps: [
						{
							name: 'Step 1'
						,	showStep: function () {return true;}
						,	url: 'step/1/1'
						,	modules: [
								'OrderWizard.Module.CartSummary'
							]
						}
					,	{
							name: 'Step 2'
						,	url: 'step/2/1'
						,	showStep: function () {return true;}
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

			it('Should re-render on module summary changes', function ()
			{
				var wizard
				,	view_rendered =  false;

				runs(function ()
				{
					helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = false;
					wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
					wizard.startWizard();
				});

				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var current_module = wizard.steps['step/1/1'].moduleInstances[0];

					spyOn(current_module, 'render');

					wizard.model.trigger('change:summary', wizard.model, {
						isGuest: false,
						isLoggedIn: true,
						isRecognized: true
					});

					expect(current_module.render).toHaveBeenCalled();
					expect(jQuery('.promocode-unsupported-summary-warning').length).toBe(0);
				});
			});

			it('Should sould be disable promocode if it is MST', function ()
			{
				var wizard
				,	view_rendered =  false;

				runs(function ()
				{
					helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;
					wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
					wizard.model.set('ismultishipto', true);
					wizard.startWizard();
				});

				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					expect(jQuery('.promocode-unsupported-summary-warning').length).toBe(1);
				});
			});

			it('Should save the order when applying a new Promo Code', function ()
			{
				var wizard
				,	view_rendered =  false
				,	ajaxRequest
				,	mock_response = {
						status: 200
					,	responseText: JSON.stringify(helper.sample_cart.twoItems)
					};

				runs(function ()
				{
					wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
					wizard.model.set('ismultishipto', false);
					wizard.startWizard();
				});

				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					jQuery('#promocode').val('TEST_CODE');

					var fake_event = jQuery.Event('submit', {
						target: jQuery('form[data-action="apply-promocode"]').get(0)
					});

					jQuery('form[data-action="apply-promocode"]').trigger(fake_event);

					ajaxRequest = jasmine.Ajax.requests.mostRecent();
					ajaxRequest.response(mock_response);
				});

				waitsFor(function ()
				{
					return !!jasmine.Ajax.requests.at(0);
				});

				runs(function ()
				{
					var sent_params = JSON.parse(jasmine.Ajax.requests.at(0).params);
					expect(sent_params.promocode.code).toEqual('TEST_CODE');
				});
			});

			it('Should set promo code to null when removing the promo code', function ()
			{
				var wizard
				,	view_rendered =  false
				,	ajaxRequest
				,	mock_response = {
						status: 200
					,	responseText: JSON.stringify(helper.sample_cart.twoItems)
					};

				runs(function ()
				{
					wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
					wizard.model.set('ismultishipto', false);
					wizard.model.set('promocode', {
						code: '50GENCODE'
					,	internalid: '1'
					,	isvalid: true
					}, {silent: true});
					wizard.startWizard();
				});

				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					expect(jQuery('.cart-summary-promocode-applied').length).toBe(1);
					expect(jQuery('.promocode-unsupported-summary-warning').length).toBe(0);
					expect(jQuery.trim(jQuery('.cart-summary-promocode-applied>.text-success').text())).toEqual('#50GENCODE - Instant Rebate');

					jQuery('[data-action="remove-promocode"]').click();

					ajaxRequest = jasmine.Ajax.requests.mostRecent();
					ajaxRequest.response(mock_response);
				});

				waitsFor(function ()
				{
					return !!jasmine.Ajax.requests.at(0);
				});

				runs(function ()
				{
					var sent_params = JSON.parse(jasmine.Ajax.requests.at(0).params);
					expect(sent_params.promocode).toBe(null);
				});
			});

		});

	});
});
