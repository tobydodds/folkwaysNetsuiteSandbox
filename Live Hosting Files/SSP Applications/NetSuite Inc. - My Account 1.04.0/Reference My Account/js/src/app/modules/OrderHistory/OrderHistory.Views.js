// OrderHistory.Views.js
// -----------------------
// Views for order's details
define('OrderHistory.Views', ['ItemDetails.Model', 'TrackingServices'], function (ItemDetailsModel, TrackingServices)
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
		,	'click .re-order-all-items': 'reorderAll'
		,	'click [data-re-order-item-link]': 'reorderItem'
		,	'click .returnauthorizations-warning a': 'goToReturns'
		,	'click #returnauthorizations-details-header': 'toggleReturns'
		}

	,   showContent: function ()
		{
			var self = this;
			self.shipgroups = {};

			self.model.get('lines').filter(function (line)
			{
				var shipgroup_id = (line.get('shipaddress') + line.get('shipmethod')) || (self.model.get('shipaddress') + self.model.get('shipmethod')) || 'no-address-and-method';

				if (shipgroup_id)
				{
					var shipgroup = self.shipgroups[shipgroup_id];
					if (!shipgroup)
					{
						shipgroup = {
							shipmethod: line.get('shipmethod') || self.model.get('shipmethod')
						,	shipaddress: line.get('shipaddress') || self.model.get('shipaddress')
						,	fulfillments: []
						,	unfulfilled_lines: []
						,	tracking_numbers_summary: {}
						};
						self.shipgroups[shipgroup_id] = shipgroup;
					}
					shipgroup.unfulfilled_lines.push({line_id: line.get('internalid'),quantity:line.get('quantity'), rate: line.get('amount') });
				}
			});

			self.model.get('fulfillments').each(function (fulfillment)
			{
				var shipgroup = self.shipgroups[fulfillment.get('shipaddress') + fulfillment.get('shipmethod').internalid];

				if (!shipgroup)
				{
					shipgroup = {
						shipmethod: fulfillment.get('shipmethod').internalid
					,	shipaddress: fulfillment.get('shipaddress')
					,	fulfillments: []
					,	unfulfilled_lines: []
					,	tracking_numbers_summary: {}
					};
					self.model.get('shipmethods').add({
						internalid: fulfillment.get('shipmethod').internalid
					,	name: fulfillment.get('shipmethod').name
					});
					self.shipgroups[fulfillment.get('shipaddress') + fulfillment.get('shipmethod').internalid] = shipgroup;
				}

				shipgroup.fulfillments.push(fulfillment);

				_.each(fulfillment.get('lines'), function (line)
				{
					if (line.line_id)
					{
						var unfulfilled_line = _.findWhere(shipgroup.unfulfilled_lines,{line_id: line.line_id});
						if (!unfulfilled_line)
						{
							unfulfilled_line = {line_id: line.line_id,quantity:line.quantity};
							shipgroup.unfulfilled_lines.push(unfulfilled_line);
						}

						unfulfilled_line.quantity -= +line.quantity;
						unfulfilled_line.rate -= + line.rate;
					}
				});
			});

			_.each(self.shipgroups, function (shipgroup)
			{
				shipgroup.unfulfilled_lines = _.reject(shipgroup.unfulfilled_lines, function (line)
				{
					return line.quantity === 0;
				});

				if (shipgroup.unfulfilled_lines.length)
				{
					shipgroup.fulfillments.push(new Backbone.Model({
						is_pending: true
					,	lines: shipgroup.unfulfilled_lines
					}));
				}
			});

			self.options.application.getLayout().showContent(self, 'ordershistory', [{
				text: _('Order History &amp; Returns').translate(),
				href: '/ordershistory'
			}, {
				text: '#' + self.model.get('order_number'),
				href :'/ordershistory/view/' + self.model.get('id')
			}]);

			self.toggleReturns('hide');
		}

	,   showTrakingNumbers: showTrakingNumbers

		// reorder all items (incluiding quantity and options) of an order.
	,   reorderAll: function (e)
		{
			e.preventDefault();

			var add_items = []
			,	self = this
			,	application = this.options.application;

			this.$('[data-re-order-item-link]').each(function (index, item_link)
			{
				var $item_link = jQuery(item_link)
				,	selected_line_id = $item_link.data('re-order-item-link')
				,	selected_line = self.model.get('lines').get(selected_line_id)
				,	item_to_cart = selected_line.get('item');

				item_to_cart.setOptionsArray(selected_line.get('options'), true);
				add_items.push(item_to_cart);
			});

			application.getCart().addItems(add_items, {
				success: function ()
				{
					var non_gift_count = self.$('[data-re-order-item-link]').size()
					,	gift_count = self.$('[data-giftcard-item-link]').size()
					,	total_no_gift_items_to_add = _.reduce(add_items, function(acc, n) {
							return acc + n.get('quantity');
						}, 0)
					,	msg_str = '';

					if (gift_count > 0)
					{
						msg_str += '<p>' + _('$(0) of $(1) Items successfully added to <a href="#" data-touchpoint="viewcart">your cart</a></br>').translate(non_gift_count, non_gift_count + gift_count) + '</p>';

						self.$('[data-giftcard-item-link]').each(function ()
						{
							var	gifcard_item_link = jQuery(this).data('giftcard-item-link')
							,	giftcard_item_name = jQuery(this).data('giftcard-item-name');

							msg_str += '<p>';
							msg_str += _('Your Gift Card "$(0)" was not added to your cart because it must be personalized.').translate(giftcard_item_name);
							msg_str += '<a data-hashtag="#' + gifcard_item_link + '" href="' + gifcard_item_link + '" data-touchpoint="home">' + _('Personalize a new Gift Card now.').translate() + '</a>';
							msg_str += '</p>';
						});
					}
					else
					{
						if (non_gift_count > 1)
						{
							msg_str += _('$(0) Items successfully added to <a href="#" data-touchpoint="viewcart">your cart</a><br/>').translate(total_no_gift_items_to_add);
						}
						else
						{
							msg_str += _('Item successfully added to <a href="#" data-touchpoint="viewcart">your cart</a><br/>').translate();
						}
					}

					var $msg_el = jQuery(SC.macros.message(msg_str, 'success', true));

					self.$('[data-type=alert-placeholder]').append($msg_el);

					// amount of time the link is shown
					setTimeout(function ()
					{
						$msg_el.fadeOut(function ()
						{
							$msg_el.remove();
						});
					}, 3500);
				}
			});
		}

		// navigate to cart
	,	goToCart: function ()
		{
			window.location = this.options.application.getConfig('siteSettings.touchpoints.viewcart');
		}

		// reorder one item from an order (including quantity and options)
	,   reorderItem: function (e)
		{
			e.preventDefault();

			var	application = this.options.application
			,	$link = this.$(e.target)
			,	selected_line_id = this.$(e.target).data('re-order-item-link')
			,	selected_line = this.model.get('lines').get(selected_line_id)
			,	item_to_cart = selected_line.get('item');

			item_to_cart.setOptionsArray(selected_line.get('options'), true);

			application.getCart().addItem(item_to_cart, {
				success: function ()
				{
					jQuery('p.success-message').remove();
					var $success = jQuery('<p/>').addClass('success-message');

					// when sucess we temporarily show a link to the user's cart
					if (item_to_cart.quantity > 1)
					{
						$success.html(item_to_cart.quantity + _(' items successfully added to <a href="#" data-touchpoint="viewcart">your cart</a></br>').translate()).insertAfter($link);
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
				}
			});
		}

		// togle the view of the order's returns (if available)
	,   toggleReturns: function (how)
		{
			var $body = this.$('#returnauthorizations-details-body');

			if (_.isString(how))
			{
				$body[how === 'show' ? 'show' : 'hide']();
			}
			else
			{
				$body.toggle();
			}

			this.$('#returnauthorizations-details-header .icon-chevron-right')[$body.is(':visible') ? 'addClass' : 'removeClass']('icon-chevron-down');
		}

		// scroll the page up to the order's return
	,   goToReturns: function (e)
		{
			e.preventDefault();
			this.toggleReturns('show');

			jQuery('html, body').animate({
				scrollTop: this.$('#returnauthorizations-details').first().offset().top
			}, 500);
		}

	,   initialize: function (options)
		{
			this.application = options.application;
		}

	,	getTrackingServiceUrl: function (number)
		{
			return TrackingServices.getServiceUrl(number);
		}

	,	isReturnable: function ()
		{
			var model = this.model
			,	returned_lines = []
			,	lines = model.get('lines').clone();

			model.get('returnauthorizations').each(function (sibling)
			{
				sibling.get('lines').each(function (line)
				{
					var item_id = line.get('item').id

					,	same_item_line = lines.find(function (line)
						{
							return line.get('item').id === item_id;
						})

					,	quantity = parseFloat(same_item_line.get('quantity')) + parseFloat(line.get('quantity'));

					same_item_line.set('quantity', quantity);

					returned_lines.push(line);
				});
			});

			returned_lines = lines.filter(function (line)
			{
				return !line.get('quantity') || !line.get('item').get('_isReturnable');
			});

			lines.remove(returned_lines);

			return model.get('isReturnable') && lines.length;
		}
	});

	// view list of orders
	Views.List = Backbone.View.extend({
		template: 'order_history',
		title: _('Order History').translate(),
		page_header: _('Order History').translate(),
		attributes: {
			'class': 'OrderListView'
		}

	,	events: {
			'click [rel=clickover]': 'showTrakingNumbers'
		}

	,	showContent: function ()
		{
			this.options.application.getLayout().showContent(this, 'ordershistory', [{
				text: this.title
			,	href: '/ordershistory'
			}]);
		}

	,	showTrakingNumbers: showTrakingNumbers

	,	getTrackingServiceUrl: function (number)
		{
			return TrackingServices.getServiceUrl(number);
		}
	});

	return Views;
});
