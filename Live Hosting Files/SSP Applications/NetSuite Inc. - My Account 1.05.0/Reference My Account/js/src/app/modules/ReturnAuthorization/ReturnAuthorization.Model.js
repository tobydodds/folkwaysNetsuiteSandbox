define('ReturnAuthorization.Model', ['OrderLine.Collection'], function (OrderLineCollection)
{
	'use strict';

	return Backbone.Model.extend({

		urlRoot: 'services/return-authorization.ss'

	,	initialize: function (attributes)
		{
			this.on('change:lines', function (model, lines)
			{
				model.set('lines', new OrderLineCollection(lines), {silent: true});
			});

			this.trigger('change:lines', this, attributes && attributes.lines || []);	
		}
	});
});