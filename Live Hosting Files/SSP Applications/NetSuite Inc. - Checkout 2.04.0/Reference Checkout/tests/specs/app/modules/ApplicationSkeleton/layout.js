// ApplicationSkeleton.js
// --------------------
// Testing Core
define(['Application', 'jasmineTypeCheck'], function ()
{

	'use strict';

	var is_started = false
		,	application
		,	layout;



	describe('Application.Layout', function ()
	{
		it('Init', function ()
		{
			SC.templates = {'layout_tmpl': '<div id="layout"><div class="site-header"></div><div id="content"></div><div class="site-footer"></div></div>'};
			SC.compileMacros(SC.templates.macros);
			SC.macros = {
				header:function(){
					return '<div id="header-updated"></div>';
				}
			,	footer:function(){
					return '<div id="footer-updated"></div>';
				}
			};

			jQuery('<div id="main"></div>').appendTo('body');

			application = SC.Application('Applicaiton.Layout.test1');
			application.Configuration = {
				siteSettings:{
					sitetype: 'ADVANCED'
				}
			};

			jQuery(application.start(function () {
				is_started = true;
			}));
			waitsFor(function()
			{
				return is_started;
			});
			layout = application.getLayout();

		});

		it('should be a Backbone.View', function ()
		{
			expect(layout instanceof Backbone.View);
		});

		it('should trigger beforeAppendToDom and afterAppendToDom', function ()
		{
			var listeners_output = [];

			application.getLayout().on('beforeAppendToDom', function(view)
			{
				listeners_output.push({label: 'beforeAppendToDom', parentSize: this.$el.parents('body').size(), respectContract: this instanceof Backbone.View && view instanceof Backbone.View});

			});

			layout.on('afterAppendToDom', function(view)
			{
				listeners_output.push({label: 'afterAppendToDom', parentSize: this.$el.parents('body').size(), respectContract: this instanceof Backbone.View && view instanceof Backbone.View});
			});

			layout.appendToDom();
			//Simulate a view being showed
			layout.trigger('afterAppendView');

			expect(listeners_output).toEqual([ {label:'beforeAppendToDom', parentSize: 0, respectContract: true}, {label:'afterAppendToDom', parentSize: 1, respectContract: true} ]);
		});

		it('#should trigger beforeAppendView, beforeRender, afterAppendView and afterRender events', function ()
		{
			var view = new Backbone.View({
				application: application
			});
			SC.templates.layouttest1_tmpl = '<p>hello world</p>';
			view.template = 'layouttest1';

			var listeners_output = [];

			layout.on('beforeRender', function(aView)
			{
				listeners_output.push({label: 'beforeRender', respectContract: aView === layout});
			});

			layout.on('afterRender', function(aView)
			{
				listeners_output.push({label: 'afterRender', respectContract: aView === layout});
			});

			layout.on('beforeAppendView', function(aView)
			{
				listeners_output.push({label: 'beforeAppendView', respectContract: aView === view});
			});

			layout.on('afterAppendView', function(aView)
			{
				listeners_output.push({label: 'afterAppendView', respectContract: aView === view});
			});

			view.showContent();

			//afterRender is triggered twice because layout.updateUI is called on render.
			var expected = [{label:'beforeRender',respectContract:true},{label:'afterRender',respectContract:true},
				{label:'afterRender',respectContract:true},{label:'beforeAppendView',respectContract:true},{label:'afterAppendView',respectContract:true}];

			expect(listeners_output).toEqual(expected);
		});


		it('it should return the application', function(){
			expect(layout.getApplication()).toBe(application);
		});

		it('it should update the header', function(){
			expect(jQuery('#header-updated').length).toBe(0);
			layout.updateHeader();
			expect(jQuery('#header-updated').length).toBe(1);
		});

		it('it should update the footer', function(){
			expect(jQuery('#footer-updated').length).toBe(0);
			layout.updateFooter();
			expect(jQuery('#footer-updated').length).toBe(1);
		});
	});

	//TODO: currentView, container_element, content_element
});