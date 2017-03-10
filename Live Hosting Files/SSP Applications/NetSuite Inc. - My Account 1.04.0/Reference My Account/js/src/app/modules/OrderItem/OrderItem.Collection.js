// OrderItem.Collection.js
// -----------------------
// Collection of past ordered items
define('OrderItem.Collection', ['OrderItem.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({

		url: 'services/orderitems.ss'

	,	model: Model

	,	parse: function (response)
		{
			this.totalRecordsFound = response.totalRecordsFound;
			this.recordsPerPage = response.recordsPerPage;

			return response.records;
		}

	,	update: function (options, list_header)
		{
			var data_filters = {
					sort: options.sort.value
				,	order_id: this.order_id
				,	order: options.order
				,	page: options.page
				};

			if (!this.order_id)
			{
				var date_string = options.filter.value.apply(list_header.view);
				date_string = date_string && date_string.split('T');

				data_filters.from = date_string[0] ? _.stringToDate(date_string[0]).getTime() : null;
				data_filters.to = date_string[1] ? _.stringToDate(date_string[1]).getTime() : null;
			}

			this.fetch({
				data: data_filters
			,	reset: true
			,	killerId: options.killerId
			});
		}
	});
});
