// ItemDetails.Collection.js
// -------------------------
// Returns an extended version of the CachedCollection constructor
// (file: Backbone.cachedSync.js)
define('ItemDetails.Collection', ['ItemDetails.Model', 'Session'], function (Model, Session)
{
	'use strict';

	return Backbone.CachedCollection.extend({
		
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

	,	model: Model
		
		// http://backbonejs.org/#Model-parse
	,	parse: function (response)
		{
			// NOTE: Compact is used to filter null values from response
			return _.compact(response.items) || null;
		}
	});
});