// Receipt.Collection.js
// -----------------------
// Receipts  collection
define('Receipt.Collection', ['Receipt.Model'], function (Model)
{
	'use strict';

	return Backbone.CachedCollection.extend({
		model: Model
	,	url: 'services/receipt.ss'

	,	initialize: function ()
		{
			// The first time the collection is filled with data
			// we store a copy of the original collection
			this.once('sync reset', function ()
			{
				if (!this.original)
				{
					this.original = this.clone();
				}
			});
		}

		//Unset any filter, sorting and order options previously set in the collection
	,	clearFilters: function ()
		{
			this.selectedFilter = null;
			this.selectedSort = null;
			this.order = null;
			this.range = null;
		}

		// Collection.update:
		// custom method called by ListHeader view
		// it receives the currently applied filter,
		// currently applied sort and currently applied order
	,	update: function (options)
		{
			var filter_changed = this.selectedFilter !== options.filter
			,	sort_changed = this.selectedSort !== options.sort
			,	order_changed = this.order !== options.order
			,	range_changed = !_.isEqual(options.range, this.range) && (this.range || options.range);

			this.selectedFilter = options.filter;
			this.selectedSort = options.sort;
			this.order = options.order;
			this.range = options.range;

			if (filter_changed)
			{
				this.applyFilter().applySort();
			}
			else if (range_changed)
			{
				this.applyRangeFilter().applySort();
			}
			else if (sort_changed)
			{
				this.applySort();
			}
			else if (order_changed)
			{
				this.reverseOrder();
			}

			// All of the previous methods where silent
			// so if anything changed, we trigger the event
			// after everything was done
			if (filter_changed || sort_changed || order_changed || range_changed)
			{
				this.trigger('reset');
			}
		}

		// Resets the collection based on the applied filter
	,	applyFilter: function ()
		{
			this.reset(this.selectedFilter.filter.call(this), {silent: true});

			return this;
		}

	,	fixDateRangeWithTimeZoneOffset: function (selected_range)
		{
			if (selected_range)
			{
				var offset = new Date().getTimezoneOffset() * 60 * 1000
				,	from = _.stringToDate(selected_range.from)
				,	to = _.stringToDate(selected_range.to);

				if (_.isDateValid(from) && _.isDateValid(to))
				{
					var toAux = new Date(to.getTime() + offset)
					,	fromAux = new Date(from.getTime() + offset);

					toAux.setHours(23, 59, 59);
					fromAux.setHours(0, 0, 0);

					return {
						from: fromAux
					,	to: toAux
					};
				}
			}
		}

	,	applyRangeFilter: function ()
		{
			var range = this.fixDateRangeWithTimeZoneOffset(this.range) || {}
			,	from = range.from && new Date(range.from).getTime()
			,	to = range.to && new Date(range.to).getTime();

			this.reset(this.original.filter(function (invoice)
			{
				var when = new Date(invoice.get('tranDateInMilliseconds')).getTime();

				if (from && !to)
				{
					return when >= from;
				}

				if (!from && to)
				{
					return when <= to;
				}

				if (from && to)
				{
					return when >= from && when <= to;
				}

				return true;

			}), {silent: true});

			return this;
		}

		// Resets the collection based on the applied sort
	,	applySort: function ()
		{
			this.reset(this.selectedSort.sort.call(this), {silent: true});

			// if the current order is inverse
			if (this.order === -1)
			{
				// we need to reverse the order
				this.reverseOrder();
			}

			return this;
		}

		// Reverses the collection
	,	reverseOrder: function ()
		{
			this.reset(this.models.reverse(), {silent: true});

			return this;
		}

	});
});