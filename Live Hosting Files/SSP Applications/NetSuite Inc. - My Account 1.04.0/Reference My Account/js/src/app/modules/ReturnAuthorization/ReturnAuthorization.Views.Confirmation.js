define('ReturnAuthorization.Views.Confirmation', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'return_authorization_confirmation'

	,	title: _('Request Return').translate()

	,	page_header: _('Confirmation').translate()

	,	page_title: _('Request Return').translate()

	,	attributes: {
			'class': 'ReturnAuthorizationConfirmation'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
		}

	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'returns', [
				{
					text: this.title
				,	href: '/returns'
				}
			]);
		}

	,	getCreatedFromLabel: function ()
		{
			return this.model.get('createdfrom').type === 'SalesOrd' ? 'Order' : 'Invoice';
		}
	});
});