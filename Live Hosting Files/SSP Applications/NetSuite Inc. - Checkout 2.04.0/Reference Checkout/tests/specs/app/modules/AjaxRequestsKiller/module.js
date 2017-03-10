// ApplicationSkeleton.js
// --------------------
// Testing Core
define(['TestHelper'], function (TestHelper)
{
	'use strict';

	var helper = new TestHelper({
			applicationName: 'AjaxRequestsKiller'
		,	loadTemplates: true
		,	startApplication: true
		,	mountModules: ['AjaxRequestsKiller']
		});

	var Fake_model = Backbone.Model.extend({})
	,	Fake_collection = Backbone.Collection.extend({
			url: 'some/service.ss'
		,	model: Fake_model
		})
	,	Fake_router = Backbone.Router.extend({
			routes: {
					'second-url': 'fakeHandle'
				,	'second-url2': 'fakeHandle'
			}
		,	fakeHandle: function(){}
		});

	describe('Ajax Request Killer', function () {

		it('should define an initial apllication.killerId', function ()
		{
			expect(helper.application.killerId).toBeDefined();
		});

		it('should allow parallel calls if killerId is not specified', function ()
		{
			var my_collection1 = new Fake_collection()
			,	my_collection2 = new Fake_collection()
			,	xhr1 = my_collection1.fetch();

			expect(xhr1.state()).toBe('pending');

			var xhr2 =my_collection2.fetch();

			expect(xhr1.state()).toBe('pending');
			expect(xhr2.state()).toBe('pending');

			var firstXhr  = jasmine.Ajax.requests.at(0);
			firstXhr.response({
				status: 200
			,	responseText: '{"result":"ok"}'
			});

			expect(xhr1.state()).toEqual('resolved');
			expect(xhr2.state()).toBe('pending');

			var secondXhr  = jasmine.Ajax.requests.at(1);
			secondXhr.response({
				status: 200
			,	responseText: '{"result":"ok"}'
			});

			expect(xhr1.state()).toEqual('resolved');
			expect(xhr2.state()).toBe('resolved');
		});

		it('should cancel previous ajaxs if using killerId when navigating', function ()
		{
			//Start a router so the AjaxRequestKiller event handler get executed
			new Fake_router();

			var my_collection1 = new Fake_collection()
			,	my_collection2 = new Fake_collection()
			,	backbone_history_called = false
			,	xhr1
			,	xhr2;

			Backbone.history.on('all', function ()
			{
				backbone_history_called = true;
			});

			runs(function ()
			{
				xhr1 = my_collection1.fetch({killerId:helper.application.killerId});

				expect(xhr1.state()).toBe('pending');

				location.hash = 'second-url';
			});

			waitsFor(function ()
			{
				return backbone_history_called;
			});

			runs(function ()
			{
				backbone_history_called = false;
				xhr2 = my_collection2.fetch({killerId:helper.application.killerId});
				location.hash = 'second-url2';

			});

			waitsFor(function ()
			{
				return backbone_history_called;
			});	

			runs(function ()
			{			
				expect(xhr1.state()).toBe('rejected');
				expect(xhr2.state()).toBe('pending');

				var secondXhr  = jasmine.Ajax.requests.at(1);
				secondXhr.response({
					status: 200
				,	responseText: '{"result":"ok"}'
				});

				expect(xhr1.state()).toEqual('rejected');
				expect(xhr2.state()).toBe('resolved');
			});
		});

		it('should define a new killerId when navigating', function ()
		{
			var first_killer_id = helper.application.killerId
			,	backbone_history_called = false;

			Backbone.history.on('all', function ()
			{
				backbone_history_called = true;
			});

			runs(function ()
			{
				location.hash = 'second-url';
			});

			waitsFor(function ()
			{
				return backbone_history_called;
			});

			runs(function ()
			{
				expect(helper.application.killerId).not.toEqual(first_killer_id);
				expect(helper.application.killerId).not.toBe(first_killer_id);
			});
		});

	});
});