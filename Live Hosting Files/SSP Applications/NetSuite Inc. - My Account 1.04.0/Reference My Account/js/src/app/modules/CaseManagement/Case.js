// Case.js
// -----------------
// Defines the Case module. (Model, Views, Router)
define('Case', 
['CaseDetail.View', 'Case.Collection','Case.Model', 'Case.Router', 'CaseCreate.View', 'CaseList.View'],
function (CaseDetailView, CaseCollection, CaseModel, CaseRouter, CaseCreateView, CaseList) 
{
	'use strict';

	var case_menuitems = function (application) 
	{
		if (!application.CaseModule.isEnabled())
		{
			return undefined;
		}

		return {
			id: function ()
			{
				return 'cases';				
			}

		,	name: function ()
			{
				return _('Cases').translate();
			}

		,	index: 5

		,	children: function () 
			{
				var items = [
					{
						parent: 'cases'
					,	id: 'cases_all'
					,	name: _('All My Cases').translate()
					,	url: 'cases'
					,	index: 1
					}

				,	{
						parent: 'cases'
					,	id: 'newcase'
					,	name: _('Submit New Case').translate()
					,	url: 'newcase'
					,	index: 2
					}
				];
				
				return items;
			}

		,	permission: 'lists.listCase.1'
		};
	};

	// Encapsulate all Case elements into a single module to be mounted to the application
	// Update: Keep the application reference within the function once its mounted into the application
	var CaseModule = function() {
		
		var app = {};
		
		var views = {
				CaseDetail: CaseDetailView
			,	NewCase: CaseCreateView
			,	CaseList: CaseList
			}

		,	models = {
				Case: CaseModel
			}

		,	collections = {
				Case: CaseCollection			
			};

		// Is Case functionality available for this application?
		var isCaseManagementEnabled = function () 
		{
			var application = app;

			return application.getConfig('cases.config') !== undefined && SC.ENVIRONMENT.CASES.enabled;
		};

		var mountToApp = function (application)
		{
			app = application;
			application.CaseModule = CaseModule;

			// always start our router.
			return new CaseRouter(application);
		};

		return {
			Views : views
		,	Models: models
		,	Collections: collections
		,	Router: CaseRouter
		,	isEnabled: isCaseManagementEnabled
		,	mountToApp: mountToApp
		,	MenuItems: case_menuitems
		};
	}();

	return CaseModule;
});