/*global SC:false, xit:false, runs:false, it:false, spyOn: false, _: false, Backbone: false, describe:false, expect:false, define: false, beforeEach:false, jQuery:false, waitsFor:false */
/*jshint evil:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// Navigation.Helper.js
// --------------------
// Testing Navigation Helper.
define(['NavigationHelper', 'Application'], function ()
{
	'use strict';

	describe('Module: Navigation.Helper', function () {

		var is_started = false
		,	application;

		// initial setup required for this test: we will be working with views.
		SC.templates={'layout_tmpl': '<div id="layout"><div id="content"></div></div>'};
		SC.compileMacros(SC.templates.macros);

		/**very simplistic way of parsing an url in paramenters and hash. @return an Object {params, hash} */
		var parseUrl = function(url) {
			if(url.indexOf('?') === -1)
			{
				return {};
			}
			var ret = {};
			var right = url.split('?')[1];
			var hash = '';
			if(right.indexOf('#')>0)
			{
				var hash_arr = right.split('#');
				right = hash_arr[0]; //extract #hash
				hash = hash_arr[1];
			}
			var param_arr = right.split('&');
			for (var i = 0; i < param_arr.length; i++)
			{
				var p_arr = param_arr[i].split('=');
				ret[p_arr[0]] = p_arr[1];
			}
			return {
				params: ret
			,	hash: hash
			};
		};

		beforeEach(function ()
		{
			// Here is the appliaction we will be using for this tests
			application = SC.Application('NavigationHelper');
			// This is the configuration needed by the modules in order to run
			application.Configuration =  {
					modules: [ 'NavigationHelper', 'UrlHelper' ]
				,	currentTouchpoint: 'home'
				}
			;

			SC.SESSION = {
				touchpoints: {
					customercenter: 'https://www.netsuite.com/customercenter_test'
				,	home: 'https://www.netsuite.com/home_test'
				,	dummynonsecure: 'http://www.netsuite.com/dummynonsecure'
				}
			};

			// Starts the application
			jQuery(application.start(function () {
				application.getLayout().appendToDom();
				is_started = true;
			}));
			// Makes sure the application is started before
			waitsFor(function() {
				return is_started;
			});

			spyOn(_, 'doPost');
		});

		it('#1 should provide a utility method to get a url without parameters missing the protocol (http:// or https://)', function ()
		{
			expect(application.getLayout().getDomain('http://www.netsuite.com')).toBe('www.netsuite.com');
		});

		it('#2 should provide a utility method to get a url with parameters missing the protocol(http:// or https://)', function ()
		{
			expect(application.getLayout().getDomain('https://www.netsuite.com?test=true')).toBe('www.netsuite.com?test=true');
		});

		it('#3 should provide a utility method to get the protocol of an url without parameters', function ()
		{
			expect(application.getLayout().getProtocol('http://www.netsuite.com')).toBe('http:');
		});

		it('#4 should provide a utility method to get the protocol of an url with parameters', function ()
		{
			expect(application.getLayout().getProtocol('https://www.netsuite.com?test=true')).toBe('https:');
		});

		it('#5 should provide a utility method to set the touchpoint', function ()
		{
			expect(application.getLayout().getProtocol('https://www.netsuite.com?test=true')).toBe('https:');
		});

		it('#6 when mousedown on a element with parameter data-touchpoint the touchpoints function should be called', function ()
		{
			var layout = application.getLayout();
			spyOn(layout, 'touchpointMousedown').andCallThrough();

			application.getLayout().render();
			SC.templates.navigationHelperTest0_tmpl = '<a href="#" data-touchpoint="customercenter" id="test">test</a>';
			var view = new Backbone.View({
				application: application
			});
			view.template = 'navigationHelperTest0';
			view.showContent();
			var $el = view.$('#test');
			expect($el.attr('href')==='#').toBe(true);
			$el.mousedown();

			expect(layout.touchpointMousedown).toHaveBeenCalled();
			// var new_href = application.getConfig('siteSettings.touchpoints.customerCenter');
			// console.log(new_href);
			// expect($el.attr('href').indexOf(new_href) === 0).toBe(true); //starts with
		});

		it('#7 when mousedown on a element with parameters data-touchpoint the touchpoints function is called and Utils doPost function should be invoked with the correct url, unless attribute data-navigation="ignore-click" is present', function ()
		{
			var view = new Backbone.View({
				application: application
			});
			SC.templates.layout_tmpl = '<div id="content"></div>';
			SC.templates.navigationHelperTest1_tmpl = '<a href="#" data-touchpoint="customercenter" id="test">test</a><a href="#" data-touchpoint="customercenter" data-navigation="ignore-click" id="test2">test2</a>';
			view.template = 'navigationHelperTest1';
			view.showContent();
			expect(_.doPost).not.toHaveBeenCalled();
			view.$('#test2').mousedown();
			expect(_.doPost).not.toHaveBeenCalled();
			view.$('#test').mousedown();
			expect(_.doPost).toHaveBeenCalledWith('https://www.netsuite.com/customercenter_test');
		});

		it('#8 when mousedown data-touchpoint and not same touchpoint should perform post with ?fragment on url', function ()
		{
			// arrange
			var view = new Backbone.View({
				application: application
			});

			SC.templates.layout_tmpl = '<div id="content"></div>';
			SC.templates.navigationHelperTest2_tmpl = '<a href="#" data-touchpoint="customercenter" id="test" data-hashtag="#emailpreferences">test</a>';
			view.template = 'navigationHelperTest2';

			// act
			view.showContent();
			view.$('#test').mousedown();

			// assert
			expect(_.doPost).toHaveBeenCalledWith('https://www.netsuite.com/customercenter_test?fragment=emailpreferences');
		});

		it('#9 when mousedown on a element with parameters data-touchpoint with invalid value the touchpoints function should be called and the value of href should be empty', function ()
		{
			// arrange
			var view = new Backbone.View({
				application: application
			});
			SC.templates.layout_tmpl = '<div id="content"></div>';
			SC.templates.navigationHelperTest3_tmpl = '<a href="#" data-touchpoint="invalid-value" id="test">test</a>';
			view.template = 'navigationHelperTest3';

			// act
			view.showContent();
			view.$('#test').mousedown();

			// assert
			expect(_.doPost).not.toHaveBeenCalled();
		});

		it('#10 when mousedown on a element with parameters data-touchpoint and data-hashtag, and the currentTouchpoint is the current one, then the resulting href should be only the data-hashtag', function ()
		{
			// arrange
			var view = new Backbone.View({
				application: application
			});
			SC.templates.layout_tmpl = '<div id="content"></div>';
			SC.templates.navigationHelperTest4_tmpl = '<a href="#" data-touchpoint="home" id="test" data-hashtag="#something">test</a>';
			view.template = 'navigationHelperTest4';

			// act
			view.showContent();
			view.$('#test').mousedown();

			// assert
			//expect(view.$('#test').attr('href')).toBe('https://www.netsuite.com/home_test?fragment=something');
			expect(view.$('#test').attr('href')==='#something').toBe(true);
			expect(_.doPost).not.toHaveBeenCalled();
		});

		it('#11 getKeepOptionsUrl: when target touchpoint equals current touchpoint, a single data-keep-option parameter should be kept', function ()
		{
			// arrange
			Backbone.history.options={pushState: true}; //needed for (not wanted now) NavigationHelper.fixNoPushStateLink()
			var view = new Backbone.View({
				application: application
			});
			SC.templates.layout_tmpl = '<div id="content"></div>';
			SC.templates.navigationHelperTest11_tmpl = '<a href="/local?anchorParam3=val3" data-keep-options="windowParam1" data-touchpoint="home" id="test">test3</a>';
			view.template = 'navigationHelperTest11';
			view.showContent();
			// we need to provide a window.location.href so we mock the window object.
			// For this the tested code must access window through _.getWindow()
			spyOn(_, 'getWindow').andCallFake(function() {
				return {location: {href: '/lobal1?windowParam1=val2&windowParam2=val3'}};
			});

			// act
			view.$('#test').mousedown();

			// assert
			var url = parseUrl(view.$('#test').attr('href'));
			expect(url.params.windowParam2).not.toBeDefined();
			expect(url.params.windowParam1).toBe('val2');
			expect(url.params.anchorParam3).toBe('val3');
		});

		it('#12 getKeepOptionsUrl: when target touchpoint equals current touchpoint, data-keep-option="*" parameter should keep all parameters', function ()
		{
			Backbone.history.options={pushState: true}; //needed for (not wanted now) NavigationHelper.fixNoPushStateLink()
			var view = new Backbone.View({
				application: application
			});
			SC.templates.layout_tmpl = '<div id="content"></div>';
			SC.templates.navigationHelperTest12_tmpl = '<a href="/local?anchorParam3=val3" data-keep-options="*" data-touchpoint="home" id="test">test3</a>';
			view.template = 'navigationHelperTest12';
			view.showContent();
			// we need to provide a window.location.href so we mock the window object.
			// For this the tested code must access window through _.getWindow()
			spyOn(_, 'getWindow').andCallFake(function() {
				return {location: {href: '/lobal1?windowParam1=val2&windowParam2=val3'}};
			});

			// act
			view.$('#test').mousedown();

			// assert
			var url = parseUrl(view.$('#test').attr('href'));
			expect(url.params.windowParam2).toBe('val3');
			expect(url.params.windowParam1).toBe('val2');
			expect(url.params.anchorParam3).toBe('val3');

			Backbone.history.navigate('', {trigger: false}); //undo push state change
		});
	});

	describe('navigate in modal support', function(){

		var application = null
		,	is_started = false
		,	layout = null;

		beforeEach(/*'Initial application setup',*/ function(){
			// initial setup requir0d for this test: we will be working with views.
			// some of these tests require that some macros are loaded, so we load them all:
			jQuery.ajax({url: '../../../../../templates/Templates.php', async: false}).done(function(data){
				eval(data);
				SC.compileMacros(SC.templates.macros);
			});

			jQuery('body').append('<div id="main"></div>');
			application = SC.Application('test1');
			application.Configuration =  {
				modules: [ 'NavigationHelper', 'UrlHelper' ]
			};

			jQuery(application.start(function ()
			{
				layout = application.getLayout();
				layout.appendToDom(); //we can work without appending to the DOM
				layout.render();

				is_started = true;
			}));

			waitsFor(function() {
				return is_started;
			});
		});

		it('support show internal links in modals using data-toggle="show-in-modal"', function ()
		{
			try {
				Backbone.history.stop();
			} catch(ex){}

			//we need a router to navigate to where the link to be shown in the modal tell us.
			var Router = Backbone.Router.extend({
				routes: {
					'navigationHelperTest1': 'navigationHelperTest1'
				}
			,	navigationHelperTest1: function()
				{
					SC.templates.navigationHelper_modal2_tmpl = '<b id="navhelpertestinmodal1">hello world using data-toggle="show-in-modal"!';
					var view = new Backbone.View({
						application: application
					});
					view.template = 'navigationHelper_modal2';
					view.showContent();
				}
			});

			new Router();

			Backbone.history.start();

			//now render a view that contains a link with data-toggle="show-in-modal"
			SC.templates.navigationHelper_modal1_tmpl = '<a href="navigationHelperTest1" data-toggle="show-in-modal" id="modal_link1" data-modal-class-name="modal-big">data-toggle="show-in-modal"</a>';
			var view = new Backbone.View({
				application: application
			});
			view.template = 'navigationHelper_modal1';
			view.showContent();

			runs(function()
			{
				view.$('#modal_link1').click();
			});

			var is_modal_content_visible = function()
			{
				//notice that in modals ids and classnames are prefixed with 'in-modal'
				return jQuery('#main #in-modal-navhelpertestinmodal1').size() > 0;
			};

			waitsFor(is_modal_content_visible, 'modal for internal link should be shown');

			runs(function()
			{
				expect(is_modal_content_visible()).toBe(true);
				expect(jQuery('.modal-container .modal-big').size() > 0).toBe(true);
				application.getLayout().$containerModal.modal('hide');
			});
		});

		xit('support show external links in modals using data-toggle="show-in-modal"', function ()
		{
			//now render a view that contains a link with data-toggle="show-in-modal"
			SC.templates.navigationHelper_modalexternal1_tmpl = 'external link : <a href="http://non.existing.example.com" data-toggle="show-in-modal" id="modal_link2" data-modal-class-name="modal-big">data-toggle="show-in-modal" external</a>';
			var view = new Backbone.View({
				application: application
			});
			view.template = 'navigationHelper_modalexternal1';
			view.showContent();

			runs(function()
			{
				view.$('#modal_link2').click();
			});

			var is_modal_content_visible = function()
			{
				return jQuery('#main .modal-container .modal-body iframe').size() > 0;
			};

			waitsFor(is_modal_content_visible, 'modal for external link should be shown');

			runs(function()
			{
				expect(is_modal_content_visible()).toBe(true);
				expect(jQuery('#main .modal-container .modal-big').size() > 0).toBe(true);
				expect(jQuery('#main .modal-container .modal-body iframe').attr('src')).toBe('http://non.existing.example.com');
				application.getLayout().$containerModal.modal('hide');
			});

		});

	});
});
