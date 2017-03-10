define(['Merchandising.jQueryPlugin'], function ()
{
	'use strict';

	return describe('Merchandising.jQueryPlugin', function ()
	{
		it('adds `merchandisingZone` as a jQuery method', function ()
		{
			expect('merchandisingZone' in jQuery()).toBe(true);
		});
	});
});