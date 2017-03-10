// Merhcandising Item Collection
// -----------------------------
// Item collection used for the merchandising zone
define('Merchandising.ItemCollection', ['ItemDetails.Collection', 'Session'], function (ItemDetailsCollection, Session)
{
	'use strict';

	// we declare a new version of the ItemDetailsCollection
	// to make sure the urlRoot doesn't get overridden
	return ItemDetailsCollection.extend({
		
		url: function()
		{
			var url = _.addParamsToUrl(
				'/api/items'
			,	_.extend(
					{}
				,	this.searchApiMasterOptions
				,	Session.getSearchApiParams()
				)
			);
			
			return url;
		}

	});
});