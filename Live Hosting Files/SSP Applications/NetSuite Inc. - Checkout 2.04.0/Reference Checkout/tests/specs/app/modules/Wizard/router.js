//Wizard/router.js - test for WizardRouter

define(['Wizard.Router', 'Application'], function (WizardRouter)
{
	'use strict';

	return describe('Module: Wizard (Basic Usage)', function () {

		var is_started = false
		,	application
		,	wizardRouter;

		var steps1 = [
			{
				name: 'Step 1'
			,	steps: [
					{
						name: 'Step1'
					,	url: 'step/1'
					,	showStep: function () {return true;}
					,	modules: [
						]
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
					,	showStep: function () {return true;}
					,	modules: [
						]
					}
				]
			}
		];

		beforeEach(function ()
		{
			// Here is the appliaction we will be using for this tests
			application = SC.Application('WizardTest1');
			// This is the configuration needed by the modules in order to run
			application.Configuration =  {
				//modules: [ 'Wizard' ]
			};
			try {
				Backbone.history.start();
			} catch(ex){}

			// Starts the application
			jQuery(application.start(function () {
				if (SC.ENVIRONMENT.PROFILE)
				{
					application.getUser().set(SC.ENVIRONMENT.PROFILE);
				}
				//Wizard = require('Wizard')
				wizardRouter = new WizardRouter(application, {steps: steps1});
				//spyOn(wizardRouter, 'runStep');
				application.getLayout().appendToDom();
				is_started = true;
			}));

			// Makes sure the application is started before
			waitsFor(function() {
				return is_started;
			});
		});

		afterEach(function(){
			Backbone.history.navigate('', {trigger: false});
			try {
				Backbone.history.stop();
			} catch(ex){}
		});

		it('#0 spec initialization', function ()
		{
			expect(WizardRouter).toBeDefined();
			expect(_(WizardRouter).isFunction()).toBe(true);
		});

		it('#1 basic wizard properties setup', function ()
		{
			expect(_(wizardRouter.steps).size()).toBe(3);
			expect(wizardRouter.steps['step/1'] && wizardRouter.steps['step/1/1'] && wizardRouter.steps['step/2']).toBeTruthy();
			expect(wizardRouter.steps['step/1'].modules.length===0 &&
				wizardRouter.steps['step/1/1'].modules.length===0 &&
				wizardRouter.steps['step/2'].modules.length===0).toBe(true);
			expect(_(wizardRouter.stepGroups).size()).toBe(2);
		});

		it('#2 goToNextStep, getCurrentStep, step.state, getNextStepUrl, goToPreviousStep, getPreviousStepUrl', function ()
		{
			Backbone.history.navigate(wizardRouter.stepsOrder[0], {trigger: true});
			var wizard = wizardRouter;//application.getLayout().currentView.wizard;

			expect(wizard.getCurrentStep()).toBe(wizard.steps[wizard.stepsOrder[0]]);
			expect(wizard.getCurrentStep().state).toBe('present');
			expect(wizard.steps['step/1/1'].state).toBe('future');
			expect(wizard.steps['step/2'].state).toBe('future');
			expect(wizard.getNextStepUrl()).toBe('step/1/1');

			wizard.goToNextStep();
			expect(window.location.hash).toBe('#'+wizard.stepsOrder[1]);
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
			Backbone.history.navigate(wizardRouter.stepsOrder[0], {trigger: true});
			var wizard = wizardRouter;//application.getLayout().currentView.wizard;
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