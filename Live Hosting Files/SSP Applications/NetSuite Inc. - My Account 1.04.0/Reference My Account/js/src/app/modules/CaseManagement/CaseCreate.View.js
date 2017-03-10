// CaseCreate.View.js
// -----------------------
// Views for viewing Cases list.
define('CaseCreate.View', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'case_new'

	,	title: _('How can we help you?').translate()

	,	page_header: _('How can we help you?').translate()

	,	events: {
			'submit form': 'saveForm'
		,	'keypress [type="text"]': 'preventEnter'
		,	'click input[name="include_email"]': 'includeAnotherEmail'
		}

	,	attributes: {
			'class': 'newCase'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
			this.fields = options.fields;
			this.user = this.application.getUser();
			this.model.on('sync', jQuery.proxy(this, 'showSuccess'));			
		}

		// Prevents not desired behaviour when hitting enter
	,	preventEnter: function(event)
		{
			if (event.keyCode === 13) 
			{
				event.preventDefault();
			}
		}

	,	showContent: function ()
		{
			this.options.application.getLayout().showContent(this, 'newcase', [{
				text: this.title
			,	href: '/newcase'
			}]);
		}

	,	showSuccess: function()
		{	
			var case_link_name = _('support case #$(0)').translate(this.model.get('caseNumber'))
			,	new_case_internalid = this.model.get('internalid')
			,	case_link = '<a href="/cases/' + new_case_internalid + '">' + case_link_name + '</a>'
			,	new_case_message = _('Good! your $(0) was submitted. We will contact you briefly.').translate(case_link);

			this.newCaseId = new_case_internalid;
			this.newCaseMessage = new_case_message;

			Backbone.history.navigate('cases', {trigger: true});
		}

	,	includeAnotherEmail: function() 
		{
			this.$('.case-new-email').collapse('toggle');

			var email_input = this.$('.input-case-email');
			
			email_input.prop('disabled', !email_input.prop('disabled'));
		} 
	});
});