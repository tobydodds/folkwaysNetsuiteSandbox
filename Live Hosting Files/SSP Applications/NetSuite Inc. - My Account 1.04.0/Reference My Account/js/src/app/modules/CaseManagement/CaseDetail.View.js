// CaseDetail.View.js
// -----------------------
// Views for viewing Cases list.
define('CaseDetail.View',
function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'case_detail'

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
			this.fields = options.fields;
			this.user = this.application.getUser();
		}

	,	showContent: function ()
		{
			var case_number = this.model.get('caseNumber');

			this.page_header =  _('Case #$(0):').translate(case_number);
			this.title =_('Case Details').translate();
			this.page_title = _('Case #$(0):').translate(case_number);
			this.options.application.getLayout().showContent(this, 'cases', [{
				text: this.title
			,	href: '/case/' + this.model.get('internalid')
			}]);
		}

	,	events: {
			'submit form': 'customSaveForm'
		,	'click [data-action="reset"]': 'resetForm'
		,	'click [data-action="close-case"]': 'closeCase'
		,	'keypress [type="text"]': 'preventEnter'
		}
	
	,	customSaveForm : function(e)
		{
			e.preventDefault();
			
			var self = this
			,	promise = Backbone.View.prototype.saveForm.apply(this, arguments);

			promise && promise.success(function () {
				self.showContent();
				self.showConfirmationMessage(_('Good! Your message was sent. A support representative should contact you briefly.').translate());				
			});
		}

	,	attributes: {
			'class': 'caseDetail'
		}

		// Prevents not desired behaviour when hitting enter
	,	preventEnter: function(event)
		{
			if (event.keyCode === 13)
			{
				event.preventDefault();
			}
		}
		
	,	closeCase: function (event)
		{
			event.preventDefault();

			var self = this;

			this.model.set('reply', { reply: '' });
			this.model.set('status', { id: SC.ENVIRONMENT.CASES.CONFIG.default_values.status_close.id });
			this.model.save().done(function()
			{
				self.showContent();
				self.showConfirmationMessage(_('Case successfully closed').translate());
			});
		}	

	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent();
		}
	});
});