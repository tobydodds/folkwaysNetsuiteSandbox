define(['TestHelper', 'Address', './TestCasesData'], function (TestHelper, Address)
{
	'use strict';

	var helper = new TestHelper({
			applicationName: 'AddressViewList'
		,	loadTemplates: true
		,	environment: TestCasesData.environment
	});


	return describe('Address View List', function()
	{

		describe('selectors', function(){
			
			_.each(TestCasesData.collection, function (data, test_description)
			{

				var view = new Address.Views.List({
						collection: new Address.Collection(data)
					,	application: helper.application
					})
				,	asserts = [
						{actual: function (view){ return view.$el.hasClass(view.attributes.class);}, operation:'toBeTruthy'}
					,	{selector:'.address', attribute:'size', operation:'toBe', result: data.length}
					,	{selector:'.add-new-address', attribute: 'size', result: 1}
					,	{selector:'.address-title', attribute:'size', operation:'toBe', result: data.length}
					,	{selector:'.address-name', attribute:'size', operation:'toBe', result: data.length}
					,	{selector:'.address-addr1', attribute:'size', operation:'toBe', result: data.length}
					,	{selector:'.address-addr2', attribute:'size', operation:'toBe', result: data.length}
					,	{selector:'.address-country', attribute:'size', operation:'toBe', result: data.length}
					,	{selector:'.address-city', attribute:'size', operation:'toBe', result: data.length}
					,	{selector:'.address-zip', attribute:'size', operation:'toBe', result: data.length}
					,	{selector:'.address-state', attribute:'size', operation:'toBe', result: _.filter(data, function(address){ return address.state; }).length}
					,	{selector:'.address-phone', attribute:'size', operation:'toBe', result: data.length}
					,	{selector:'[data-action="remove"]', attribute:'size', operation:'toBe', result: data.length}
					,	{selector:'.main-container [data-id]', attribute:'size', operation:'toBe', result: data.length}
					,	{selector:'.edit-address', attribute:'size', operation:'toBe', result: data.length}
					];

				_.each(data, function(address)
				{

					var data_id = '[data-id=' + address.internalid + '] '
					,	country = SC.ENVIRONMENT.siteSettings.countries && SC.ENVIRONMENT.siteSettings.countries[address.country]
					,	value_country = country ? country.name : address.country
					,	states = country && country.states
					,	value_states = states ? _.findWhere(states, {code: address.state}).name : address.state 
					,	additional_asserts = [
							{selector: data_id + '.address-title', attribute:'html', operation:'toContain', result: (address.label || address.company || address.fullname)}
						,	{selector: data_id + '.address-name', attribute:'html', operation:'toContain', result: address.fullname}
						,	{selector: data_id + '.address-addr1', attribute:'html', operation:'toContain', result: address.addr1}
						,	{selector: data_id + '.address-addr2', attribute:'html', operation:'toContain', result: address.addr2}
						,	{selector: data_id + '.address-country', attribute:'html', operation:'toContain', result: value_country}
						,	{selector: data_id + '.address-city', attribute:'html', operation:'toContain', result: address.city}
						,	{selector: data_id + '.address-zip', attribute:'html', operation: address.zip ? 'toContain': 'toBeAString', result: address.zip || ''}
						,	{selector: data_id + '.address-state', attribute:'html', operation: address.state ? 'toContain' : 'toBeUndefined', result: value_states || ' '}
						,	{selector: data_id + '.address-phone', attribute:'html', operation:'toContain', result: address.phone}
					];

					asserts = _.union(asserts, additional_asserts);

				});

				view.render();
				
				helper.testViewSelectors(view, asserts, data, test_description);

			});	
		
		});


		describe('events', function()
		{

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

				,	confirm_result = true
				,	list_view = new Address.Views.List({
						application: helper.application
					,	collection: fake_collection
					});


				window.confirm = jasmine.createSpy('mock confirm').andCallFake(function()
				{
					return confirm_result;
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

	});

});