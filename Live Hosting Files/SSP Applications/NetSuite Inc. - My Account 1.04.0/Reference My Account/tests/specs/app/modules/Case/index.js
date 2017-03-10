/*jshint laxcomma:true*/
SC = {
	ENVIRONMENT: {
		customer_internalid: '13', companyId: '2', siteSettings: {siteid: '22'}
	}
,	templates: {macros: {}}
};
specs = [
	'tests/specs/app/modules/Case/module'
];

require(['Case.Collection', 'jasmineAjax']);