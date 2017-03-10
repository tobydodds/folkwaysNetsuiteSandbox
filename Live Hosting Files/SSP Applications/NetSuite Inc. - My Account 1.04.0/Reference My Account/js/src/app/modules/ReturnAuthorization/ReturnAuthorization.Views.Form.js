define('ReturnAuthorization.Views.Form', ['ListHeader', 'OrderLine.Collection'], function (ListHeader, OrderLineCollection)
{
	'use strict';

	return Backbone.View.extend({

		template: 'return_authorization_form'

	,	title: _('Return Items').translate()

	,	page_header: _('Return Items').translate()

	,	events: {
			'click [data-type="return-line"]': 'toggleLineHandler'
		,	'click [data-action="apply-reason"]': 'applyReasonHandler'
		,	'change select[name="reason"]': 'changeReasonHandler'
		,	'change input[name="quantity"]': 'changeQuantityHandler'
		,	'change input[name="reason-text"]': 'textReasonHandler'
		,	'change textarea[name="comments"]': 'changeCommentHandler'
		,	'submit form': 'saveForm'
		}

	,	attributes: {
			'class': 'ReturnAuthorizationForm'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.createdFrom = options.createdFrom;

			this.reasons = this.application.getConfig('returnAuthorization.reasons') || [];
			this.createdFrom.on('sync', jQuery.proxy(this, 'initListHeader'));
		}

	,	getLinkedRecordUrl: function ()
		{
			var created_from = this.createdFrom;

			return (created_from.get('type') === 'salesorder' ? '/ordershistory/view/' : '/invoices/') + created_from.get('internalid');
		}

	,	initListHeader: function ()
		{
			var lines = this.getLines();

			this.listHeader = new ListHeader({
				view: this
			,	application: this.application
			,	collection: lines
			,	selectable: true
			,	classes: 'list-header-slim'
			});

			if (lines.length === 1)
			{
				this.selectAll();
			}

			return this;
		}

	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'returns', 'returns', true);

			return this;
		}

	,	getLineId: function (target)
		{
			return this.$(target).closest('[data-type="return-line"]').data('id');
		}

	,	selectAll: function ()
		{
			return this.setLines({
				checked: true
			}).showContent();
		}

	,	unselectAll: function ()
		{
			return this.setLines({
				reason: null
			,	checked: false
			,	returnQty: null
			,	textReason: null
			}).showContent();
		}

	,	setLines: function (attributes)
		{
			this.getLines().each(function (line)
			{
				line.set(attributes);
			});

			return this;
		}

	,	setActiveLines: function (attributes)
		{
			_.each(this.getActiveLines(), function (line)
			{
				line.set(attributes);
			});

			return this;
		}

	,	toggleLineHandler: function (e)
		{
			var $target = this.$(e.target);

			if ($target.data('toggle') !== false)
			{
				this.toggleLine(this.getLineId($target));
			}
		}

	,	toggleLine: function (id)
		{
			var line = this.getLine(id);

			line.set('checked', !line.get('checked'));

			if (!line.get('checked'))
			{
				line.set({
					reason: null
				,	returnQty: null
				,	textReason: null
				});
			}

			return this.showContent();
		}

	,	setFulfilledQuantities: function ()
		{
			var created_from = this.createdFrom
			,	lines = created_from.get('lines')
			,	fullfilments = created_from.get('fulfillments');

			if (fullfilments)
			{
				lines.each(function (line)
				{
					line.set('quantity', 0);
				});

				fullfilments.each(function (fulfillment)
				{
					_.each(fulfillment.get('lines'), function (line)
					{
						var same_line = lines.get(line.line_id)

						,	quantity = parseFloat(same_line.get('quantity')) + parseFloat(line.quantity);

						same_line.set('quantity', quantity);
					});
				});
			}

			return this;
		}

	,	setReturnedQuantities: function ()
		{
			var created_from = this.createdFrom
			,	lines = created_from.get('lines');

			created_from.get('returnauthorizations').each(function (sibling)
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
				});
			});

			return this;
		}

	,	setInvalidLines: function ()
		{
			var invalid_lines = []
			,	created_from = this.createdFrom
			,	lines = created_from.get('lines');

			invalid_lines = lines.filter(function (line)
			{
				return !line.get('quantity') || !line.get('item').get('_isReturnable');
			});

			lines.remove(invalid_lines);

			created_from.set('invalidLines', new OrderLineCollection(invalid_lines));

			return this;
		}

	,	parseLines: function ()
		{
			this
				.setFulfilledQuantities()
				.setReturnedQuantities()
				.setInvalidLines();

			return this;
		}

	,	getLines: function ()
		{
			return this.lines || (this.lines = this.parseLines().createdFrom.get('lines'));
		}

	,	getLine: function (id)
		{
			return this.getLines().get(id);
		}

	,	getActiveLines: function ()
		{
			return this.getLines().filter(function (line)
			{
				return line.get('checked');
			});
		}

	,	getTotalItemsToReturn: function ()
		{
			return _.reduce(this.getActiveLines(), function (memo, line)
			{
				return memo + parseFloat(line.get('returnQty') || line.get('quantity'));
			}, 0);
		}

	,	changeQuantityHandler: function (e)
		{
			var target = e.target
			,	line_id = this.getLineId(target);

			return this.setLine(line_id, 'returnQty', Math.min(target.value, this.getLine(line_id).get('quantity'))).showContent();
		}

	,	changeReasonHandler: function (e)
		{
			var target = e.target
			,	line_id = this.getLineId(target);

			this.setLine(line_id, 'reason', target.value).showContent();

			this.$('[data-type="return-line"][data-id="' + line_id + '"] input[name="reason-text"]').focus();
		}

	,	textReasonHandler: function (e)
		{
			var target = e.target;

			return this.setLine(this.getLineId(target), 'textReason', target.value);
		}

	,	changeCommentHandler: function (e)
		{
			this.comments = e.target.value;

			return this;
		}

	,	setLine: function (id, attribute, value)
		{
			this.getLine(id).set(attribute, value);

			return this;
		}

	,	applyReasonHandler: function (e)
		{
			var current_line = this.getLine(this.getLineId(e.target));

			e.preventDefault();
			e.stopPropagation();

			return this.setActiveLines({
				reason: current_line.get('reason')
			,	textReason: current_line.get('textReason')
			}).showContent();
		}

	,	saveForm: function (e)
		{
			var created_from = this.createdFrom
			,	data = {
					id: created_from.get('internalid')
				,	type: created_from.get('type')
				,	lines: this.getActiveLinesData()
				,	comments: this.getComments()
				};

			e.preventDefault();

			if (this.isValid(data))
			{
				return Backbone.View.prototype.saveForm.call(this, e, this.model, data);
			}
		}

	,	isValid: function (data)
		{
			var self = this
			,	lines = data.lines
			,	comments = data.comments

			,	no_reason_lines = _.filter(lines, function (line)
				{
					return !line.reason;
				})

			,	big_reason_lines = _.filter(lines, function (line)
				{
					return line.reason && line.reason.length > 4000;
				});

			if (!lines.length)
			{
				return this.showError('You must select at least one item for this return request.');
			}

			if (no_reason_lines.length)
			{
				_.each(no_reason_lines, function (line)
				{
					self.$('[data-id="' + line.id + '"] .control-group').addClass('error');
				});

				return this.showError('You must select a reason for return.');
			}

			if (big_reason_lines.length)
			{
				_.each(big_reason_lines, function (line)
				{
					self.$('[data-id="' + line.id + '"] .control-group').addClass('error');
				});

				return this.showError('The reason contains more that the maximum number (4000) of characters allowed.');
			}

			if (comments && comments.length > 999)
			{
				return this.showError('The comment contains more than the maximum number (999) of characters allowed.');
			}

			return true;
		}

	,	getActiveLinesData: function ()
		{
			var reason = null;

			return _.map(this.getActiveLines(), function (line)
			{
				reason = line.get('reason');

				return {
					id: line.get('internalid')
				,	quantity: line.get('returnQty') || line.get('quantity')
				,	reason: reason === 'other' ? line.get('textReason') : reason
				};
			});
		}

	,	getComments: function ()
		{
			return this.comments || '';
		}

	,	getDetailsMacro: function (line)
		{
			return function ()
			{
				return SC.macros.itemActionsEditQuantity({
					isActive: line.get('checked')
				,	returnQuantity: line.get('returnQty')
				,	lineQuantity: line.get('quantity')
				});
			};
		}

	,	getActionsMacro: function (line)
		{
			var reasons = this.reasons;
			
			return function ()
			{
				return SC.macros.itemActionsReasonsSelector({
					isActive: line.get('checked')
				,	reasons: reasons
				,	selectedReason: line.get('reason')
				,	textReason: line.get('textReason')
				});
			};
		}
	});
});
