// ReturnAuthorization.Views.js
// -----------------------
define('ReturnAuthorization.Views'
,	['ReturnAuthorization.Views.List', 'ReturnAuthorization.Views.Detail', 'ReturnAuthorization.Views.Form', 'ReturnAuthorization.Views.Confirmation', 'ReturnAuthorization.Views.Cancel']
,	function (List, Detail, Form, Confirmation, Cancel)
{
	'use strict';

	return {
		List: List
	,	Detail: Detail
	,	Form: Form
	,	Confirmation: Confirmation
	,	Cancel: Cancel
	};
});
