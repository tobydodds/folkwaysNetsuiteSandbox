// PlacedOrder.js
// -----------------
// Defines the PlacedOrder  module (Model, Collection, Views, Router)
define('PlacedOrder', ['PlacedOrder.Model','PlacedOrder.Collection'], function (Model,  Collection)
{
	'use strict';
	
	return	{
		Model: Model
	,	Collection: Collection
	};
});