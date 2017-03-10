/*global SC:false, it:false, describe:false, waitsFor:false, _:false, define:false, expect:false,jQuery:false */
/*jshint evil:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/
//test for MyAccount Application logic, mostly the menu items functionality
// TODO is the TreeMenu component created?
// TODO children in childrens
// check that getFixedMenuItems is called on Layout.render()
// updateMenuItemsUI, removeMenuItem, updateCrumbtrail
// TODO I have trouble start() the application in foreach with different configurations so a single start is made with all posible configurations. 
define(['Application', 'jasmineTypeCheck', 'MenuTree'], function ()
{
	'use strict';	
	
	describe('Basic', function () {
		it('MyAccount instance', function(){			
			expect(SC.Application('MyAccount').name).toBe('MyAccount'); 
		});
	});

	describe('Menu items', function () {

		it('Initial application setup', function () {
			// initial setup required for this test: we will be working with views.
			// some of these tests require that some macros are loaded, so we load them all:
			jQuery.ajax({url: '../../../../templates/Templates.php', async: false}).done(function(data){
				eval(data); 
				SC.compileMacros(SC.templates.macros);
			}); 

			//good looking menu items
			jQuery('<link>')
			.appendTo(jQuery('head'))
			.attr({type : 'text/css', rel : 'stylesheet'})
			.attr('href', '../../../../skins/standard/styles.css');

			jQuery('body').append('<div id="main"></div>'); 
		});

		var application = null
		,	is_started = false
		,	layout = null; 

		it('Application configuring and instantiation', function(){

			//  a module that defines a simple static menuitems
			define('ApplictionModuleTest1', function(){
				return {
					MenuItems: [
						{
							id: 'test1'
						,	name: _('Test 1').translate()
						,	url: 'test1/url'
						,	index: 2
						}
					,	{
							id: 'test2'
						,	name: _('Test 2').translate()
						,	url: 'test2/url'
						,	index: 2
						}
					]
				};
			});

			// another module with more advanced menu items definitions, including use of functions and childrens. 
			define('ApplictionModuleTest2', function()
			{
				return {
					MenuItems: [
						{
							id: 'test4'
						,	name: _('Test 3').translate()
						,	url: 'test4/url'
						,	index: 2

							// submenues can be added with the children property
						,	children: [{
								id: 'children1'
							,	name: _('chlidren').translate()
							,	url: 'test4/url'
							,	index: 2
							}]
						}
					,	function ()
						{  //menu items it self can be functions
							return {
								id: 'test5'
							,	name: function (application) { return application.name; }
							,	url: 'test5/url'
							,	index: 2 // menu order is first by index and then by name.
								// children property can also be a function
							,	children: function() {
									return [{
									id: 'children3'
								,	name: _('chlidren3').translate()
								,	url: 'children3/url'
								,	index: 2
								,	children: [ //and also sub-childrens
										{
											id: 'children31'
										,	name: _('chlidren31').translate()
										,	url: 'children31/url'
										,	index: 2
										,	children: [ //and also sub-childrens
												{
												id: 'children311'
											,	name: _('chlidren311').translate()
											,	url: 'children311/url'
											,	index: 2
											}
											]
										}
									]
								}]; 
								}
							}; 
						}
					]
				};
			});

			define('ApplictionModuleTest3', function()
			{
				return {
					MenuItems: [
						{
							id: 'test6'
						,	name: function(){return 'ApplictionModuleTest3 say hi!'; }
						,	url: 'test6/url'
						,	index: 2
						}
					]
				};
			}); 

			application = SC.Application('MyAccount'); //must be this name
			application.Configuration =  {
				modules: ['ApplictionModuleTest1', 'ApplictionModuleTest2', 'ApplictionModuleTest3']
			};

			jQuery(application.start(function () {
				layout = application.getLayout();
				layout.appendToDom(); //we can work without appending to the DOM
				layout.render();
				is_started = true; 
			})); 

			waitsFor(function() {
				return is_started; 
			});	
			
		});

		it('the layout should have menu items related methods', function()
		{
			expect(layout.getMenuItems).toBeA(Function);
			expect(layout.getMenuItems()).toBeAnArray(); 
			expect(layout.getMenuItems().length).toBe(5); 
		});

		it('the DOM should contain a sidebar with 2 menu items links', function()
		{			
			expect(layout.$('#sidebar').size()).toBe(1); 
			expect(layout.$('#sidebar>li').size()).toBe(5); //five parent menus 
		});

		it('the DOM should now contain there should be two data-label attributes', function()
		{			
			expect(layout.$('#sidebar [data-label="test2"]').size()).toBe(1); 
			expect(layout.$('#sidebar [data-label="test1"]').size()).toBe(1); 
		});
		
		it('index should be respected and the links have the correct hrefs', function()
		{			
			expect(layout.$('#sidebar>li:nth-child(1)>a').attr('href')).toBe('/test6/url'); 
			expect(layout.$('#sidebar>li:nth-child(2)>div>a').attr('href')).toBe('/test5/url'); 
			expect(jQuery.trim(layout.$('#sidebar>li:nth-child(1)>a').text())).toBe('ApplictionModuleTest3 say hi!'); 
			expect(jQuery.trim(layout.$('#sidebar>li:nth-child(2)>div>a').text())).toBe('MyAccount'); 
		});


	}); //menuitems

});