define(['ItemDetails.View', 'ItemDetails.Model', 'TestHelper', './TestCasesData'], function (ItemDetailsView, ItemDetailsModel, TestHelper)
{
	'use strict';


	var helper = new TestHelper({
			loadTemplates: true
		,	useItemKeyMapping: true
		,	applicationConfiguration: TestCasesData.configuration

	});

	describe('selectors', function(){
			
		_.each(TestCasesData.view, function (data, test_description)
		{

			var view = new ItemDetailsView({
					model: new ItemDetailsModel(data)
				,	application: helper.application
				})
			,	asserts = [
					{actual: function (view){ return view.$el.hasClass(view.attributes.class);}, operation:'toBeTruthy'}
				,	{selector: '[itemprop="name"]', result: data.storedisplayname2 || data.displayname}
				,	{selector: '[itemprop="sku"]',  result: data.itemid}
				,	{selector: '[itemprop="price"]', result: data.onlinecustomerprice_detail.onlinecustomerprice_formatted}
				
				];

			view.render();
			
			helper.testViewSelectors(view, asserts, data, test_description);

		});	
	});

});