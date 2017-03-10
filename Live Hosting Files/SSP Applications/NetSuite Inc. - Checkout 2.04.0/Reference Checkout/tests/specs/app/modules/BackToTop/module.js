// BackToTop.js
// --------------------
// Testing BackToTop module.
define(['BackToTop', 'Application'], function ()
{
	
	'use strict';
	
	describe('Module: BackToTop', function () {
		
		var is_started = false
		,	application;
		
		// initial setup required for this test: we will be working with views.
		SC.templates={'layout_tmpl': '<div id="layout"><div id="content"></div></div>'}; 
		SC.compileMacros(SC.templates.macros);

		beforeEach(function ()
		{
			if (!is_started)
			{
				// Here is the appliaction we will be using for this tests
				application = SC.Application('BackToTop');
				// This is the configuration needed by the modules in order to run
				application.Configuration =  {
					modules: [ 'BackToTop' ]
				};
				// Starts the application
				jQuery(application.start(function () { is_started = true; }));
				// Makes sure the application is started before 
				waitsFor(function() { return is_started; });
			}
			
		});
		
		it('#1: elements with data-action="back-to-top" as parameter must have "backToTop" as event', function() {
			var layout = application.getLayout();
			spyOn(layout, 'backToTop');
			SC.templates.layout_tmpl = '<div id="content"></div>';
			SC.templates.test_tmpl = '<div id="test" data-action="back-to-top"></div>';
			var view = new Backbone.View({
				application: application
			});
			view.template = 'test';
			view.showContent();
			view.$('#test').click();
			expect((application.getLayout()).backToTop).toHaveBeenCalled();
		});	

	});

});