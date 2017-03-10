// Wizard.StepGroup.js
// --------------
// Utility Class to represent a Step Group
define('Wizard.StepGroup', function ()
{
	'use strict';

	function StepGroup(name, url)
	{
		this.name = name;
		this.url = '/' + url;

		// collection of steps
		this.steps = [];

		this.hasErrors = function ()
		{
			return _.some(this.steps, function (step)
			{
				return step.hasErrors();
			});
		};

		this.getErrors = function ()
		{
			var errors = [];
			_.each(this.steps, function (step)
			{
				_.each(step.moduleInstances, function (module_instance)
				{
					if (_.isArray(module_instance.error))
					{
						//This case happend when the module is a proxy that group all its submodule errors
						_.each(module_instance.error, function (an_error)
						{
							errors.push(an_error);
						});
					}
					else if (_.isObject(module_instance.error))
					{
						errors.push(module_instance.error);
					}
					else if (_.isString(module_instance.error))
					{
						errors.push({
							errorCode:'ERR_WS_UNHANDLED_ERROR'
						,	errorMessage: module_instance.error
						});
					}
				});
			});
			return errors;
		};

		this.showStepGroup = function ()
		{
			return _.some(this.steps, function (step)
				{
					return step.showStep();
				});
		};
	}

	return StepGroup;
});