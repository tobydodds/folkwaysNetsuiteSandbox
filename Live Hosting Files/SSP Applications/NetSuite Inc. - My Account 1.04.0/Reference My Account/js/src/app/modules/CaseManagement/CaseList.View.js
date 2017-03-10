
// CaseList.View.js
// -----------------------
// Views for viewing Cases list.
define('CaseList.View', ['ListHeader'], function (ListHeader)
{
	'use strict';

	return Backbone.View.extend({
		
		template: 'case_list'

	,	title: _('Support Cases').translate()

	,	page_header: _('Support Cases').translate()

	,	attributes: {
			'class': 'caseManagement'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
			this.fields = options.fields;
			this.listenCollection();
			this.setupListHeader();
		}

	,	setupListHeader: function()
		{
			this.listHeader = new ListHeader({
				view: this
			,	application: this.application
			,	collection: this.collection
			,	filters: this.initializeFilterOptions()
			,	sorts: this.sortOptions
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

	,	setLoading: function (is_loading)
		{
			this.isLoading = is_loading;
		}

		// Array of default filter options
		// filters always apply on the original collection
	,	initializeFilterOptions: function() 
		{
			var filter_options = [
				{
					value: 'all'
				,	name: _('Show All Statuses').translate()
				,	selected: true
				,	filter: function ()
					{
						return this.original.models;
					}
				}]
			,	statuses = this.fields ? this.fields.get('statuses') : [];

			_.each(statuses, function (status) {
				var filter_option = {
					value: status.id
				,	name: status.text
				,	filter: function ()
					{
						return this.original.filter(function (some_case)
						{
							return some_case.get('status').id === status.id;
						});
					}
				};

				filter_options.push(filter_option);
			});			

			return filter_options;
		}

		// Array of default sort options
		// sorts only apply on the current collection
		// which might be a filtered version of the original
	,	sortOptions: [
			{
				value: 'caseNumber'
			,	name: _('by Case number').translate()
			,	selected: true
			}
		,	{
				value: 'createdDate'
			,	name: _('by Creation date').translate()
			}
		,	{
				value: 'lastMessageDate'
			,	name: _('by Last Message date').translate()
			}
		]

	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'cases_all', [{
				text: this.title
			,	href: '/cases'
			}]);
		}

	,	render: function()
		{
			Backbone.View.prototype.render.apply(this, arguments);			

			if (!_.isUndefined(this.inform_new_case))
			{
				this.informNewCaseCreation();

				if (!this.isLoading)
				{
					delete this.inform_new_case;
				}
			}
		}

	,	informNewCaseCreation: function()
		{
			this.highlightNewCase(this.new_case_internalid);
			this.showConfirmationMessage(this.new_case_message);
		}

		// Temporarily highlights the case record just added
	,	highlightNewCase: function (internalid)
		{			
			var $list_dom = jQuery(this.el).find('a[data-id='+ internalid +']');
			
			if ($list_dom && $list_dom.length === 1)
			{
				$list_dom.addClass('case-list-new-case-highlight');

				setTimeout( function ()
				{
					$list_dom.removeClass('case-list-new-case-highlight');					
				}, 3000);
			}
		}		
	});
});