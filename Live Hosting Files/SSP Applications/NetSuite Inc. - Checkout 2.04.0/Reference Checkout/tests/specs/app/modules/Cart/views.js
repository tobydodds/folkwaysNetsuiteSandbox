// Cart.js
// --------------------
// Testing Cart module.
define(['Cart.Views', 'Application','SC.ENVIRONMENT', 'jasmineTypeCheck'], function (CartViews)
{
	
	'use strict';
	
	describe('Module: Cart.Views', function () {
		
		var is_started = false
		,	application;

		beforeEach(function ()
		{
			if (!is_started)
			{
				// Here is the appliaction we will be using for this tests
				application = SC.Application('CartViews');

				// Starts the application
				jQuery(application.start(function () { is_started = true; }));
				// Makes sure the application is started before 
				waitsFor(function() { return is_started; });
			}
		});
		
		afterEach(function()
		{
			delete SC._applications.CartViews; 
		});

		it('#1: CartViews.Detailed not to be undefined', function() {
			expect(CartViews.Detailed).not.toBe(undefined);
		});

		it('#2: CartViews.Confirmation not to be undefined', function() {
			expect(CartViews.Confirmation).not.toBe(undefined);
		});

		it('#1: CartViews.Detailed to be Function', function() {
			expect(CartViews.Detailed).toBeA(Function);
		});

		it('#2: CartViews.Confirmation to be Function', function() {
			expect(CartViews.Confirmation).toBeA(Function);
		});


	});

});