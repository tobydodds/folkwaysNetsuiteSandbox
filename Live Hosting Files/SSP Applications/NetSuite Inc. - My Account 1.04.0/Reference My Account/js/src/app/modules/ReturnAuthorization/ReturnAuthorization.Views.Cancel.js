define('ReturnAuthorization.Views.Cancel', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'return_authorization_cancel'

	,	title: _('Cancel Return Request').translate()

	,	page_header: _('Cancel Return Request').translate()

	,	events: {
			'click [data-action="delete"]': 'confirm'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
		}

	,	confirm: function ()
		{
			this.model.save({
				status: 'cancelled'
			}).then(jQuery.proxy(this, 'dismiss'));
		}

	,	dismiss: function ()
		{
			this.$containerModal.modal('hide');
		}
	});
});