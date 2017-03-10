define(['OrderWizard.Router', 'OrderWizard.Module.MultiShipTo.EnableLink', './orderwizard.HelperTest', 'User.Model'],
	function (OrderWizardRouter, module, TestHelper)
{
	'use strict';

	describe('OrderWizard MultiShipTo Enable Link Module', function ()
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
								'OrderWizard.Module.MultiShipTo.EnableLink'
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
			it('Should NOT render if Multi Ship To is not enabled', function ()
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
					expect(jQuery('[data-action="change-status-multishipto"]').length).toBe(0);
				});
			});

			it('Should display enable Multi Ship To if it is enabled and Multi ship to is NOT set', function ()
			{
				var view_rendered =  false;
				helper.application.getCart().set('ismultishipto', false, {silent: true});
				helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;

				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				var wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $link = jQuery('[data-action="change-status-multishipto"]');
					expect($link.length).toBe(1);
					expect($link.data('type')).toEqual('singleshipto');
				});
			});

			it('Should display enable Multi Ship To if it is enabled and Multi ship to is set', function ()
			{
				var view_rendered =  false;
				helper.application.getCart().set('ismultishipto', true, {silent: true});
				helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;

				helper.application.getLayout().once('afterAppendView', function ()
				{
					setTimeout(function ()
					{
						view_rendered = true;
					}, 1);
				});

				var wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				wizard.startWizard();

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					var $link = jQuery('[data-action="change-status-multishipto"]');
					expect($link.length).toBe(1);
					expect($link.data('type')).toEqual('multishipto');
				});
			});

			it('Should save model and trigger event if multi ship to is changed', function ()
			{
				var view_rendered =  false
				,	multishipto_event_fired = false
				,	ajaxRequest
				,	mock_response = {
						status: 200
					,	responseText: JSON.stringify(helper.sample_cart.twoItems)
					};

				helper.application.getCart().set('ismultishipto', true, {silent: true});
				helper.application.Configuration.siteSettings.isMultiShippingRoutesEnabled = true;

				helper.application.getLayout()
					.once('afterAppendView', function ()
					{
						setTimeout(function ()
						{
							view_rendered = true;
						}, 1);
					});

				var wizard = new OrderWizardRouter(helper.application, helper.wizardOptions);
				wizard.startWizard();

				wizard.model.on('ismultishiptoUpdated', function ()
				{
					multishipto_event_fired =  true;
				});

				waitsFor(function ()
				{
					return view_rendered;
				});

				runs(function ()
				{
					wizard.getCurrentStep().$('[data-action="change-status-multishipto"]').trigger('click');

					ajaxRequest = jasmine.Ajax.requests.mostRecent();
					ajaxRequest.response(mock_response);
				});

				waitsFor(function ()
				{
					return !!jasmine.Ajax.requests.at(0) && multishipto_event_fired;
				});

				runs(function ()
				{
					var sent_params = JSON.parse(jasmine.Ajax.requests.at(0).params);
					expect(sent_params.ismultishipto).toBe(false);
					expect(multishipto_event_fired).toBe(true);
				});
			});

		});

	});
});
