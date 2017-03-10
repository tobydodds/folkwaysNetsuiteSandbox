// OrderItem.Views.js
// -----------------------
// Views for ordered items
define('OrderItem.Views', ['ItemDetails.Model', 'ListHeader'], function (ItemDetailsModel, ListHeader)
{
	'use strict';

	var Views = {};

	Views.ReorderList = Backbone.View.extend({
		template: 'reorder_items'
	,	title: _('Reorder Items').translate()
	,	page_header: _('Reorder Items').translate()
	,	attributes: {'class': 'OrderItemReorderListView'}
	,	events: {
			'click .add-to-cart-btn': 'orderItems'
		,	'change [data-toggle="quantity"]' : 'setQuantity'
		,	'blur [data-toggle="quantity"]' : 'validateItemQuantity'
		}

	,	initialize: function (options)
		{
			if (options.order_id)
			{
				this.basePath = 'reorderItems/order/' + options.order_id + '/';
				this.collection.order_id = options.order_id;
			}
			else
			{
				this.basePath = 'reorderItems/';
			}

			this.listenCollection();

			// manges sorting and filtering of the collection
			this.listHeader = new ListHeader({
				view: this
			,	application: options.application
			,	collection: this.collection
			,	filters: options.order_id ? null : this.filterOptions
			,	sorts: options.order_id ? this.sortOptionsSingleOrder : this.sortOptions
			,	showCurrentPage: true
			});

			if (options.order_id)
			{
				this.listHeader.on('afterViewRender', this.attachOrderLink, this);
			}
		}

	,	attachOrderLink: function ()
		{
			if (this.collection.length)
			{
				this.listHeader.$el.removeClass('hidden');
				var order_link = jQuery('<a/>')
									.addClass('pull-left')
									.attr('href','/ordershistory/view/' + this.options.order_id)
									.html(_('Order Number: #$(0)').translate(this.collection.at(0).get('tranid')))
									.wrap('<div></div>')
									.parent();

				this.listHeader.$('.list-header').prepend(order_link.html());
			}
			else
			{
				this.listHeader.$el.addClass('hidden');
			}
		}

	,	validateItemQuantity: function (e)
		{
			var $input = jQuery(e.target)
			,	quantity = parseInt($input.val(), 10) || 1
			,	line_id = $input.data('line-id');

			$input.val(quantity);
			this.collection.get(line_id).get('item').set('quantity', quantity);
		}

	,	listenCollection: function ()
		{
			this.setLoading(true);

			this.collection.on({
				request: jQuery.proxy(this, 'setLoading', true)
			,	reset: jQuery.proxy(this, 'setLoading', false)
			});
		}

	,	getItemExtraDetailsMacro: function (line)
		{
			return function ()
			{
				return line.get('trandate') ?
					'<p class="text-light">' +  _('Last purchased on $(0)').translate(line.get('trandate')) + '</p>' :
					'';
			};
		}

	,	getItemDetailsMacro: function (line)
		{
			return function ()
			{
				return SC.macros.itemActionsReturnQuantity({
						itemId: line.get('item').get('_id')
					,	lineId: line.id
					,	itemQuantity: line.get('item').get('quantity')
					,	parentInternalId: line.get('item').get('parent_internalid')
					,	formatOptions: line.get('options_object')
				});
			};
		}

	,	setLoading: function (bool)
		{
			this.isLoading = bool;
		}

	,	setQuantity: function (e)
		{
			var $input = jQuery(e.target)
			,	quantity = $input.val()
			,	line_id = $input.data('line-id');

			this.collection.get(line_id).get('item').set('quantity', quantity);
		}

	,	showContent: function ()
		{
			//only render when we are actually in reorderitems web page for preventing re-rendering when navigation to other page when reorderitem ajax still loading
			if (Backbone.history.getHash().indexOf('reorderItems') === -1)
			{
				return;
			}

			var crumbtrail = [{
				text: this.title
			,	href: '/reorderItems'
			}];

			if (this.options.order_id && this.collection.at(0) && this.collection.at(0).get('order_number'))
			{
				var order_number = this.collection.at(0).get('order_number');
				this.title = _('Reorder Items from Order #$(0)').translate(order_number);
				crumbtrail.push({text: _('Order #$(0)').translate(order_number), href: '/reorderItems/order/' + this.options.order_id});
			}
			var dont_scroll = true;
			this.options.application.getLayout().showContent(this, 'reorderitems', crumbtrail, dont_scroll);
		}

		// reorder an item, the quantity is written by the user on the input and the options are the same that the ordered item in the previous order
	,	orderItems: function (e)
		{
			e.preventDefault();

			var	application = this.options.application
			,	$form = this.$(e.target).closest('.reorder-item-line-container')
			,	line_id = $form.data('id')
			,	selected_line = this.collection.get(line_id)
			,	selected_item = selected_line.get('item')
			,	$quant = $form.find('input[name=item_quantity]')
			,	itemToCart;

			selected_item.setOptionsArray(selected_line.get('options_object'), true);

			selected_item.set('quantity', parseInt($quant.val(), 10) || 1);
			itemToCart = selected_item;

			if (parseInt(itemToCart.get('quantity'), 10) > 0 || isNaN(itemToCart.get('quantity')))
			{
				if (isNaN(itemToCart.get('quantity')))
				{
					itemToCart.set('quantity', 1);
				}
				application.getCart().addItem(itemToCart, {
					success: function ()
					{
						jQuery('p.success-message').remove();
						var $success = jQuery('<p/>');

						if (itemToCart.get('quantity') > 1)
						{
							$success.
								addClass('success-message pull-right')
								.html(_('$(0) Items successfully added to <a href="#" data-touchpoint="viewcart">your cart</a><br/>').translate(itemToCart.get('quantity')))
								.wrap('<div class="row-fluid"></div>')
								.parent()
								.appendTo($form);
						}
						else
						{
							$success.
								addClass('success-message pull-right')
								.html(_('Item successfully added to <a href="#" data-touchpoint="viewcart">your cart</a></br>').translate())
								.wrap('<div class="row-fluid"></div>')
								.parent()
								.appendTo($form);
						}

						setTimeout(function ()
						{
							$success.fadeOut(function ()
							{
								$success.remove();
							});
						}, 6000);
					}
				});
			}
			else
			{
				jQuery('p.success-message').remove();
				var $msg = jQuery('<p/>');
				$msg.
					addClass('success-message pull-right')
					.html(_('The number of items must be positive.').translate())
					.wrap('<div class="row-fluid"></div>')
					.parent()
					.appendTo($form);
			}
		}

		//Returns a date substracting the amound of days specified from now
	,	getStringDateFromDaysCount: function (days_back)
		{
			var now = new Date();
			return new Date(now.setDate(now.getDate() - days_back));
		}

	,	sortOptionsSingleOrder: [
			{
				value: 'price'
			,	name: _('By Price').translate()
			,	selected: true
			}
		,	{
				value: 'name'
			,	name: _('By Name').translate()
			}
		]

	,	sortOptions: [
			{
				value: 'quantity'
			,	name: _('By Frequently Purchased').translate()
			,	selected: true
			}
		,	{
				value: 'date'
			,	name: _('By Most Recently Purchased').translate()
			}
		,	{
				value: 'price'
			,	name: _('By Price').translate()
			}
		,	{
				value: 'name'
			,	name: _('By Name').translate()
			}
		]

	,	filterOptions: [
			{
				value: function ()
				{
					return _.dateToString(this.getStringDateFromDaysCount(15)) + 'T'+ _.dateToString(new Date());
				}
			,	name: _('Show last 15 days').translate()
			,	selected: true
			}
		,	{
				value: function ()
				{
					return _.dateToString(this.getStringDateFromDaysCount(30)) + 'T'+ _.dateToString(new Date());
				}
			,	name: _('Show last 30 days').translate()
			,	selected: true
			}
		,	{
				value: function ()
				{
					return _.dateToString(this.getStringDateFromDaysCount(60)) + 'T'+ _.dateToString(new Date());
				}
			,	name: _('Show last 60 days').translate()
			}
		,	{
				value: function ()
				{
					return _.dateToString(this.getStringDateFromDaysCount(90)) + 'T'+ _.dateToString(new Date());
				}
			,	name: _('Show last 90 days').translate()
			}
		,	{
				value: function ()
				{
					return _.dateToString(this.getStringDateFromDaysCount(180)) + 'T'+ _.dateToString(new Date());
				}
			,	name: _('Show last 180 days').translate()
			}
		]
	});

	return Views;
});
