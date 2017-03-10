define('ReturnAuthorization.Views.Detail', ['ReturnAuthorization.Views.Cancel'], function (CancelView)
{
	'use strict';

	return Backbone.View.extend({

		template: 'return_authorization_detail'

	,	title: _('Return Details').translate()

	,	events: {
			'click [data-action="cancel"]': 'cancel'
		}

	,	attributes: {
			'class': 'ReturnAuthorizationDetail'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
		}

	,	showContent: function ()
		{
			var tranid = this.model.get('tranid')
			,	title = _('Return <span class="strong-text return-number">#$(0)</span>').translate(tranid);

			this.page_title = title;
			this.page_header = title;

			this.application.getLayout().showContent(this, 'returns', [
				{
					text: _('Returns').translate()
				,	href: '/returns'
				}
			,	{
					text: _('Return').translate() + ' #' + tranid
				,	href: '/returns'
				}
			]);
		}

	,	getLinkedRecordUrl: function ()
		{
			var created_from = this.model.get('createdfrom');

			return created_from ? (created_from.type === 'SalesOrd' ? '/ordershistory/view/' : '/invoices/') + created_from.internalid : '';
		}

	,	getCreatedFromLabel: function ()
		{
			var created_from = this.model.get('createdfrom');

			return created_from ? created_from.type === 'SalesOrd' ? 'Order' : 'Invoice' : '';
		}

	,	cancel: function ()
		{
			new CancelView({
				application: this.application
			,	model: this.model
			}).showInModal('returns');

			this.model.once('sync', jQuery.proxy(this, 'redirect'));
		}

	,	redirect: function ()
		{
			Backbone.history.navigate('returns?cancel=' + this.model.get('internalid'), {trigger: true});
		}
	});
});
