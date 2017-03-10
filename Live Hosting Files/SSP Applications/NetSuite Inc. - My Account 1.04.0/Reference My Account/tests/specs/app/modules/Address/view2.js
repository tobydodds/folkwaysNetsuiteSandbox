/*global SC:false, it:false, describe:false, waitsFor: false, require: false, spyOn:false,  define:false, expect:false, beforeEach:false, jQuery:false */
/*jshint evil:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/
define(['Address','Application', 'Main', 'Utils', 'jasmineTypeCheck'], function ()
{
	'use strict';

	describe('The original Address View tests', function () {

		var is_started = false
		,	application
		,	view_list
		,	view_details
		,	view_rendered_list
		,	view_rendered_details;

		beforeEach(function ()
		{
			if (!is_started)
			{
				// initial setup required for this test: we will be working with views.
				// some of these tests require that some macros are loaded, so we load them all:
				jQuery.ajax({url: '../../../../../templates/Templates.php', async: false}).done(function(data){
					eval(data);
					SC.compileMacros(SC.templates.macros);
				});

				SC.templates.layout_tmpl = '<div id="content"></div>';

				SC.compileMacros(SC.templates.macros);

				// Here is the appliaction we will be using for this tests
				application = SC.Application('Address.Views');
				// This is the configuration needed by the modules in order to run

				application.Configuration =  {
					modules: [ 'Address' ]
				};

				// Starts the application
				jQuery(application.start(function () { is_started = true; }));

				// Makes sure the application is started before
				waitsFor(function()
				{
					if(is_started)
					{
						application.getLayout().$el.appendTo(jQuery('body'));
						var AddressCollection = require('Address.Collection');
						var views = require('Address.Views');

						application.getUser().set('addresses', new AddressCollection([{'zip':'1234','phone':'12341234123','defaultshipping':'T','state':'Sarasa','isresidential':'F','isvalid':'T','city':'Sarasa','country':'AX','addr1':'Sarasa','addr2':'Sarasa','addr3':null,'defaultbilling':'T','internalid':'374','id':'374','fullname':'Sarasa','company':'Sarasa'}]));
						var collection = application.getUser().get('addresses')
						,	model = collection.get('374');
						view_details = new views.Details({
							application: application
						,	collection: collection
						,	model: model
						});

						view_list = new views.List({
							application: application
						,	collection: collection
						,	model: model
						});

						// TODO: for some reason we have to put this confir here for this test to work
						SC.ENVIRONMENT.siteSettings = {
							registration: {displaycompanyfield: 'T'}
						,	countries:{
								'AF': {'name':'Afghanistan','code':'AF'}
							,	'AX': {'name':'Aland Islands','code':'AX'}
							}
						};

						application.getConfig().siteSettings = SC.ENVIRONMENT.siteSettings || {};

						view_rendered_details = view_details.render();
						view_rendered_list = view_list.render();

						return view_rendered_details && view_rendered_list;
					}
					else
					{
						return false;
					}
				});
			}
		});

		it('#1 remove should be a Function', function() {
			expect(view_rendered_list.remove).toBeA(Function);
		});

		it('#2 updateStates should be a Function', function() {
			expect(view_details.updateStates).toBeA(Function);
		});

		it('#3 resetForm should be a Function', function() {
			expect(view_details.resetForm).toBeA(Function);
		});

		it('#4 saveForm should be a Function', function() {
			expect(view_details.saveForm).toBeA(Function);
		});

		it('#5 formatPhone should be a Function', function() {
			expect(view_details.formatPhone).toBeA(Function);
		});

		it('#6 All addresses should be rendered', function() {
			var qty =  view_rendered_list.$el.length;
			expect(qty).toBe(1);
		});

		it('#7 change country should update the states', function() {
			view_rendered_details.showContent();
			spyOn(view_rendered_details,'updateStates');
			view_rendered_details.delegateEvents();
			view_rendered_details.$('select[data-type="country"]').change();
			expect(view_rendered_details.updateStates).toHaveBeenCalled();
		});

		it('#8 remove an address working', function() {
			spyOn(view_rendered_list,'remove');
			view_rendered_list.showContent();
			view_rendered_list.delegateEvents();
			view_rendered_list.$('[data-action="remove"]').click();
			expect(view_rendered_list.remove).toHaveBeenCalled();
		});

		it('#9 blur on data-type phone should trigger the function formatPhone', function() {
			spyOn(view_rendered_details,'formatPhone');
			view_rendered_details.showContent();
			view_rendered_details.delegateEvents();
			view_rendered_details.$('input[data-type="phone"]').blur();
			expect(view_rendered_details.formatPhone).toHaveBeenCalled();
		});
	});

});