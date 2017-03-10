/*jshint laxcomma:true*/
define(['ReturnAuthorization'], function (ReturnAuthorization)
{
	'use strict';

	return describe('ReturnAuthorization', function ()
	{
		it('initializes Router on mountToApp', function ()
		{
			spyOn(ReturnAuthorization, 'Router');

			expect(ReturnAuthorization.Router).not.toHaveBeenCalled();

			ReturnAuthorization.mountToApp();

			expect(ReturnAuthorization.Router).toHaveBeenCalled();
		});

		it('defines the MenuItems', function ()
		{
			expect(ReturnAuthorization.MenuItems).toBeDefined();
		});

		describe('Model', function ()
		{
			it('is defined', function ()
			{
				expect(ReturnAuthorization.Model).toBeDefined();
			});

			it('has a urlRoot', function ()
			{
				expect(ReturnAuthorization.Model.prototype.urlRoot).toBeDefined();
			});

			it('transforms lines into an OrderLineCollection', function ()
			{
				var OrderLineCollection = require('OrderLine.Collection')

				,	model_1 = new ReturnAuthorization.Model()

				,	model_2 = new ReturnAuthorization.Model({
						lines: []
					});

				expect(model_1.get('lines') instanceof OrderLineCollection).toBe(true);

				model_1.set('lines', [
					{id: 1}
				,	{id: 2}
				]);

				expect(model_1.get('lines') instanceof OrderLineCollection).toBe(true);

				expect(model_2.get('lines') instanceof OrderLineCollection).toBe(true);
			});
		});

		describe('Collection', function ()
		{
			it('is defined', function ()
			{
				expect(ReturnAuthorization.Collection).toBeDefined();
			});

			it('has a url', function ()
			{
				expect(ReturnAuthorization.Collection.prototype.url).toBeDefined();
			});

			it('uses the ReturnAuthorization Model', function ()
			{
				expect(ReturnAuthorization.Collection.prototype.model).toBe(ReturnAuthorization.Model);
			});

			it('parses the paginated server response', function ()
			{
				var collection = new ReturnAuthorization.Collection();

				spyOn(collection, 'parse').andCallThrough();

				jasmine.Ajax.withMock(function ()
				{
					collection.fetch();

					jasmine.Ajax.requests.mostRecent().response({
						status: 200
					,	responseText: JSON.stringify({
							totalRecordsFound: 15
						,	recordsPerPage: 5
						,	records: [
								{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}
							]
						})
					});

					expect(collection.parse).toHaveBeenCalled();
					expect(collection.totalRecordsFound).toBe(15);
					expect(collection.recordsPerPage).toBe(5);
					expect(collection.length).toBe(5);
				});
			});

			it('fetches on update', function ()
			{
				var collection = new ReturnAuthorization.Collection();

				spyOn(collection, 'fetch');

				expect(collection.update).toBeDefined();

				collection.update({
					sort: {value: 'name'}
				,	order: 1
				,	page: 2
				});

				expect(collection.fetch).toHaveBeenCalledWith({
					data: {
						sort: 'name'
					,	order: 1
					,	from: null
					,	to: null
					,	page: 2
					}
				,	reset: true
				});
			});
		});

		describe('Views', function ()
		{
			it('is defined', function ()
			{
				expect(ReturnAuthorization.Views).toBeDefined();
			});
		});

		describe('Router', function ()
		{
			it('is defined', function ()
			{
				expect(ReturnAuthorization.Router).toBeDefined();
			});

			describe('list', function ()
			{
				var router = null
				,	mocked_view = null;

				beforeEach(function ()
				{
					router = new ReturnAuthorization.Router();

					mocked_view = {
						showContent: function () {}
					};

					ReturnAuthorization.Views.List = function (options)
					{
						mocked_view.collection = options.collection;

						return mocked_view;
					};
				});

				it('initializes the list view and shows it', function ()
				{
					spyOn(ReturnAuthorization.Views, 'List').andCallThrough();
					spyOn(mocked_view, 'showContent');

					router.list();

					expect(ReturnAuthorization.Views.List.calls.length).toBe(1);
					expect(mocked_view.showContent.calls.length).toBe(1);
				});

				it('showsContent again on collection reset', function ()
				{
					spyOn(mocked_view, 'showContent');

					router.list();

					expect(mocked_view.showContent.calls.length).toBe(1);

					mocked_view.collection.trigger('reset');

					expect(mocked_view.showContent.calls.length).toBe(2);
				});

				xit('sets a message on the view if cancel parameter', function ()
				{
					router.list('&cancel=T');

					expect(mocked_view.message).toBeDefined();
				});
			});

			describe('details', function ()
			{
				var router = null
				,	mocked_view = null;

				beforeEach(function ()
				{
					router = new ReturnAuthorization.Router();

					mocked_view = {
						showContent: function () {}
					};

					ReturnAuthorization.Views.Detail = function ()
					{
						return mocked_view;
					};
				});

				it('shows the details view on model fetch', function ()
				{
					spyOn(ReturnAuthorization.Views, 'Detail').andCallThrough();
					spyOn(mocked_view, 'showContent');

					jasmine.Ajax.withMock(function ()
					{
						router.details();

						jasmine.Ajax.requests.mostRecent().response({
							status: 200
						,	responseText: JSON.stringify({
								id: 25
							})
						});

						expect(ReturnAuthorization.Views.Detail.calls.length).toBe(1);
						expect(mocked_view.showContent.calls.length).toBe(1);
					});
				});
			});
		});
	});
});