// OrderHistory.Views.js
// -----------------------
// Views for order's details
define('OrderHistory.Views', ['ItemDetails.Model', 'TrackingServices', 'ListHeader', 'ReturnAuthorization.GetReturnableLines'],
	function (ItemDetailsModel, TrackingServices, ListHeader, ReturnLinesCalculator)
{
	'use strict';

	var Views = {};

	// show the tracking information on a popup when a tracking number is clicked
	var	showTrakingNumbers = function (e)
	{
		e.preventDefault();
		e.stopPropagation();

		var $link = this.$(e.target)
		,	content = this.$($link.data('content-selector')).html();

		$link.popover({
			content: content + '<a class="close" href="#">&times;</a>'
		,	trigger: 'manual'
		,	html: true
		}).popover('toggle');

		jQuery(document.body).one('click', '.popover .close', function (e)
		{
			e.preventDefault();
			$link.popover('hide');
		});
	};

	// view an order's detail
	Views.Details = Backbone.View.extend({
		template: 'order_details'

	,   title: _('Order Details').translate()
	,   page_header: _('Order Details').translate()
	,   attributes: {
			'class': 'OrderDetailsView'
		}

	,   events: {
			'click [rel=clickover]': 'showTrakingNumbers'
		,	'click [data-re-order-item-link]': 'reorderItem'
		,	'click [data-type="info-returns"] a': 'goToReturns'
		}

	,	getReturnAuthorizations: function ()
		{
			var return_authorizations = this.model.get('returnauthorizations')
			,	total_lines = 0;

			return_authorizations.each(function (return_authorization)
			{
				total_lines += return_authorization.get('lines') ? return_authorization.get('lines').length : 0;
			});

			return_authorizations.totalLines = total_lines;

			return return_authorizations;
		}

	,	getNonShippableItems: function ()
		{

			var self = this;
			if (!this.non_shippable)
			{
				this.non_shippable = [];
			this.model.get('lines').each(function (line)
			{
				if (!line.get('isfulfillable'))
				{
						self.non_shippable.push(line);
				}
				});
			}
			return this.non_shippable;
		}

	,	getFulfillmentAddresses: function ()
		{
			var self = this;
			if (!this.fulfillmentAddresses)
			{
				this.fulfillmentAddresses = [];
				var ordershipaddress = this.model.get('shipaddress') && this.model.get('addresses').get(this.model.get('shipaddress')) ? this.model.get('shipaddress') : null;

				// For single ship-to, we need all  the fulfillments in a single accordion
				if(ordershipaddress){
					self.fulfillmentAddresses.push(ordershipaddress);
				}
				else{
					this.model.get('fulfillments').each(function (fulfillment)
					{
						self.fulfillmentAddresses.push(fulfillment.get('shipaddress'));
					});
					this.fulfillmentAddresses = _.uniq(this.fulfillmentAddresses);
				}
			}
			return this.fulfillmentAddresses;
		}

	,	getFulfillments: function (address)
		{

			var fulfillments = [];
			var self = this;
			this.model.get('fulfillments').each(function (fulfillment)
			{
				//For single ship-to, ignore the fact that the fulfillment must match the address, we show all fulfillments in the same accordion
				if ((self.model.get('shipaddress') || fulfillment.get('shipaddress') === address) && !fulfillment.get('is_pending'))
				{
					_.each(fulfillment.get('lines'),function (ff_line)
					{
						self.model.get('lines').each(function (line)
						{
							if (line.get('internalid') === ff_line.line_id)
							{
								ff_line.rate = line.get('amount');
								ff_line.partial_quantity = ff_line.quantity;
								ff_line.quantity = line.get('quantity');
							}
						});
					});
					fulfillments.push(fulfillment);
				}
			});
			return fulfillments;
		}

	,	getUnfulfilled: function ()
			{
			var self = this;
			if (!this.unfulfilled)
			{
				this.unfulfilled = [];
				this.model.get('lines').each(function (line)
				{

					if (!line.get('isfulfillable'))
				{
						return false;
				}

					var quantity = parseInt(line.get('quantity'),10);
					self.model.get('fulfillments').each(function (fulfillment)
				{
						_.each(fulfillment.get('lines'),function (ff_line)
					{
							if (line.get('internalid') === ff_line.line_id)
						{
								quantity -= ff_line.quantity;
					}
				});
			});
					if (quantity > 0)
			{
						var line_copy = new Backbone.Model(line.attributes);
						line_copy.set('partial_quantity',quantity);
						line_copy.set('item',line.get('item'));
						self.unfulfilled.push(line_copy);
					}
				});
			}
			return this.unfulfilled;
		}

	,   showContent: function ()
				{
			this.application.getLayout().showContent(this, 'ordershistory', [{
				text: _('Order History').translate(),
				href: '/ordershistory'
			}, {
				text: '#' + this.model.get('order_number'),
				href :'/ordershistory/view/' + this.model.get('id')
			}]);
		}

	,   showTrakingNumbers: showTrakingNumbers

	,	trackEventReorderAll: function (items)
		{
			var self = this;

			0 < items.length && items.forEach(function (item)
			{
				self.trackEventReorder(item);
			});
		}

	,	trackEventReorder: function (item)
		{
			var application = this.options.application;

			item && application.trackEvent && application.trackEvent({
				category: 'Reorder'
			,	action: 'button'
			,	label: item.get('_url') + item.getQueryString()
			,	value: 1
			});
		}

		// navigate to cart
	,	goToCart: function ()
		{
			window.location = this.options.application.getConfig('siteSettings.touchpoints.viewcart');
		}

		// reorder one item from an order (including quantity and options)
	,	reorderItem: function (e)
		{
			e.preventDefault();

			var	self = this
			,	$link = this.$(e.target)
			,	selected_line = this.model.get('lines').get(this.$(e.target).data('re-order-item-link'))
			,	item_to_cart = new ItemDetailsModel({
					internalid: selected_line.get('item').get('internalid')
				,	quantity: $link.data('partial-quantity')
				,	options: selected_line.get('options')
			});

			this.application.getCart().addItem(item_to_cart).done(function ()
			{
				self.trackEventReorder(item_to_cart);

				jQuery('p.success-message').remove();

				var $success = jQuery('<p/>').addClass('success-message')
				,	quantity = item_to_cart.get('quantity');

				// when sucess we temporarily show a link to the user's cart
				if (quantity > 1)
				{
					$success.html(_('$(0) items successfully added to <a href="#" data-touchpoint="viewcart">your cart</a></br>').translate(quantity)).insertAfter($link);
				}
				else
				{
					$success.html(_('Item successfully added to <a href="#" data-touchpoint="viewcart">your cart</a></br>').translate()).insertAfter($link);
				}

				// amount of time the link is shown
				setTimeout(function ()
				{
					$success.fadeOut(function ()
					{
						$success.remove();
					});
				}, 3500);
			});
		}

		// scroll the page up to the order's return
	,   goToReturns: function (e)
		{
			e.preventDefault();

			var $return_authorizations_header = this.$('div.returnauthorizations-details-header').first();

			$return_authorizations_header.find('div.well-secundary a.pull-right i').addClass('icon-minus');
			this.$('div.returnauthorizations-details-body').show();

			jQuery('html, body').animate({
				scrollTop: $return_authorizations_header.offset().top
			}, 500);
		}

	,   initialize: function (options)
		{
			this.application = options.application;
		}

	,	getTrackingServiceName: function (number)
		{
			return TrackingServices.getServiceName(number);
		}

	,	getTrackingServiceUrl: function (number)
		{
			return TrackingServices.getServiceUrl(number);
		}

		//indicates if the order accepts returns or not
	,	isReturnable: function ()
		{
			var returnable_calculator = new ReturnLinesCalculator(this.model);

			return this.model.get('isReturnable') && returnable_calculator.calculateLines().validLines.length;
		}
	});

	// view list of orders
	Views.List = Backbone.View.extend({

		template: 'order_history'

	,	title: _('Order History').translate()

	,	className: 'OrderListView'

	,	page_header: _('Order History').translate()

	,	attributes: {
			'class': 'OrderListView'
		}

	,	events: {
			'click [data-action="navigate"]': 'navigateToOrder'
		}

	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'ordershistory', [{
				text: this.title
			,	href: '/ordershistory'
			}]);
		}

	,	showTrakingNumbers: showTrakingNumbers

	,	getTrackingServiceUrl: function (number)
		{
			return TrackingServices.getServiceUrl(number);
		}

	,	getTrackingServiceName: function (number)
		{
			return TrackingServices.getServiceName(number);
		}

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

			// Manages sorting and filtering of the collection
			this.listHeader = new ListHeader({
				view: this
			,	application: this.application
			,	collection: this.collection
			,	sorts: this.sortOptions
			,	rangeFilter: 'date'
			,	rangeFilterLabel: _('From').translate()
			});
		}

	,	navigateToOrder: function (e)
		{
			e.preventDefault();

			if (!jQuery(e.target).closest('[data-type="accordion"]').length)
			{
				var order_id = jQuery(e.target).closest('[data-action="navigate"]').data('id');
				Backbone.history.navigate('#ordershistory/view/' + order_id, {trigger:true});
			}
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

		// Array of default sort options
		// sorts only apply on the current collection
		// which might be a filtered version of the original
	,	sortOptions: [
			{
				value: 'date'
			,	name: _('Sort By Date').translate()
			,	selected: true
			}
		,	{
				value: 'number'
			,	name: _('Sort By Number').translate()
			}
		,	{
				value: 'amount'
			,	name: _('Sort By Amount').translate()
			}
		]
	});

	return Views;
});
