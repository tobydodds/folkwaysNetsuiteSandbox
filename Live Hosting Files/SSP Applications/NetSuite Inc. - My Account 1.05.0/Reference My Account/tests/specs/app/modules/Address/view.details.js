define(['Address', 'TestHelper', './TestCasesData'], function (Address, TestHelper)
{
	'use strict';

	var helper = new TestHelper({
			loadTemplates: true
		,	applicationName: 'Address.Views.Details'
		,	environment: TestCasesData.environment
		,	simpleLayout: true
		,	applicationConfiguration: TestCasesData.configuration
	});

	return describe('Address Views Details', function()
	{
		
		describe('selectors', function(){
			
			_.each(TestCasesData.view, function (data, test_description)
			{


				var view = new Address.Views.Details({
						model: new Address.Model(data)
					,	collection: new Address.Collection()
					,	application: helper.application
					})
				,	asserts = [
						{actual: function (view){ return view.$el.hasClass(view.attributes.class);}, operation:'toBeTruthy'}
					,	{selector:'[data-input="fullname"]', attribute:'size', operation:'toBe', result: 1}
					,	{selector:'[data-input="company"]', attribute:'size', operation:'toBe', result: 1}
					,	{selector:'[data-input="addr1"]', attribute:'size', operation:'toBe', result: 1}
					,	{selector:'[data-input="addr2"]', attribute:'size', operation:'toBe', result: 1}
					,	{selector:'[data-input="city"]', attribute:'size', operation:'toBe', result: 1}
					,	{selector:'[data-input="country"]', attribute:'size', operation:'toBe', result: 1}
					,	{selector:'[data-input="state"]', attribute:'size', operation:'toBe', result: 1}
					,	{selector:'[data-input="zip"]', attribute:'size', operation:'toBe', result: 1}
					,	{selector:'[data-input="isresidential"]', attribute:'size', operation:'toBe', result: 1}
					,	{selector:'[data-input="defaultbilling"]', attribute:'size', operation:'toBe', result: 1}
					,	{selector:'[data-input="defaultshipping"]', attribute:'size', operation:'toBe', result: 1}
					]
				,	aditional_asserts;

				if (data && data.internalid)
				{
					aditional_asserts = [
							{actual: function (view){ return view.$el.hasClass(view.attributes.class);}, operation:'toBeTruthy'}
						,	{selector:'input[name="fullname"]', attribute:'val', operation:'toBe', result: data.fullname}
						,	{selector:'input[name="company"]', attribute:'val', operation:'toBe', result: data.company}
						,	{selector:'input[name="addr1"]', attribute:'val', operation:'toBe', result: data.addr1}
						,	{selector:'input[name="addr2"]', attribute:'val', operation:'toBe', result: data.addr2}
						,	{selector:'input[name="city"]', attribute:'val', operation:'toBe', result: data.city}
						,	{selector:'[name="country"]', attribute:'val', operation:'toBe', result: data.country}
						,	{selector:'[data-type="state"]', attribute:'val', operation:'toBe', result: data.state || ''}
						,	{selector:'input[name="zip"]', attribute:'val', operation:'toBe', result: data.zip || ''}
						,	{selector:'input[name="isresidential"]', attribute:'checked', operation:'toBe', result: data.isresidential === 'T'}
						,	{selector:'input[name="defaultbilling"]', attribute:'checked', operation:'toBe', result: data.defaultbilling === 'T'}
						,	{selector:'input[name="defaultshipping"]', attribute:'checked', operation:'toBe', result: data.defaultshipping === 'T'}
					];
				}
				else
				{	
					aditional_asserts = [
							{actual: function (view){ return view.$el.hasClass(view.attributes.class);}, operation:'toBeTruthy'}
						,	{selector:'input[name="fullname"]', attribute:'val', operation:'toBe', result: ''}
						,	{selector:'input[name="company"]', attribute:'val', operation:'toBe', result: ''}
						,	{selector:'input[name="addr1"]', attribute:'val', operation:'toBe', result: ''}
						,	{selector:'input[name="addr2"]', attribute:'val', operation:'toBe', result: ''}
						,	{selector:'input[name="city"]', attribute:'val', operation:'toBe', result: ''}
						,	{selector:'[name="country"]', attribute:'val', operation:'toBe', result: ''}
						,	{selector:'[data-type="state"]', attribute:'val', operation:'toBe', result: ''}
						,	{selector:'input[name="zip"]', attribute:'val', operation:'toBe', result: ''}
						,	{selector:'input[name="isresidential"]', attribute:'checked', operation:'toBe', result: false}
						,	{selector:'input[name="defaultbilling"]', attribute:'checked', operation:'toBe', result: false}
						,	{selector:'input[name="defaultshipping"]', attribute:'checked', operation:'toBe', result: false}
					];
				}

				asserts = _.union(asserts, aditional_asserts);

				view.render();
				

				helper.testViewSelectors(view, asserts, data, test_description);

			});	
		});

		describe('initialization', function()
		{
			it ('should set title to "Add New Address" if the model is new', function()
			{	
				var model = new Address.Model()
				,	details = new Address.Views.Details({
						model: model
					,	application: helper.application
				});
				expect(details.title).toBe('Add New Address');
				expect(details.title).toBe(details.page_header);
			});

			it ('should set title to "Update Address" if the model is NOT new', function()
			{
				var model = new Address.Model({id:1})
				,	details = new Address.Views.Details({
						model: model
					,	application: helper.application
				});

				expect(details.title).toBe('Update Address');
				expect(details.title).toBe(details.page_header);
			});
		});

		describe('events', function ()
		{

			var view = new Address.Views.Details({
					model: new Address.Model()
				,	application: helper.application
				,	collection: new Address.Collection()
			});

			view.render();

			it('blur on data-type phone should trigger the function formatPhone', function ()
			{
				var phone_input = view.$('input[name="phone"]');

				phone_input.val('1231234123');
				phone_input.blur();
				expect(phone_input.val()).toBe('(123) 123-4123');
			});

			it('should erase zip code', function ()
			{

				var zip_input = view.$('input[name="zip"]');
				zip_input.val('3292');
				view.eraseZip();
				expect(zip_input.val().length).toBe(0);
			});

		});

	});
});