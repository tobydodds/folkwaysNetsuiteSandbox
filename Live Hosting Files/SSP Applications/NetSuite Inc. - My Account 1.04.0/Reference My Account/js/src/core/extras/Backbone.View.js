// Backbone.View.js
// ----------------
// Extends native Backbone.View with a bunch of required methods
// most of this were defined as no-ops in ApplicationSkeleton.js
(function ()
{
	'use strict';
	
	_.extend(Backbone.View.prototype, {
		// Default error message, usally overwritten by server response on error
		errorMessage: 'Sorry, the information below is either incomplete or needs to be corrected.'
		
		// dont_scroll will eventually be changed to an object literal
	,	showContent: function (dont_scroll)
		{
			return this.options.application && this.options.application.getLayout().showContent(this, dont_scroll);
		}

	,	showInModal: function (options)
		{
			return this.options.application && this.options.application.getLayout().showInModal(this, options);
		}

		// Get view's SEO attributes
	,	getMetaDescription: function ()
		{
			return this.metaDescription;
		}

	,	getMetaKeywords: function ()
		{
			return this.metaKeywords;
		}

	,	getMetaTags: function ()
		{
			return jQuery('<head/>').html(this.metaTags || '').children('meta');
		}

		//Backbone.View.getTitle() : returns the document's title to show when this view is active. 
	,	getTitle: function ()
		{
			return this.title;
		}

	,	getCanonical: function ()
		{
			var canonical = window.location.protocol + '//' + window.location.hostname + '/' + Backbone.history.fragment
			,	index_of_query = canonical.indexOf('?');

			// !~ means: indexOf == -1
			return !~index_of_query ? canonical : canonical.substring(0, index_of_query);
		}

		// For paginated pages, you should implement this operations
		// to return the url of the previous and next pages
	,	getRelPrev: jQuery.noop
	,	getRelNext: jQuery.noop

		// "private", shouldn't be overwritten
		// if a custom destroy method is required
		// override the destroy method.
		// This method should still be called
	,	_destroy: function ()
		{
			// http://backbonejs.org/#View-undelegateEvents
			this.undelegateEvents();

			// http://backbonejs.org/#Events-off
			this.model && this.model.off(null, null, this);
			this.collection && this.collection.off(null, null, this);
		}
		
	,	destroy: function ()
		{
			this._destroy();
		}

	,	showConfirmationMessage: function (message)
		{
			var $msg_el = jQuery(SC.macros.message(message, 'success', true))
			,	confirm_message_element = this.$('[data-confirm-message]');
			
			confirm_message_element.show();
			confirm_message_element.empty().append($msg_el);

			setTimeout(function() 
			{
				confirm_message_element.fadeOut(3000);
			}, 5000);
		}

	,	showWarningMessage: function (message)
		{
			var $msg_el = jQuery(SC.macros.message(message, 'warning', true));
			
			this.$('[data-confirm-message]').empty().append($msg_el);			
		}

		// Disables and re-enables a given set of elements based on a promise
	,	disableElementsOnPromise: function (promise, selector)
		{
			var $target = this.$(selector);

			if ($target.length === 0)
			{
				return;
			}

			$target.attr('disabled', true);

			promise.always(function ()
			{
				$target.attr('disabled', false);
			});
		}
	});
})();