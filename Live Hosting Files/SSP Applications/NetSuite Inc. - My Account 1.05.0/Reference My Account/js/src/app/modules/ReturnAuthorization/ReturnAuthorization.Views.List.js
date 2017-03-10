define('ReturnAuthorization.Views.List', ['ListHeader'], function (ListHeader)
{
	'use strict';

	return Backbone.View.extend({

		template: 'return_authorization_list'

	,	className: 'ReturnAuthorizationList'

	,	title: _('Returns').translate()

	,	page_header: _('Return requests').translate()

	,	attributes: {
			'class': 'ReturnAuthorizationList'
		}

	,	initialize: function (options)
		{
			var application = options.application;

			this.application = application;

			this.listenCollection();

			var isoDate = _.dateToString(new Date());

			this.rangeFilterOptions = {
				fromMin: '1800-01-02'
			,	fromMax: isoDate
			,	toMin: '1800-01-02'
			,	toMax: isoDate
			};

			// manages sorting and filtering of the collection
			this.listHeader = new ListHeader({
				view: this
			,	application: application
			,	collection: this.collection
			,	sorts: this.sortOptions
			,	rangeFilter: 'date'
			,	rangeFilterLabel: _('Requested from').translate()
			,	listHeaderId: 'returns'
			});
		}

	,	listenCollection: function ()
		{
			this.setLoading(true);

			this.collection.on({
				request: jQuery.proxy(this, 'setLoading', true)
			,	reset: jQuery.proxy(this, 'setLoading', false)
			});
		}

	,	setLoading: function (bool)
		{
			this.isLoading = bool;
		}

	,	sortOptions: [
			{
				value: 'date'
			,	name: _('Sort by Date').translate()
			,	selected: true
			}
		,	{
				value: 'number'
			,	name: _('Sort by Number').translate()
			}
		]
	});
});