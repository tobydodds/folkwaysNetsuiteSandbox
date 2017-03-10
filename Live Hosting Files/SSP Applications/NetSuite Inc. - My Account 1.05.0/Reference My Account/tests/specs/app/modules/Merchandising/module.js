define(['Merchandising', 'Application'], function ()
{
	'use strict';

	return describe('Merchandising Module', function ()
	{
		var is_started = false
		,	application;

		beforeEach(function ()
		{
			is_started = false; 
			if (!is_started)
			{
				SC.templates={'layout_tmpl': '<div id="layout"><div id="content"></div></div>'};
				application = SC.Application('Merchandising1');
				application.Configuration = {
					modules: ['Merchandising']
				}; 

				spyOn(jQuery.fn, 'merchandisingZone').andCallThrough();

				jQuery(application.start(function () { is_started = true; }));
				waitsFor(function() { return is_started; });

			}
		});

		it('When a view with data-type="merchandizing-zone" is added the jquery plugin should be called', function ()
		{
			SC.templates.Merchandising1Test0_tmpl = '<div data-type="merchandising-zone">test</div>';
			var view = new Backbone.View({
				application: application
			});
			view.template = 'Merchandising1Test0';

			view.render();			

			expect(view.$('[data-type="merchandising-zone"]').merchandisingZone).not.toHaveBeenCalled(); 

			view.showContent();

			expect(view.$('[data-type="merchandising-zone"]').merchandisingZone).toHaveBeenCalled();

			expect(view.$('[data-type="merchandising-zone"]').merchandisingZone.calls.length).toEqual(1);

		}); 

		
		it('when a merchandizing content type is added the jquery plugin should be called ', function ()
		{
			SC.templates.Merchandising1Test1_tmpl = '<div data-type="merchandising-zone">test<div class="target1"></div></div>';
			var view = new Backbone.View({
				application: application
			});
			view.template = 'Merchandising1Test1';

			view.showContent();

			expect(view.$('[data-type="merchandising-zone"]').merchandisingZone.calls.length).toEqual(2);

			//now simulate a content merchandizing adding
			var content_zone = {contenttype: 'merchandising'
			,	content: 'hello world'
			,	target: '.target1'
			};

			application.getLayout().trigger('renderEnhancedPageContent', view, content_zone);

			expect(view.$('[data-type="merchandising-zone"]').merchandisingZone.calls.length).toEqual(4);
			var spy = view.$('[data-type="merchandising-zone"]').merchandisingZone;
			expect(spy.argsForCall[3][0].application).toBe(application);
			expect(spy.argsForCall[3][0].id).toBe('hello world');
	
		}); 
	});
});