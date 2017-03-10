// CaseFields.Model.js 
// -----------------------
// Model for handling Support Cases Fields
define('CaseFields.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({

		urlRoot: _.getAbsoluteUrl('services/case-fields.ss')
	});
});