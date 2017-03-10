define('ReturnAuthorization.Views.Form', ['ListHeader', 'OrderLine.Collection', 'ReturnAuthorization.GetReturnableLines'],
	function (ListHeader, OrderLineCollection, ReturnLinesCalculator)
{
	'use strict';

	return Backbone.View.extend({

		template: 'return_authorization_form'

	,	title: _('Return Products').translate()

	,	page_header: _('Return Products').translate()

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

		//set in the model which lines are returnabled (these are leaved in the lines property with its quantities updated) and which are already returned
		// (these are saved in invalidLines collection in the current model)
	,	parseLines: function ()
		{
			var returnable_calculator = new ReturnLinesCalculator(this.createdFrom)
			,	lines_group = returnable_calculator.calculateLines()
			,	lines = this.createdFrom.get('lines');

			this.createdFrom.set('invalidLines', new OrderLineCollection(lines_group.invalidLines));
			lines.remove(lines_group.invalidLines);
			lines.each(function (line)
			{
				line.set('quantity', lines_group.validLineIdsQuantities[line.id]);
			});

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
			var active_lines = this.getActiveLines()
			,	reasons = this.reasons;

			return function ()
			{
				return SC.macros.itemActionsReasonsSelector({
					isActive: line.get('checked')
				,	reasons: reasons
				,	selectedReason: line.get('reason')
				,	textReason: line.get('textReason')
				,	active_lines_length: active_lines.length
				});
			};
		}
	});
});
