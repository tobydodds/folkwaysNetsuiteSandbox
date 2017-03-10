define(['CreditCard', 'TestHelper', './TestCasesData'], function (CreditCard, TestHelper)
{
	'use strict';

	var helper = new TestHelper({
			applicationName: 'CreditCard.View'
		,	environment: TestCasesData.environment
		,	loadTemplates: true
		,	applicationConfiguration: TestCasesData.configuration
	});


	return describe('Credit Card Views', function()
	{
		var CreditCardViews = CreditCard.Views;
		describe('list view', function()
		{
			var list_view
			,	showContentSpy = jasmine.createSpy('Mock Show Content function');
			
			helper.application.getLayout = function ()
			{
				return {
					showContent:  showContentSpy
				};
			};
	
			describe('show content', function()
			{

				list_view = new CreditCardViews.List({application: helper.application});

				it ('should call the show content of the current layout', function ()
				{
					list_view.showContent();
					expect(helper.application.getLayout().showContent).toHaveBeenCalled();
				});
			});

			describe('remove', function()
			{
				var fake_destroy_model = jasmine.createSpy('fake destroy')
				,	fake_collection = {
						get: jasmine.createSpy('fake get method').andCallFake(function ()
						{
							return {
								destroy: fake_destroy_model
							};
						})
					}

				,	confirm_result = true;

				window.confirm = jasmine.createSpy('mock confirm').andCallFake(function()
				{
					return confirm_result;
				});

				beforeEach(function() {
					list_view = new CreditCardViews.List({
						application: helper.application
					});
					list_view.collection = fake_collection;
				});

				it ('should call get in the collection and destroy on the model if the user confirm deletion', function ()
				{
					//Fafe obj event
					list_view.remove({
						preventDefault: function(){}
					});

					expect(fake_collection.get).toHaveBeenCalled();
					expect(fake_collection.get().destroy).toHaveBeenCalled();
				});
			});
		});

		describe('details view', function()
		{
			describe('initialization', function()
			{
				it ('should set title to "Add Credit Card" if the model is new', function()
				{

					var fake_model = new CreditCard.Model()
					,	fake_collection = new CreditCard.Collection();

					var details = new CreditCardViews.Details({
						model: fake_model
					,	collection: fake_collection
					,	application: helper.application
					});

					expect(details.title).toBe('Add Credit Card');
				});

				it ('should set title to "Edit Credit Card" if the model is NOT new', function()
				{

					var fake_model = new CreditCard.Model({internalid:20, ccname: 'pepe', ccnumber: '**********1111', expmouth:'10', expyear:'2010'})
					,	fake_collection = new CreditCard.Collection();

					var details = new CreditCardViews.Details({
						model: fake_model
					,	collection: fake_collection
					,	application: helper.application
					});

					expect(details.title).toBe('Edit Credit Card');
				});
			});

		});

	});

});