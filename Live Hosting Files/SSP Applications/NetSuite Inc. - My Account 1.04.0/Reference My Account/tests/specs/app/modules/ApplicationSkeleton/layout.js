/*global SC:false, Backbone:false, define:false, it:false, describe:false, expect:false, jQuery:false, waitsFor:false */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// ApplicationSkeleton.js
// --------------------
// Testing Core
define(['Application', 'jasmineTypeCheck'], function ()
{
	
	'use strict';

	var is_started = false
		,	application;

	

	describe('Application.Layout', function () 
	{
		it('Init', function ()
		{
			SC.templates = {'layout_tmpl': '<div id="layout"><div id="content"></div></div>'};
			SC.compileMacros(SC.templates.macros);

			jQuery('<div id="main"></div>').appendTo('body'); 

			application = SC.Application('Applicaiton.Layout.test1');
			jQuery(application.start(function () {
				is_started = true;
			}));
			waitsFor(function() 
			{
				return is_started;
			});
		});

		it('should be a Backbone.View', function ()
		{
			expect(application.getLayout() instanceof Backbone.View);
		});

		it('should trigger beforeAppendToDom and afterAppendToDom', function ()
		{
			var listeners_output = [];

			application.getLayout().on('beforeAppendToDom', function(view)
			{
				listeners_output.push({label: 'beforeAppendToDom', parentSize: this.$el.parents('body').size(), respectContract: this instanceof Backbone.View && view instanceof Backbone.View});
			}); 

			application.getLayout().on('afterAppendToDom', function(view)
			{
				listeners_output.push({label: 'afterAppendToDom', parentSize: this.$el.parents('body').size(), respectContract: this instanceof Backbone.View && view instanceof Backbone.View});
			}); 

			application.getLayout().appendToDom();

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

			application.getLayout().on('beforeRender', function(aView)
			{
				listeners_output.push({label: 'beforeRender', respectContract: aView === application.getLayout()});
			}); 

			application.getLayout().on('afterRender', function(aView)
			{
				listeners_output.push({label: 'afterRender', respectContract: aView === application.getLayout()});
			}); 

			application.getLayout().on('beforeAppendView', function(aView)
			{
				listeners_output.push({label: 'beforeAppendView', respectContract: aView === view});
			}); 

			application.getLayout().on('afterAppendView', function(aView)
			{
				listeners_output.push({label: 'afterAppendView', respectContract: aView === view});
			}); 

			view.showContent();

			//afterRender is triggered twice because layout.updateUI is called on render.
			var expected = [{label:'beforeRender',respectContract:true},{label:'afterRender',respectContract:true},
				{label:'afterRender',respectContract:true},{label:'beforeAppendView',respectContract:true},{label:'afterAppendView',respectContract:true}]; 

			expect(listeners_output).toEqual(expected); 
		});
	});	

	//TODO: currentView, container_element, content_element	
});