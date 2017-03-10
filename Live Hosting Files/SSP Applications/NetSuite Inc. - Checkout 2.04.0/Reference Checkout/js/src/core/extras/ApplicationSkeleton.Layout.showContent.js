// ApplicationSkeleton.Layout.showContent.js
// -----------------------------------------
// Renders a View into the layout
// if the view needs to be rendered in a modal, it does so
// triggers a few different events on the layout
(function ()
{
	'use strict';

	SC.ApplicationSkeleton.prototype.Layout.prototype.showContent = function showContent (view, dont_scroll)
	{
		// if the user profile has not been loaded this makes it wait untill its done.
		var user_promise = this.application.getUserPromise();
		if (user_promise.state() !== 'resolved')
		{
			var self = this;
			user_promise.done(function()
			{
				self.render();
				// force backbone to reroute the current route. https://github.com/jashkenas/backbone/issues/652
				Backbone.history.loadUrl(Backbone.history.fragment);
			});

			if (this.application.getConfig('performance.waitForUserProfile'))
			{
				return jQuery.Deferred();
			}
		}

		var current_view = this.currentView;

		// if the current view displays a bootstrap modal manually (without calling view.showInModal)
		// then it is neccessary to clean up the modal backdrop manually here
		jQuery('.modal').modal('hide');

		if (view.inModal)
		{
			return view.showInModal();
		}

		// We render the layout only once, the first time showContent is called
		if (!this.rendered)
		{
			this.render();
			this.rendered = true;
		}

		// This line will destroy the view only if you are adding a diferent instance of a view
		if (current_view && current_view !== view)
		{
			current_view.destroy();

			if (current_view.bodyClass)
			{
				this.$el.removeClass(current_view.bodyClass);
			}
		}

		// the layout should have only one view, the currentView
		this.currentView = view;

		// Empties the content first, so events dont get unbind
		this.$content.empty();
		view.render();

		if (view.bodyClass)
		{
			this.$el.addClass(view.bodyClass);
		}

		//document's title
		document.title = view.title || '';

		this.trigger('beforeAppendView', view);
		this.$content.append(view.$el);
		this.trigger('afterAppendView', view);

		view.isRenderedInLayout = true;

		// Sometimes we do not want to scroll top when the view is rendered
		// Eventually we might change view and dont_scroll to an option obj
		if (!dont_scroll)
		{
			jQuery(document).scrollTop(0);
		}

		// we need to return a promise always, as show content might be async
		return jQuery.Deferred().resolveWith(this, [view]);
	};

})();
