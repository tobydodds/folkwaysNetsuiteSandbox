// Wizard.Module.js
// ----------------
// Abstract Representation of a Wizard Module
define('Wizard.Module', function ()
{
	'use strict';

	return Backbone.View.extend({

		tagName: 'article'

	,	template: 'wizard_module'

	,	errors: []

	,	initialize: function (options)
		{
			this.wizard = options.wizard;
			this.step = options.step;
			this.model = options.wizard.model;

			// errors array in the configuration file completely overrides the default one.
			if (options.errors)
			{
				this.errors = options.errors;
			}
		}

		//General method to disable the module interface called at the moment of submitting the step
	,	disableInterface: jQuery.noop

		//General method to re-enable the module interface called after submiting
	,	enableInterface: jQuery.noop

	,	_render: function ()
		{
			this.$el.addClass('module-rendered');
			var ret = Backbone.View.prototype._render.apply(this, arguments);

			// add the error message box to the module
			if (!this.$('[data-type="alert-placeholder-module"]').length)
			{
				this.$el.prepend('<div data-type="alert-placeholder-module"></div>');
			}

			// we show module errors (if any) and remove the error object
			if (this.error)
			{
				this.showError();
			}

			// We trigger the resize event of the body as the dom is changed
			// and some components might be positioned based on the body size
			jQuery(document.body).trigger('resize');

			return ret;
		}

		// by default, a module returns it's validation promise
	,	submit: function ()
		{
			return this.isValid();
		}

	,	cancel: function ()
		{
			return jQuery.Deferred().resolve();
		}

		// validate resolves a promise because maybe it needs to do some ajax for validation
	,	isValid: function ()
		{
			return jQuery.Deferred().resolve();
		}

		//Base implementation to determines is a module is active (can be submited, rendered or just use) or not
	,	isActive: function ()
		{
			return _.isFunction(this.options.isActive) ?
					this.options.isActive.apply(this, arguments) :
					true;
		}

		// returns the title of the module, can be overriden in the configuration file
	,	getTitle: function ()
		{
			return _.isFunction(this.options.title) ?
					this.options.title.apply(this) :
					this.options.title || this.title || '';
		}

	,	manageError: function (error)
		{
			if (this.state !== 'future')
			{
				this.error = error;
				this.trigger('error', error);

				// if the module is being shown we show the error
				if (this.wizard.getCurrentStep() === this.step)
				{
					this.showError();
				}
			}
		}

		// render the error message
	,	showError: function ()
		{
			//Note: in special situations (like in payment-selector), there are modules inside modules, so we have several place holders, so we only want to show the error in the first place holder.
			this.$('[data-type="alert-placeholder-module"]:first').html(
				SC.macros.message(this.error.errorMessage, 'error', true)
			);
			this.error = null;
		}

		// empty the error message container
	,	clearError: function ()
		{
			this.$('[data-type="alert-placeholder-module"]').empty();
			this.error = null;
		}

		// General method to clear any message at step level
	,	clearGeneralMessages: function ()
		{
			jQuery('[data-type="alert-placeholder-module"]:first').empty();
		}

		//Notify a message (not just an error) at step level. Type can be a boolean (true: for errors, false: for success) or string to add a class alert-<type>
	,	showGeneralMessage: function (message, type)
		{
			var message_type = _.isString(type) ?
										type :
										type && 'error' || 'success';

			jQuery('[data-type="alert-placeholder-module"]:first').html(
				SC.macros.message(message, message_type, true)
			);
		}

	});
});
