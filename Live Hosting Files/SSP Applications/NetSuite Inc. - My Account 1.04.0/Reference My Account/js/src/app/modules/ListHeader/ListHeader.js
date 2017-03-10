// ListHeader:
// View used to manipulate a collection
// by adding sorting and filtering capabilities
// based on the sort and filter options from the collection
define('ListHeader',  function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'list_header'

	,	events: {
			'change [data-action="filter"]': 'filterHandler'
		,	'change [data-action="sort"]': 'sortHandler'
		,	'click [data-action="toggle-sort"]': 'toggleSortHandler'
		,	'change [data-action="select-all"]': 'selectAll'
		,	'change [data-action="unselect-all"]': 'unselectAll'
		,	'change [data-action="range-filter"]': 'rangeFilterHandler'
		}

	,	initialize: function (options)
		{
			var view = options.view;

			_.extend(this, options);

			// store the range (date) filter options
			this.rangeFilterOptions = view.rangeFilterOptions || {};

			// after the parent view is rendered
			view.on('afterViewRender', jQuery.proxy(this, 'appendToView'));
		}

	,	appendToView: function (view)
		{
			var $place_holder = view.$el.find('[data-type="list-header-placeholder"]');

			// we render the ListHeader view
			this.render();

			// prepend it to the parent
			this.$el.prependTo($place_holder.length ? $place_holder : view.$el);
			// and add the event listeners
			this.delegateEvents();
		}

		//returns the initial date range to apply
	,	getInitialDateRange: function (url_range)
		{
			if (this.rangeFilter)
			{
				var date_range_fromUrl = this.getRangeFromUrl(url_range);
				if (date_range_fromUrl.from || date_range_fromUrl.to)
				{
					return date_range_fromUrl;
				}
				else
				{
					var quantityDays = this.notUseDefaultDateRange ?
										this.quantityDaysRange :
										this.application.getConfig('filterRangeQuantityDays');

					if (quantityDays) {
						var from = new Date()
						,	to =  new Date();

						from.setDate(from.getDate() - quantityDays);

						return {
							from: _.dateToString(from)
						,	to: _.dateToString(to)
						};
					}
				}
			}
		}

	,	setSelecteds: function ()
		{
			var url_options = _.parseUrlOptions(Backbone.history.fragment);

			this.selectedFilter = this.getFilterFromUrl(url_options.filter);
			this.selectedRange = this.getInitialDateRange(url_options.range);
			this.selectedSort = this.getSortFromUrl(url_options.sort);
			this.order = this.getOrderFromUrl(url_options.order);
			this.page = this.getPageFromUrl(url_options.page);

			this.selectedDisplay = this.getDisplayFromUrl(url_options.display);
		}

		// when rendering we need to check
		// if there are options already set up in the url
	,	render: function ()
		{
			// TODO: Change following line for flag
			if (!this.selectedFilter && !this.selectedSort && !this.order && !this.selectedRange && !this.selectedDisplay)
			{
				this.setSelecteds();
				// after we set the current status
				// we update the collection
				this.updateCollection();
			}

			return this._render();
		}

		// updateCollection:
		// the collection used by the view MUST have an update method
		// this method is going to be called whenever a sort/filter value changes
	,	updateCollection: function ()
		{
			var range = null
			,	collection = this.collection;

			if (this.selectedRange) {
				range = {
					from: this.selectedRange.from
				,	to: this.selectedRange.to
				};
			}

			collection.update && collection.update({
				filter: this.selectedFilter
			,	range: range
			,	sort: this.selectedSort
			,	order: this.order
			,	page: this.page
			,	killerId: this.application.killerId
			}, this);

			return this;
		}

		// returns a specific filter
	,	getFilter: function (value)
		{
			return _(this.filters).find(function (filter)
			{
				return _.isFunction(filter.value) ?
					filter.value.apply(this.view) === value :
					filter.value === value;
			}, this);
		}

		// returns a specific sort
	,	getSort: function (value)
		{
			return _.findWhere(this.sorts, {
				value: value
			});
		}

		// returns a specific display
	,	getDisplay: function (value)
		{
			return _.findWhere(this.displays, {
				id: value
			});
		}

		// retuns the selected filter from the url
		// or the default filter if no value set up
	,	getFilterFromUrl: function (url_value)
		{
			return this.getFilter(url_value) || this.getDefaultFilter();
		}

	,	getRangeFromUrl: function (url_value)
		{
			var split = url_value ? url_value.split('to') : [];

			return {
				from: split[0]
			,	to: split[1]
			};
		}

		// returns the selected sort from the url
		// or the default sort if no value set up
	,	getSortFromUrl: function (url_value)
		{
			return this.getSort(url_value) || this.getDefaultSort();
		}

		// returns the selected order from the url
		// this could be inverse or nothing
	,	getOrderFromUrl: function (url_value)
		{
			return url_value === 'inverse' ? -1 : 1;
		}

		// Retrieve current selected display option or 'list' by default
	,	getDisplayFromUrl: function (url_value)
		{
			return this.getDisplay(url_value) || this.getDefaultDisplay();
		}

	,	getPageFromUrl: function (url_value)
		{
			var page_number = parseInt(url_value, 10);

			return !isNaN(page_number) && page_number > 0 ? page_number : 1;
		}

	,	pager: function (url_value)
		{
			var page_number = parseInt(url_value, 10)
			,	url = Backbone.history.fragment;

			return isNaN(page_number) || page_number === 1 ? _.removeUrlParameter(url, 'page') : _.setUrlParameter(url, 'page', page_number);
		}

	,	displayer: function (display_option)
		{
			var url = Backbone.history.fragment;

			return display_option === this.getDefaultDisplay().id ? _.removeUrlParameter(url, 'display') : _.setUrlParameter(url, 'display', display_option);
		}

		// if there's already a default filter, return that
		// otherwise find the one selected on the filter list
	,	getDefaultFilter: function ()
		{
			return this.defaultFilter || (this.defaultFilter = _.findWhere(this.filters, {selected: true}) || _.first(this.filters));
		}

		// if there's already a default sort, return that
		// otherwise find the one selected on the sort list
	,	getDefaultSort: function ()
		{
			return this.defaultSort || (this.defaultSort = _.findWhere(this.sorts, {selected: true}) || _.first(this.sorts));
		}

	,	getDefaultDisplay: function ()
		{
			return this.defaultDisplay || (this.defaultDisplay = _.findWhere(this.displays, {selected: true}) || _.first(this.displays));
		}

	,	isDefaultFilter: function (filter)
		{
			return this.getDefaultFilter() === filter;
		}

	,	isDefaultSort: function (sort)
		{
			return this.getDefaultSort() === sort;
		}

	,	isDefaultDisplay: function (display)
		{
			return this.getDefaultDisplay() === display;
		}

		// method called when dom dropdown change
	,	filterHandler: function (e)
		{
			// unselect all elements
			this.unselectAll({
				silent: true
			});
			// sets the selected filter
			this.selectedFilter = this.getFilter(e.target.value);
			// updates the url and the collection
			this.updateUrl();
		}

		// method called when dom dropdown change
	,	sortHandler: function (e)
		{
			// sets the selected sort
			this.selectedSort = this.getSort(e.target.value);
			// updates the url and the collection
			this.updateUrl();
		}

		// method called when dom button clicked
	,	toggleSortHandler: function ()
		{
			// toggles the selected order
			this.order *= -1;
			// updates the url and the collection
			this.updateUrl();
		}

		// selects all in collection
	,	selectAll: function ()
		{
			if ('selectAll' in this.view)
			{
				this.view.selectAll();
			}

			return this;
		}

		// unselects in collection
	,	unselectAll: function (options)
		{
			if ('unselectAll' in this.view)
			{
				this.view.unselectAll(options);
			}

			return this;
		}

	,	rangeFilterHandler: _.throttle(function ()
		{
			var selected_range = this.selectedRange
			,	$ranges = this.$('[data-action="range-filter"]');

			$ranges.each(function ()
			{
				if (this.value)
				{
					selected_range[this.name] = this.value;
				}
				else
				{
					delete selected_range[this.name];
				}
			});

			if (this.validateDateRange(selected_range))
			{
				// updates the url and the collection
				this.updateUrl();
			}
			else
			{
				this.showError(_('Invalid date format.').translate());
			}

			return this;
		}, 2500, {leading:false})

	,	validateDateRange: function (selected_range)
		{
			var options = this.rangeFilterOptions
			,	is_valid = true
			,	to = new Date(selected_range.to)
			,	from = new Date(selected_range.from)
			,	toMin = new Date(options.toMin)
			,	toMax = new Date(options.toMax)
			,	fromMin = new Date(options.fromMin)
			,	fromMax = new Date(options.fromMax);

			if (options.toMin && _.isDateValid(toMin) && _.isDateValid(to) && to.getTime() < toMin.getTime())
			{
				selected_range.to = options.toMin;
			}
			else if (options.toMax && _.isDateValid(toMax) && _.isDateValid(to) && to.getTime() > toMax.getTime())
			{
				selected_range.to = options.toMax;
			}

			if (options.fromMin && _.isDateValid(fromMin) && _.isDateValid(from) && from.getTime() < fromMin.getTime())
			{
				selected_range.from = options.fromMin;
			}
			else if (options.fromMax && _.isDateValid(fromMax) && _.isDateValid(from) && from.getTime() > fromMax.getTime())
			{
				selected_range.from = options.fromMax;
			}

			if (selected_range.to && !_.isDateValid(_.stringToDate(selected_range.to)))
			{
				is_valid = false;
				delete selected_range.to;
			}

			if (selected_range.from && !_.isDateValid(_.stringToDate(selected_range.from)))
			{
				is_valid = false;
				delete selected_range.from;
			}

			return is_valid;
		}

	,	updateUrl: function ()
		{
			var url = Backbone.history.fragment;
			// if the selected filter is the default one
			//   remove the filter parameter
			// else change it for the selected value
			url = this.isDefaultFilter(this.selectedFilter) ?
				_.removeUrlParameter(url, 'filter') :
				_.setUrlParameter(url, 'filter', _.isFunction(this.selectedFilter.value) ? this.selectedFilter.value.apply(this.view) : this.selectedFilter.value);
			// if the selected sort is the default one
			//   remove the sort parameter
			// else change it for the selected value
			url = this.isDefaultSort(this.selectedSort) ? _.removeUrlParameter(url, 'sort') : _.setUrlParameter(url, 'sort', this.selectedSort.value);
			// if the selected order is the default one
			//   remove the order parameter
			// else change it for the selected value
			url = this.order === 1 ? _.removeUrlParameter(url, 'order') : _.setUrlParameter(url, 'order', 'inverse');
			// if range from and range to are set up
			//   change them in the url
			// else remove the parameter
			if (this.selectedRange)
			{
				url = this.selectedRange.from && this.selectedRange.to ? _.setUrlParameter(url, 'range', this.selectedRange.from + 'to' + this.selectedRange.to) : _.removeUrlParameter(url, 'range');
			}

			url = _.removeUrlParameter(url, 'page');
			this.page = 1;

			// just go there already, but warn no one
			Backbone.history.navigate(url, {trigger: false});

			return this.updateCollection();
		}
	});
});
