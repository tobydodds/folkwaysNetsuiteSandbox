// LiveOrder.Model.js
// -----------------------
// Model for showing information about an open order
define('LiveOrder.Model', ['Order.Model', 'OrderLine.Model', 'OrderLine.Collection', 'ItemDetails.Model', 'Session'], function (OrderModel, OrderLineModel, OrderLineCollection, ItemDetailsModel, Session)
{
	'use strict';

	var LiveOrderLine = {};

	LiveOrderLine.Model = OrderLineModel.extend({
		urlRoot: _.getAbsoluteUrl('services/live-order-line.ss')
	});

	LiveOrderLine.Collection = OrderLineCollection.extend({
		model: LiveOrderLine.Model
	,	url: _.getAbsoluteUrl('services/live-order-line.ss')
	});

	return OrderModel.extend({

		urlRoot: _.getAbsoluteUrl('services/live-order.ss')

	,	linesCollection: LiveOrderLine.Collection

		// redefine url to avoid possible cache problems from browser
	,	url: function()
		{
			var base_url = OrderModel.prototype.url.apply(this, arguments);
			return base_url + '&t=' + new Date().getTime();
		}

	,	initialize: function ()
		{
			// call the initialize of the parent object, equivalent to super()
			OrderModel.prototype.initialize.apply(this, arguments);

			// Some actions in the live order may change the url of the checkout so to be sure we re send all the touchpoints
			this.on('change:touchpoints', function (model, touchpoints)
			{
				Session.set('touchpoints', touchpoints);
			});
		}
	,	getLatestAddition: function ()
		{
			var model = null;

			if (this.get('latest_addition'))
			{
				model = this.get('lines').get(this.get('latest_addition'));
			}

			if (!model && this.get('lines').length)
			{
				model = this.get('lines').at(0);
			}

			return model;
		}

	,	wrapOptionsSuccess: function (options)
		{
			var self = this;
			// if passing a succes function we need to wrap it
			options = options || {};
			options.success = _.wrap(options.success || jQuery.noop, function (fn, item_model, result)
			{
				// This method is called in 2 ways by doing a sync and by doing a save
				// if its a save result will be the raw object
				var attributes = result;
				// If its a sync resilt will be a string
				if (_.isString(result))
				{
					attributes = item_model;
				}

				// Tho this should be a restfull api, the live-order-line returns the full live-order back (lines and summary are interconnected)
				self.set(attributes);

				// Calls the original success function
				fn.apply(self, _.toArray(arguments).slice(1));

				var application = self.application
				,	line = self.get('lines').get(self.get('latest_addition'))
				,	item = line && line.get('item');

				item && application && application.trackEvent && application.trackEvent({
					category: 'Add to Cart'
				,	action: 'button'
				,	label: item.get('_url') + item.getQueryString()
				,	value: 1
				});
			});

			return options;
		}

	,	addItem: function (item, options)
		{
			// Calls the addItems funtion passing the item as an array of 1 item
			return this.addItems([item], options);
		}

	,	addItems: function (items, options)
		{
			// Obteins the Collection constructor
			var LinesCollection = this.linesCollection;

			// Prepares the input for the new collection
			var lines = _.map(items, function (item)
			{
				var line_options = item.getItemOptionsForCart();

				return {
					item: {
						internalid: item.get('internalid')
					}
				,	quantity: item.get('quantity')
				,	options: _.values(line_options).length ? line_options : null
				};
			});

			// Creates the Colection
			var lines_collection = new LinesCollection(lines);

			// Saves it
			return lines_collection.sync('create', lines_collection, this.wrapOptionsSuccess(options));
		}

	,	updateItem: function (line_id, item, options)
		{
			var line = this.get('lines').get(line_id)
			,	line_options = item.getItemOptionsForCart();

			line.set({
				quantity: item.get('quantity')
			,	options: _.values(line_options).length ? line_options : null
			});

			line.ongoingPromise = line.save({}, this.wrapOptionsSuccess(options));

			return line.ongoingPromise;
		}

	,	updateLine: function (line, options)
		{
			// Makes sure the quantity is a number
			line.set('quantity', parseInt(line.get('quantity'), 10));

			line.ongoingPromise = line.save({}, this.wrapOptionsSuccess(options));

			return line.ongoingPromise;
		}

	,	removeLine: function (line, options)
		{
			line.ongoingPromise = line.destroy(this.wrapOptionsSuccess(options));
			
			return line.ongoingPromise;
		}

	,	submit: function ()
		{
			this.set('internalid', null);

			var self = this
			,	creditcard = this.get('paymentmethods').findWhere({type: 'creditcard'})
			,	paypal = this.get('paymentmethods').findWhere({type: 'paypal'});

			if (creditcard && !creditcard.get('creditcard'))
			{
				this.set(this.get('paymentmethods').remove(creditcard));
			}

			if (paypal && !paypal.get('complete'))
			{
				this.set(this.get('paymentmethods').remove(paypal));
			}

			return this.save().fail(function ()
			{
				self.set('internalid', 'cart');
			});
		}


	,	save: function ()
		{
			if (this.get('confirmation'))
			{
				return jQuery.Deferred().resolve();
			}

			return OrderModel.prototype.save.apply(this, arguments);
		}
		
	,	getTotalItemCount: function ()
		{
			return _.reduce(this.get('lines').pluck('quantity'), function (memo, quantity)
			{
				return memo + (parseFloat(quantity) || 1);
			}, 0);
		}

	,	parse: function (response, options)
		{
			if (options && !options.parse)
			{
				return;
			}

			return response;
		}

		// Returns the order's lines that have not set its addresses to Multi Ship To yet
	,	getUnsetLines: function ()
		{
			return this.get('lines').filter(function (line) { return !line.get('shipaddress') && line.get('isshippable'); });
		}

		// Returns the order's line that are NON Shippable
	,	getNonShippableLines: function ()
		{
			return this.get('lines').filter(function (line) { return !line.get('isshippable'); });
		}

		// Returns the list of lines already set its shipping address
	,	getSetLines: function ()
		{
			return this.get('lines').filter(function (line) { return line.get('shipaddress') && line.get('isshippable'); });
		}

		// Returns the order's line that are shippable without taking into account if their have or not set a shipaddress
	,	getShippableLines: function ()
		{
			return this.get('lines').filter(function (line) { return line.get('isshippable'); });
		}
		// Returns an array containing the cart items ids
	,	getItemsIds: function ()
		{
			return this.get('lines').map(function(line){return line.get('item').get('internalid');});
		}
	});
});
