/*jshint laxcomma:true*/
define(['Case', 'Case.Collection', 'Case.Model', 'CaseFields.Model', 'Case.Router', 'CaseCreate.View', 'CaseList.View', 'CaseDetail.View'],function (Case, Collection, Model, FieldsModel, Router, CreateView, ListView, DetailView)
{
	'use strict';

	return describe('Case Management module', function ()
	{
		describe('Public Properties Exposed', function() 
		{
			it('should have public properties for each of its components', function() 
			{
				expect(Case).toBeDefined();
				expect(Collection).toBeDefined();
				expect(Model).toBeDefined();
				expect(FieldsModel).toBeDefined();
				expect(Router).toBeDefined();
				expect(CreateView).toBeDefined();				
				expect(ListView).toBeDefined();
				expect(DetailView).toBeDefined();
			});
		});

		describe('Case Collection', function() 
		{
			var collection = new Collection();
			
			it('should have public properties', function ()
			{
				expect(collection.model).toBeDefined();
				expect(collection.url).toBeDefined();
			});

			it('should have the property "url" pointing to the service case.ss', function () 
			{
				expect(collection.url).toEqual('services/case.ss');
			});

			it('uses the Case Model', function ()
			{
				expect(Collection.prototype.model).toBe(Model);
			});

			it('parses the paginated server response', function ()
			{
				var collection = new Collection();

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
				var collection = new Collection();

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

		describe('Case Model', function() 
		{
			var model = new Model();
			
			it('should have public properties', function ()
			{
				expect(model.initialize).toBeDefined();
				expect(model.urlRoot).toBeDefined();
				expect(model.validation).toBeDefined();
			});

			it('should have the property "urlRoot" point to the service case.ss', function () {
				expect(model.urlRoot).toEqual('services/case.ss');				
			});
		});		

		describe('Case Router', function()
		{
			var router = new Router()
			,	fake_routes = {
					'cases': 'showCasesList'
				,	'cases?:options': 'showCasesList'
				,	'cases/:id': 'showCase'
				,	'newcase': 'createNewCase'
			};

			it('should have public properties', function ()
			{
				expect(router.routes).toBeDefined();
				expect(router.initialize).toBeDefined();
				expect(router.showCase).toBeDefined();
				expect(router.showCasesList).toBeDefined();
				expect(router.createNewCase).toBeDefined();
			});
		
			it('should have defined the property "routes"', function () {
				expect(router.routes).toEqual(fake_routes);
			});
		});

		describe('Case List View', function()
		{
			var fake_options = { 
					application: {
					}
				}			
			,	fake_atributes = {
					'class': 'caseManagement'
				}
			,	fake_cases_collection = new Collection()
			,	view = new ListView({
					options: fake_options
				,	collection: fake_cases_collection
				});

			it('should have public properties', function ()
			{
				expect(view.template).toBeDefined();
				expect(view.title).toBeDefined();
				expect(view.page_header).toBeDefined();
				expect(view.attributes).toBeDefined();
			});

			it('should have the property "template" defined as "case_list"', function () {
				expect(view.template).toEqual('case_list');
			});

			it('should have defined the property "attributes"', function () {
				expect(view.attributes).toEqual(fake_atributes);
			});

			var router = null
			,	mocked_view = null
			,	fake_layout = {
					currentView: null
				}
			,	fake_application = {
					CaseModule: {
						Views: {}
					}
				,	getLayout: function()
					{
						return fake_layout;
					}
				};

			beforeEach(function ()
			{				
				router = new Case.Router();
				router.application = fake_application;
				mocked_view = {
					showContent: function () {}
				};

				fake_application.CaseModule.Views.CaseList = function (options)
				{
					mocked_view.collection = options.collection;

					return mocked_view;
				};
			});

			it('initializes the list view and shows it', function ()
			{
				jasmine.Ajax.withMock(function ()
				{
					spyOn(fake_application.CaseModule.Views, 'CaseList').andCallThrough();
					spyOn(mocked_view, 'showContent');

					router.showCasesList();

					jasmine.Ajax.requests.mostRecent().response({
						status: 200
					,	responseText: JSON.stringify({})
					});

					expect(fake_application.CaseModule.Views.CaseList.calls.length).toBe(1);
					expect(mocked_view.showContent.calls.length).toBe(1);
				});
			});

			it('showsContent again on collection reset', function ()
			{
				jasmine.Ajax.withMock(function ()
				{
					spyOn(fake_application.CaseModule.Views, 'CaseList').andCallThrough();
					spyOn(mocked_view, 'showContent');

					router.showCasesList();

					jasmine.Ajax.requests.mostRecent().response({
						status: 200
					,	responseText: JSON.stringify({})
					});

					expect(mocked_view.showContent.calls.length).toBe(1);
					mocked_view.collection.trigger('reset');
					expect(mocked_view.showContent.calls.length).toBe(1);
				});					
			});
		});

		describe('Case Create View', function()
		{
			var fake_application = {
					getUser: function()
					{
						return 'fake_user';
					}
				,	CaseModule: {
						Views: {}
					}
				}
			,	fake_options = { 
				application: fake_application
			,	model: new Model()
			}			
			,	fake_atributes = {
					'class': 'newCase'
				}
			,	fake_events = {
					'submit form': 'saveForm'
				,	'keypress [type="text"]': 'preventEnter'
				,	'click input[name="include_email"]': 'includeAnotherEmail'
				}
			,	view = new CreateView(fake_options);

			it('should have public properties', function ()
			{
				expect(view.template).toBeDefined();
				expect(view.title).toBeDefined();
				expect(view.page_header).toBeDefined();
				expect(view.attributes).toBeDefined();
				expect(view.events).toBeDefined();
			});

			it('should have the property "template" defined as "case_new"', function () {
				expect(view.template).toEqual('case_new');
			});

			it('should have defined the property "attributes"', function () {
				expect(view.attributes).toEqual(fake_atributes);
			});

			it('should have defined the property "events"', function () {
				expect(view.events).toEqual(fake_events);
			});

			var router = null
			,	mocked_view = null;
			
			beforeEach(function ()
			{				
				router = new Case.Router();
				router.application = fake_application;
				mocked_view = {
					showContent: function () {}
				};

				fake_application.CaseModule.Views.NewCase = function (options)
				{
					return mocked_view;
				};
			});

			it('shows the create case view', function ()
			{
				jasmine.Ajax.withMock(function ()
				{
					spyOn(fake_application.CaseModule.Views, 'NewCase').andCallThrough();
					spyOn(mocked_view, 'showContent');

					router.createNewCase();

					jasmine.Ajax.requests.mostRecent().response({
						status: 200
					,	responseText: JSON.stringify({})
					});

					expect(fake_application.CaseModule.Views.NewCase.calls.length).toBe(1);
					expect(mocked_view.showContent.calls.length).toBe(1);
				});				
			});
		});

		describe('Case Detail View', function()
		{
			var fake_application = {
					getUser: function()
					{
						return 'fake_user';
					}
				,	CaseModule: {
						Views: {}
					}
				}		
			,	fake_options = { 
					application: fake_application
				}		
			,	fake_atributes = {
					'class': 'caseDetail'
				}
			,	fake_events = {
					'submit form': 'customSaveForm'
				,	'click [data-action="reset"]': 'resetForm'
				,	'click [data-action="close-case"]': 'closeCase'
				,	'keypress [type="text"]': 'preventEnter'
				}
			,	view = new DetailView(fake_options);

			it('should have public properties', function ()
			{
				expect(view.template).toBeDefined();
				expect(view.attributes).toBeDefined();
				expect(view.events).toBeDefined();
			});

			it('should have the property "template" defined as "case_detail"', function () {
				expect(view.template).toEqual('case_detail');
			});

			it('should have defined the property "attributes"', function () {
				expect(view.attributes).toEqual(fake_atributes);
			});

			it('should have defined the property "events"', function () {
				expect(view.events).toEqual(fake_events);
			});

			var router = null
			,	mocked_view = null;
			
			beforeEach(function ()
			{				
				router = new Case.Router();
				router.application = fake_application;
				mocked_view = {
					showContent: function () {}
				};

				fake_application.CaseModule.Views.CaseDetail = function (options)
				{
					return mocked_view;
				};
			});

			it('shows the details view on model fetch', function ()
			{
				jasmine.Ajax.withMock(function ()
				{
					spyOn(fake_application.CaseModule.Views, 'CaseDetail').andCallThrough();
					spyOn(mocked_view, 'showContent');

					router.showCase();

					jasmine.Ajax.requests.mostRecent().response({
						status: 200
					,	responseText: JSON.stringify({})
					});

					expect(fake_application.CaseModule.Views.CaseDetail.calls.length).toBe(1);
				});				
			});
		});
	});
});