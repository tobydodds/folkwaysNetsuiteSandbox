define(['OrderWizard.Router', 'Application'], function (OrderWizardRouter)
{
	'use strict';

	return describe('Module: OrderWizard (Basic Usage)', function () {

		var is_started = false
		,	application
		,	orderWizardRouter
		,	steps1 = [
			{
				name: 'Step 1'
			,	steps: [
					{
						name: 'Step1'
					,	url: 'step/1'
					,	modules: [
						]
					,	showStep: function () {return true;}
					}
				,	{
						name: 'Step 1.1'
					,	url: 'step/1/1'
					,	showStep: function () {return true;}
					,	modules: [
						]
					}
				]
			}
		,	{
				name: 'Step 2'
			,	steps: [
					{
						name: 'Step 2'
					,	url: 'step/2'
					,	modules: [
						]
					,	showStep: function () {return true;}
					}
				]
			}
		];

		jQuery.ajax({url: '../../../../../templates/Templates.php', async: false}).done(function(data){ eval(data); SC.compileMacros(SC.templates.macros); });

		beforeEach(function ()
		{
			// Here is the appliaction we will be using for this tests
			application = SC.Application('OrderWizardTest');
			// This is the configuration needed by the modules in order to run
			application.Configuration =  {};

			try
			{
				Backbone.history.start();
			}
			catch (e) {	}

			application.Configuration = {
				modules: [
					'ItemsKeyMapping'
				,	'ItemDetails'
				,	'Profile'
				,	'Cart'
				,	'ErrorManagement'
				]
			};
			// Starts the application
			jQuery(application.start(function ()
			{
				if (SC.ENVIRONMENT.CART)
				{
					application.getCart().set(SC.ENVIRONMENT.CART);
				}

				if (SC.ENVIRONMENT.PROFILE)
				{
					application.getUser().set(SC.ENVIRONMENT.PROFILE);
				}

				if (SC.ENVIRONMENT.ADDRESS)
				{
					application.getUser().get('addresses').reset(SC.ENVIRONMENT.ADDRESS);
				}

				if (SC.ENVIRONMENT.CREDITCARD)
				{
					application.getUser().get('creditcards').reset(SC.ENVIRONMENT.CREDITCARD);
				}

				var options = {
						steps: steps1
					,	model: application.getCart()
					,	profile: application.getUser()
				};

				orderWizardRouter = new OrderWizardRouter(application, options);

				application.getLayout().appendToDom();
				is_started = true;
			}));

			// Makes sure the application is started before
			waitsFor(function()
			{
				return is_started;
			});
		});

		afterEach(function(){
			Backbone.history.navigate('', {trigger: false});
			try
			{
				Backbone.history.stop();
			} catch(ex) { }
		});

		it('#0 spec initialization', function ()
		{
			expect(OrderWizardRouter).toBeDefined();
			expect(_(OrderWizardRouter).isFunction()).toBe(true);
		});

		it('#1 basic wizard properties setup', function ()
		{
			expect(_(orderWizardRouter.steps).size()).toBe(3);
			expect(orderWizardRouter.steps['step/1'] && orderWizardRouter.steps['step/1/1'] && orderWizardRouter.steps['step/2']).toBeTruthy();
			expect(orderWizardRouter.steps['step/1'].modules.length===0 &&
				orderWizardRouter.steps['step/1/1'].modules.length===0 &&
				orderWizardRouter.steps['step/2'].modules.length===0).toBe(true);
			expect(_(orderWizardRouter.stepGroups).size()).toBe(2);
		});

		it('#2 goToNextStep, getCurrentStep, step.state, getNextStepUrl, goToPreviousStep, getPreviousStepUrl', function ()
		{
			var wizard = orderWizardRouter;
			wizard.getFirstStepUrl = function ()
			{
				return wizard.stepsOrder[0];
			};
			wizard.startWizard();
			expect(wizard.getCurrentStep()).toBe(wizard.steps[wizard.stepsOrder[0]]);
			expect(wizard.getCurrentStep().state).toBe('present');
			expect(wizard.steps['step/1/1'].state).toBe('future');
			expect(wizard.steps['step/2'].state).toBe('future');
			expect(wizard.getNextStepUrl()).toBe('step/1/1');

			wizard.goToNextStep();
			expect(window.location.hash).toBe('#' + wizard.stepsOrder[1]);
			expect(wizard.getCurrentStep()).toBe(wizard.steps[wizard.stepsOrder[1]]);
			expect(wizard.getCurrentStep().state).toBe('present');
			expect(wizard.steps['step/1'].state).toBe('past');
			expect(wizard.steps['step/1/1'].state).toBe('present');
			expect(wizard.steps['step/2'].state).toBe('future');
			expect(wizard.getNextStepUrl()).toBe('step/2');
			expect(wizard.getPreviousStepUrl()).toBe('step/1');

			wizard.goToNextStep();
			expect(window.location.hash).toBe('#'+wizard.stepsOrder[2]);
			expect(wizard.getCurrentStep()).toBe(wizard.steps[wizard.stepsOrder[2]]);
			expect(wizard.getCurrentStep().state).toBe('present');
			expect(wizard.steps['step/1'].state).toBe('past');
			expect(wizard.steps['step/1/1'].state).toBe('past');
			expect(wizard.steps['step/2'].state).toBe('present');
			expect(wizard.getPreviousStepUrl()).toBe('step/1/1');

			wizard.goToPreviousStep();
			expect(window.location.hash).toBe('#'+wizard.stepsOrder[1]+'?force=true');
			expect(wizard.getCurrentStep()).toBe(wizard.steps[wizard.stepsOrder[1]]);
			expect(wizard.getCurrentStep().state).toBe('present');
			expect(wizard.steps['step/1'].state).toBe('past');
			expect(wizard.steps['step/1/1'].state).toBe('present');
			expect(wizard.steps['step/2'].state).toBe('future');
			expect(wizard.getNextStepUrl()).toBe('step/2');
			expect(wizard.getPreviousStepUrl()).toBe('step/1');
		});

		it('#3 getStepPosition', function ()
		{
			Backbone.history.navigate(orderWizardRouter.stepsOrder[0], {trigger: true});
			var wizard = orderWizardRouter;
			expect(wizard.getStepPosition().fromBegining).toBe(0);
			expect(wizard.getStepPosition().toLast).toBe(2);
			expect(wizard.getStepPosition('step/1').toLast).toBe(2);
			expect(wizard.getStepPosition('step/2').toLast).toBe(0);

			wizard.goToNextStep();
			expect(wizard.getStepPosition().fromBegining).toBe(1);
			expect(wizard.getStepPosition().toLast).toBe(1);
			expect(wizard.getStepPosition('step/2').toLast).toBe(0);
			expect(wizard.getStepPosition('step/1/1').toLast).toBe(1);

			wizard.goToNextStep();
			expect(wizard.getStepPosition().fromBegining).toBe(2);
			expect(wizard.getStepPosition().toLast).toBe(0);
		});
	});
});