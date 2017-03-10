// Receipt.Views.js
// -----------------------
// Views for receipt's details
define('Receipt.Views', ['OrderHistory.Views', 'ListHeader'], function (OrderHistoryViews, ListHeader)
{
	'use strict';

	var Views = {};

	// view an order's detail
	Views.Details = OrderHistoryViews.Details.extend({

		template: 'receipt_details'

	,	title: _('Receipt Details').translate()

	,	attributes: {'class': 'OrderDetailsView'}

	,	showContent: function ()
		{
			this.title = _('Receipt Details').translate();
			this.options.application.getLayout().showContent(this, 'receiptshistory', [
				{
					text: _('Receipts').translate()
				,	href: '/receiptshistory'
				}
			,	{
					text: _('Receipt').translate() + ' #' + this.model.get('order_number')
				,	path: '/receiptshistory/view/' + this.model.get('id')
				}
			]);
		}
	});

	//list receipt's history
	Views.List = Backbone.View.extend({
		template: 'receipt_history'
	,	title: _('Receipts').translate()
	,	page_header: _('Receipts').translate()
	,	className: 'OrderListView'
	,	attributes: {'class': 'OrderListView'}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.collection = options.collection;

			var isoDate = _.dateToString(new Date());

			this.rangeFilterOptions = {
				fromMin: '1800-01-02'
			,	fromMax: isoDate
			,	toMin: '1800-01-02'
			,	toMax: isoDate
			};

			this.listenCollection();

			// manages sorting and filtering of the collection
			this.listHeader = new ListHeader({
				view: this
			,	application : options.application
			,	collection: this.collection
			,	sorts: this.sortOptions
			,	rangeFilter: 'date'
			,	rangeFilterLabel: _('From').translate()
			});

			this.collection.on('sync reset', jQuery.proxy(this, 'render'));
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

	,	showContent: function ()
		{
			this.options.application.getLayout().showContent(this, 'receiptshistory', [{
				text: this.title
			,	href: '/receiptshistory'
			}]);
		}

		// Array of default sort options
		// sorts only apply on the current collection
		// which might be a filtered version of the original
	,	sortOptions: [
			{
				value: 'date'
			,	name: _('Sort By Date').translate()
			,	sort: function ()
				{
					return this.sortBy(function (receipt)
					{
						return [receipt.get('tranDateInMilliseconds'), receipt.get('tranid')];
					});
				}
			}
		,	{
				value: 'number'
			,	name: _('Sort By Number').translate()
			,	sort: function ()
				{
					return this.sortBy(function (receipt)
					{
						return receipt.get('tranid');
					});
				}
			}
		,	{
				value: 'amount'
			,	name: _('Sort By Amount').translate()
			,	sort: function ()
				{
					return this.sortBy(function (receipt)
					{
						return receipt.get('summary').total;
					});
				}
			}
		]
	});

	return Views;
});