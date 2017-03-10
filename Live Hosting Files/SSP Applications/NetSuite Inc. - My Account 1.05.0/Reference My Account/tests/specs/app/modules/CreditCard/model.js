define(['CreditCard', 'TestHelper', './TestCasesData'], function (CreditCard, TestHelper)
{
	'use strict';


	var helper = new TestHelper({
			applicationName: 'CreditCard.Model'
		,	environment: TestCasesData.environment
		,	applicationConfiguration: TestCasesData.configuration
	});


	return describe('Credit Card Model', function() {
	
		describe('validations', function()
		{
			_.each(TestCasesData.model, function (test, test_description)
			{
				var model = new CreditCard.Model(test.data);
				helper.testModelValidations(model, test, test_description);
			});
		});
	});
});