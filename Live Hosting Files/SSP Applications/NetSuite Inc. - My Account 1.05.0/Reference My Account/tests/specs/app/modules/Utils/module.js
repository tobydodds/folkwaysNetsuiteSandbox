// Utils.js
// --------------------
// Testing Utils.js and functions of _.
define(['Utils', 'jasmineTypeCheck'], function ()
{

	'use strict';

	describe('SC.Utils', function () {

		it('#1 it should profivde a translate method', function ()
		{
			expect(_.translate).toBeA(Function);
		});

		it('#2 it should profivde a formatPhone method', function ()
		{
			expect(_.formatPhone).toBeA(Function);
		});

		it('#3 it should profivde a formatCurrency method', function ()
		{
			expect(_.formatCurrency).toBeA(Function);
		});

		it('#4 it should profivde a validatePhone method', function ()
		{
			expect(_.validatePhone).toBeA(Function);
		});

		it('#5 it should profivde a collectionToString method', function ()
		{
			expect(_.collectionToString).toBeA(Function);
		});

		it('#6 it should profivde a addParamsToUrl method', function ()
		{
			expect(_.addParamsToUrl).toBeA(Function);
		});

	});

	describe('SC.Utils.translate', function () {

		it('#1 it should echo it\'s input if no translations found', function ()
		{
			expect(_('A text').translate()).toBe('A text');
		});

		it('#2 it should return a translated string if a translation map is precent in SC.Translations', function ()
		{
			SC.Translations = {'A text': 'Un Texto'};
			expect(_('A text').translate()).toBe('Un Texto');
		});

		it('#3 it should be able to mix in variables if configured to do so', function ()
		{
			expect(_('This is a $(0)').translate('Test')).toBe('This is a Test');
		});

		it('#4 it should be able to translate texts with mix in variables if configured to do so', function ()
		{
			SC.Translations = {'This is a $(0)': 'Esto es un $(0)'};
			expect(_('This is a $(0)').translate('Test')).toBe('Esto es un Test');
		});

		it('#5 it should let me configure the position of the mixin in the text', function ()
		{
			expect(_('$(1) -> $(0)').translate('Test1', 'Test2')).toBe('Test2 -> Test1');
		});

		it('#6 it should let me configure the position of the mixin to be different in a translation than the original', function ()
		{
			SC.Translations = {'$(1) -> $(0)': '$(0) -> $(1)'};
			expect(_('$(1) -> $(0)').translate('Test1', 'Test2')).toBe('Test1 -> Test2');
		});
		it('#7 it should return an empty string if param falsy', function ()
		{
			expect(_('').translate()).toBe('');
			expect(_(0).translate()).toBe('');
			expect(_(false).translate()).toBe('');
			expect(_(undefined).translate()).toBe('');
			expect(_(null).translate()).toBe('');
		});
	});

	describe('SC.Utils.dateToString', function ()
	{
		it ('should return a date in basic string format', function()
		{
			expect(_.dateToString(new Date(2014, 8, 7))).toEqual('2014-09-07');
			expect(_.dateToString(new Date(2000, 10, 7))).toEqual('2000-11-07');
			expect(_.dateToString(new Date(2014, 8, 12))).toEqual('2014-09-12');
			expect(_.dateToString(new Date(2014, 9, 13))).toEqual('2014-10-13');
		});
	});

	describe('SC.Utils.isDateValid', function ()
	{
		it('should return false if pass a number', function()
		{
			expect(_.isDateValid(2014)).toBeFalsy();
		});

		it('should return false if pass a string', function()
		{
			expect(_.isDateValid('2014-12-20')).toBeFalsy();
		});

		it('should return false if pass undefined', function()
		{
			expect(_.isDateValid()).toBeFalsy();
		});

		it('should return false if pass a bool', function()
		{
			expect(_.isDateValid(false)).toBeFalsy();
			expect(_.isDateValid(true)).toBeFalsy();
		});

		it('should return true if pass a date object in valid state', function()
		{
			expect(_.isDateValid(new Date())).toBeTruthy();
		});

		it('should return false if pass a date object in invalid state', function()
		{
			expect(_.isDateValid(new Date('pollitos verdes'))).toBeFalsy();
		});
	});

	describe('SC.Utils.formatPhone', function () {


		it('#1 it should echo the input if no format is defined', function ()
		{
			expect(_.formatPhone('A text')).toBe('A text');
		});

		it('#2 it should format a phone number for a given format', function ()
		{
			expect(_.formatPhone('0987654321', '(123) 456-7890')).toBe('(098) 765-4321');
		});

		it('#3 it should support different formats', function ()
		{
			expect(_.formatPhone('0987654321', '(123) 456-7890')).toBe('(098) 765-4321');
			expect(_.formatPhone('0987654321', '123 456 7890')).toBe('098 765 4321');
			expect(_.formatPhone('0987654321', '123-456-7890')).toBe('098-765-4321');
			expect(_.formatPhone('0987654321', '123.456.7890')).toBe('098.765.4321');
		});

		it('#4 it should support different input lengths for a given format', function ()
		{
			expect(_.formatPhone('110987654321', '(123) 456-7890')).toBe('110987654321');
			expect(_.formatPhone('10987654321', '(123) 456-7890')).toBe('1 (098) 765-4321');
			expect(_.formatPhone('987654321', '(123) 456-7890')).toBe('987654321');
			expect(_.formatPhone('87654321', '(123) 456-7890')).toBe('87654321');
			expect(_.formatPhone('7654321', '(123) 456-7890')).toBe('765-4321');
			expect(_.formatPhone('654321', '(123) 456-7890')).toBe('654321');
		});

		it('#5 it should support common extentions number notations', function ()
		{
			expect(_.formatPhone('0987654321 Ext: 100', '(123) 456-7890')).toBe('(098) 765-4321 Ext: 100');
			expect(_.formatPhone('0987654321 Ex: 100', '(123) 456-7890')).toBe('(098) 765-4321 Ex: 100');
			expect(_.formatPhone('0987654321 #100', '(123) 456-7890')).toBe('(098) 765-4321 #100');
		});

		/* WILL CHANGE */
		/*
		it('#6 it should use the format in the SiteSettings Model if no format is provided directly', function ()
		{
			_.setDefaultPhoneFormat('(123) 456-7890');
			expect(_.formatPhone('0987654321 Ext: 100')).toBe('(098) 765-4321 Ext: 100');
		});

		it('#7 it should ignore the format in the SiteSettings Model if format is provided directly', function ()
		{
			_.setDefaultPhoneFormat('(123) 456-7890');
			expect(_.formatPhone('0987654321 Ext: 100', '123-456-7890')).not.toBe('(098) 765-4321 Ext: 100');
		});
		*/
		/* END WILL CHANGE */

	});

	describe('SC.Utils.validatePhone', function () {

		it('#1 it should echo Phone Number is invalid if the value is numeric and length < 7', function ()
		{
			expect(_.validatePhone('123456')).toBe('Phone Number is invalid');
		});

		it('#2 it should echo Phone Number is invalid if the value is not numeric and length > 7', function ()
		{
			expect(_.validatePhone('1234567abc')).toBe('Phone Number is invalid');
		});

		it('#3 it should echo Phone Number is invalid if the value is numeric and length >= 7, but 6 numbers and one or more spaces', function ()
		{
			expect(_.validatePhone('12345 6')).toBe('Phone Number is invalid');
		});

		it('#4 it should no return if the value is numeric and length > 7', function ()
		{
			expect(_.validatePhone('1234567')).not.toBeDefined();
		});
		it('#5 it should no return if the value is a number and length > 7', function ()
		{
			expect(_.validatePhone(1234567)).not.toBeDefined();
		});
		it('#6 it should no return if the value is a number and length <= 7', function ()
		{
			expect(_.validatePhone(1234)).toBe('Phone Number is invalid');
			expect(_.validatePhone(123456)).toBe('Phone Number is invalid');
		});
		it('#7 it should behave correctly with leading zeros', function ()
		{
			expect(_.validatePhone('0123456')).toBe('Phone Number is invalid');
			expect(_.validatePhone('01234567')).not.toBeDefined();
		});
		it('#7 it should invalidate with invalid input', function ()
		{
			expect(_.validatePhone(null)).toBe('Phone is required');
			expect(_.validatePhone('')).toBe('Phone is required');
		});
	});

	describe('SC.Utils.formatCurrency', function () {



		it('#1 it should return a formated version of number', function ()
		{
			expect(_.formatCurrency(10)).toBe('$10.00');
		});

		it('#2 it should round decimal numbers', function ()
		{
			expect(_.formatCurrency(10 / 3)).toBe('$3.33');
		});

		it('#3 it should allow me to pass in the Symbol', function ()
		{
			expect(_.formatCurrency(10, '£')).toBe('£10.00');
		});
		/* WILL CHANGE */
		/*
		it('#4 it should use the Symbol in the SiteSettings Model if present', function ()
		{
			_.setDefaultCurrencySymbol('£');
			expect(_.formatCurrency(10)).toBe('£10.00');
		});

		it('#5 it should ignore the Symbol in the SiteSettings Model if passed directly', function ()
		{
			_.setDefaultCurrencySymbol('€');
			expect(_.formatCurrency(10, '¥')).toBe('¥10.00');
		});
		*/
		/* END WILL CHANGE */
	});

	describe('SC.Utils.collectionToString', function () {

		var getValue = function (sort)
		{
			return sort.field + ':' + sort.dir;
		};

		it('#1 it should return a string', function ()
		{
			expect(_.collectionToString({collection:[{field: 'price', dir: 'desc'}], getValue: getValue, joinWith: ','})).toBe('price:desc');
		});

		it('#2 it should return a string', function ()
		{
			expect(_.collectionToString({collection:[{field: 'price',dir: 'desc'},{field: 'created',dir: 'asc'}], getValue:getValue, joinWith:','})).toBe('price:desc,created:asc');
		});

		it('#3 it should return an empty string', function ()
		{
			expect(_.collectionToString({collection:[], getValue:getValue, joinWith:','})).toBe('');
		});

		it('#4 it should return an empty string', function ()
		{
			expect(_.collectionToString({collection:null, getValue:getValue, joinWith:','})).toBe('');
		});
	});


	describe('SC.Utils.addParamsToUrl', function ()
	{
		var config = {
			include: 'facets'
		,	fieldset: 'search'
		};

		it('#1 adding parameters to url without parameters', function ()
		{
			var baseUrl = '/api/items';
			var baseUrlWithParams = _.addParamsToUrl(baseUrl, config);
			expect(baseUrlWithParams).toBe('/api/items?include=facets&fieldset=search');
		});

		it('#2 adding parameters to url with parameters', function ()
		{
			var baseUrl = '/api/items?test=value';
			var baseUrlWithParams = _.addParamsToUrl(baseUrl, config);
			expect(baseUrlWithParams).toBe('/api/items?test=value&include=facets&fieldset=search');
		});

		it('#3 empty parameters should not change the url', function ()
		{
			// arrange
			var empty_config = {}
			,	base_url1 = '/api/items?test=value'
			,	base_url2 = '/api/items';

			// act
			var result1 = _.addParamsToUrl(base_url1, empty_config)
			,	result2 = _.addParamsToUrl(base_url2, empty_config);

			// assert
			expect(result1).toEqual(result1);
			expect(result2).toEqual(result2);
		});
	});


	describe('SC.Utils.parseUrlOptions', function ()
	{
		it('#1 parseUrlOptions should be able to parse url options from absolute url', function ()
		{
			var completeUrl = 'https://checkout.netsuite.com/c.3690872/checkout/index.ssp?is=login&n=3&login=T&c=12345#login-register'
			,	options = _.parseUrlOptions(completeUrl);

			expect(options.is).toBe('login');
			expect(options.n).toBe('3');
			expect(options.login).toBe('T');
			expect(options.c).toBe('12345');
		});

		it('#2 parseUrlOptions should be able to parse url options from relative url', function ()
		{
			var completeUrl = 'api/items?c=123123&n=3&fieldset=search#somehash'
			,	options = _.parseUrlOptions(completeUrl);

			expect(options.n).toBe('3');
			expect(options.fieldset).toBe('search');
			expect(options.c).toBe('123123');
		});

		it('#3 parseUrlOptions should return empty object for empty input', function ()
		{
			var options = _.parseUrlOptions(null);
			expect(options).toEqual({});
		});
	});

	describe('SC.Utils.stringToDate', function ()
	{
		it('it should parse the string correctly in default format', function ()
		{
			var d = _.stringToDate('2014-09-19');
			expect(d.getDate()).toBe(19);
			expect(d.getMonth()).toBe(8); //Months start at 0
			expect(d.getFullYear()).toBe(2014);

			d = _.stringToDate('2014-12-31');
			expect(d.getDate()).toBe(31);
			expect(d.getMonth()).toBe(11); //Months start at 0
			expect(d.getFullYear()).toBe(2014);

			d = _.stringToDate('2014-13-31');
			expect(d).toBe(undefined); // This should fail as it contains invalid month

			// Testing leap years
			d = _.stringToDate('2014-2-29');
			expect(d).toBe(undefined);
			// Testing leap years
			d = _.stringToDate('2016-2-29');
			expect(d.getDate()).toBe(29);
			expect(d.getMonth()).toBe(1); //Months start at 0
			expect(d.getFullYear()).toBe(2016);
		});

		it('it should parse the string correctly in given format', function ()
		{
			var d = _.stringToDate('19-09-2014',{format:'dd-MM-YYYY'});
			expect(d.getDate()).toBe(19);
			expect(d.getMonth()).toBe(8); //Months start at 0
			expect(d.getFullYear()).toBe(2014);

			d = _.stringToDate('31-12-2014',{format:'dd-MM-YYYY'});
			expect(d.getDate()).toBe(31);
			expect(d.getMonth()).toBe(11); //Months start at 0
			expect(d.getFullYear()).toBe(2014);

			d = _.stringToDate('31-13-2014',{format:'dd-MM-YYYY'});
			expect(d).toBe(undefined); // This should fail as it contains invalid month

			// Testing leap years
			d = _.stringToDate('29-2-2014',{format:'dd-MM-YYYY'});
			expect(d).toBe(undefined);
			// Testing leap years
			d = _.stringToDate('29-2-2016',{format:'dd-MM-YYYY'});
			expect(d.getDate()).toBe(29);
			expect(d.getMonth()).toBe(1); //Months start at 0
			expect(d.getFullYear()).toBe(2016);
		});

		it('it should not parse dates with a different separator (/)', function ()
		{
			var d = _.stringToDate('19/09/2014',{format:'dd/MM/YYYY'});
			expect(d).toBe(undefined);
		});
	});

	describe('SC.Utils.paymenthodIdCreditCart', function ()
	{
		it('it should not parse unlisted payment methods regardless of card', function ()
		{
			//VISA
			expect(_.paymenthodIdCreditCart('4111111111111')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('4111111111111222')).toBe(undefined);
			//Master card
			expect(_.paymenthodIdCreditCart('5112345678901234')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5599999999999999')).toBe(undefined);
			//American express
			expect(_.paymenthodIdCreditCart('340000000000000')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('379999999999999')).toBe(undefined);
			//Discover
			expect(_.paymenthodIdCreditCart('6011123456789012')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6509123456789012')).toBe(undefined);
			//Maestro
			expect(_.paymenthodIdCreditCart('501201234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('560901234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('574501234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('587701234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('630401234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('639001234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('670901234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('679001234567')).toBe(undefined);

			expect(_.paymenthodIdCreditCart('5012012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5609012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5745012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5877012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6304012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6390012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6709012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6790012345671234567')).toBe(undefined);

			//Other invalid types
			expect(_.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);

			expect(_.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);


		});

		it('it should correctly recognize VISA cards', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [{name:'VISA',internalid:1}];
			//VISA
			expect(_.paymenthodIdCreditCart('4111111111111')).toBe(1);
			expect(_.paymenthodIdCreditCart('4111111111111222')).toBe(1);
			//Master card
			expect(_.paymenthodIdCreditCart('5112345678901234')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5599999999999999')).toBe(undefined);
			//American express
			expect(_.paymenthodIdCreditCart('340000000000000')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('379999999999999')).toBe(undefined);
			//Discover
			expect(_.paymenthodIdCreditCart('6011123456789012')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6509123456789012')).toBe(undefined);
			//Maestro
			expect(_.paymenthodIdCreditCart('501201234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('560901234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('574501234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('587701234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('630401234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('639001234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('670901234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('679001234567')).toBe(undefined);

			expect(_.paymenthodIdCreditCart('5012012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5609012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5745012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5877012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6304012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6390012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6709012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6790012345671234567')).toBe(undefined);

			//Other invalid types
			expect(_.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);

			expect(_.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);
		});

		it('it should correctly recognize Master card cards', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [{name:'Master Card',internalid:2}];
			//VISA
			expect(_.paymenthodIdCreditCart('4111111111111')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('4111111111111222')).toBe(undefined);
			//Master card
			expect(_.paymenthodIdCreditCart('5112345678901234')).toBe(2);
			expect(_.paymenthodIdCreditCart('5599999999999999')).toBe(2);
			//American express
			expect(_.paymenthodIdCreditCart('340000000000000')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('379999999999999')).toBe(undefined);
			//Discover
			expect(_.paymenthodIdCreditCart('6011123456789012')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6509123456789012')).toBe(undefined);
			//Maestro
			expect(_.paymenthodIdCreditCart('501201234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('560901234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('574501234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('587701234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('630401234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('639001234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('670901234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('679001234567')).toBe(undefined);

			expect(_.paymenthodIdCreditCart('5012012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5609012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5745012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5877012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6304012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6390012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6709012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6790012345671234567')).toBe(undefined);

			//Other invalid types
			expect(_.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);

			expect(_.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);
		});

		it('it should correctly recognize American Express cards', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [{name:'American Express',internalid:3}];
			//VISA
			expect(_.paymenthodIdCreditCart('4111111111111')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('4111111111111222')).toBe(undefined);
			//Master card
			expect(_.paymenthodIdCreditCart('5112345678901234')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5599999999999999')).toBe(undefined);
			//American express
			expect(_.paymenthodIdCreditCart('340000000000000')).toBe(3);
			expect(_.paymenthodIdCreditCart('379999999999999')).toBe(3);
			//Discover
			expect(_.paymenthodIdCreditCart('6011123456789012')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6509123456789012')).toBe(undefined);
			//Maestro
			expect(_.paymenthodIdCreditCart('501201234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('560901234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('574501234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('587701234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('630401234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('639001234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('670901234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('679001234567')).toBe(undefined);

			expect(_.paymenthodIdCreditCart('5012012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5609012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5745012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5877012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6304012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6390012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6709012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6790012345671234567')).toBe(undefined);

			//Other invalid types
			expect(_.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);

			expect(_.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);
		});

		it('it should correctly recognize Discover cards', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [{name:'Discover',internalid:4}];
			//VISA
			expect(_.paymenthodIdCreditCart('4111111111111')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('4111111111111222')).toBe(undefined);
			//Master card
			expect(_.paymenthodIdCreditCart('5112345678901234')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5599999999999999')).toBe(undefined);
			//American express
			expect(_.paymenthodIdCreditCart('340000000000000')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('379999999999999')).toBe(undefined);
			//Discover
			expect(_.paymenthodIdCreditCart('6011123456789012')).toBe(4);
			expect(_.paymenthodIdCreditCart('6509123456789012')).toBe(4);
			//Maestro
			expect(_.paymenthodIdCreditCart('501201234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('560901234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('574501234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('587701234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('630401234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('639001234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('670901234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('679001234567')).toBe(undefined);

			expect(_.paymenthodIdCreditCart('5012012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5609012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5745012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5877012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6304012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6390012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6709012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6790012345671234567')).toBe(undefined);

			//Other invalid types
			expect(_.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);

			expect(_.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);
		});

		it('it should correctly recognize Maestro cards', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [{name:'Maestro',internalid:5}];
			//VISA
			expect(_.paymenthodIdCreditCart('4111111111111')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('4111111111111222')).toBe(undefined);
			//Master card
			expect(_.paymenthodIdCreditCart('5112345678901234')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5599999999999999')).toBe(undefined);
			//American express
			expect(_.paymenthodIdCreditCart('340000000000000')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('379999999999999')).toBe(undefined);
			//Discover
			expect(_.paymenthodIdCreditCart('6011123456789012')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6509123456789012')).toBe(undefined);
			//Maestro
			expect(_.paymenthodIdCreditCart('501201234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('560901234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('574501234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('587701234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('630401234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('639001234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('670901234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('679001234567')).toBe(5);

			expect(_.paymenthodIdCreditCart('5012012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('5609012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('5745012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('5877012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('6304012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('6390012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('6709012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('6790012345671234567')).toBe(5);

			//Other invalid types
			expect(_.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);

			expect(_.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);
		});

		it('it should correctly recognize all cards', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [	{name:'VISA',internalid:1}
														,	{name:'Master Card',internalid:2}
														,	{name:'American Express',internalid:3}
														,	{name:'Discover',internalid:4}
														,	{name:'Maestro',internalid:5}];
			//VISA
			expect(_.paymenthodIdCreditCart('4111111111111')).toBe(1);
			expect(_.paymenthodIdCreditCart('4111111111111222')).toBe(1);
			//Master card
			expect(_.paymenthodIdCreditCart('5112345678901234')).toBe(2);
			expect(_.paymenthodIdCreditCart('5599999999999999')).toBe(2);
			//American express
			expect(_.paymenthodIdCreditCart('340000000000000')).toBe(3);
			expect(_.paymenthodIdCreditCart('379999999999999')).toBe(3);
			//Discover
			expect(_.paymenthodIdCreditCart('6011123456789012')).toBe(4);
			expect(_.paymenthodIdCreditCart('6509123456789012')).toBe(4);
			//Maestro
			expect(_.paymenthodIdCreditCart('501201234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('560901234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('574501234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('587701234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('630401234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('639001234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('670901234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('679001234567')).toBe(5);

			expect(_.paymenthodIdCreditCart('5012012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('5609012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('5745012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('5877012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('6304012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('6390012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('6709012345671234567')).toBe(5);
			expect(_.paymenthodIdCreditCart('6790012345671234567')).toBe(5);

			//Other invalid types
			expect(_.paymenthodIdCreditCart('41111111111115')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('411111111111122')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5912345678901234')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('310000000000000')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('329999999999999')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6111123456789012')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6409123456789012')).toBe(undefined);


			expect(_.paymenthodIdCreditCart('5112012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5209012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5945012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('5577012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6314012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6350012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6809012345671234567')).toBe(undefined);
			expect(_.paymenthodIdCreditCart('6290012345671234567')).toBe(undefined);
		});

		it('it should correctly not recognize invalid input', function(){
			SC.ENVIRONMENT.siteSettings.paymentmethods = [	{name:'VISA',internalid:1}
														,	{name:'Master Card',internalid:2}
														,	{name:'American Express',internalid:3}
														,	{name:'Discover',internalid:4}
														,	{name:'Maestro',internalid:5}];

			expect(_.paymenthodIdCreditCart(null)).toBe(undefined);
			expect(_.paymenthodIdCreditCart(1234567891234)).toBe(undefined);
			expect(_.paymenthodIdCreditCart({})).toBe(undefined);
			expect(_.paymenthodIdCreditCart([])).toBe(undefined);
		});
	});

	describe('SC.Utils.validateSecurityCode', function ()
	{
		it('it should validate security number correctly',function(){
			expect(_.validateSecurityCode('123')).toBe(undefined);
			expect(_.validateSecurityCode('4567')).toBe(undefined);
			expect(_.validateSecurityCode('000')).toBe(undefined);
		});

		it('it should validate security number correctly',function(){
			expect(_.validateSecurityCode(null).length).toBeGreaterThan(0);
			expect(_.validateSecurityCode({}).length).toBeGreaterThan(0);
			expect(_.validateSecurityCode([]).length).toBeGreaterThan(0);
			expect(_.validateSecurityCode('aaa').length).toBeGreaterThan(0);
			expect(_.validateSecurityCode('01234').length).toBeGreaterThan(0);
			expect(_.validateSecurityCode('01234345345').length).toBeGreaterThan(0);
			expect(_.validateSecurityCode('01').length).toBeGreaterThan(0);
		});
	});

	describe('SC.Utils.validateState', function ()
	{
		it('it should approve all states when no country states set',function(){
			expect(_.validateState(null,null,{country:'US'})).toBe(undefined);
			expect(_.validateState(0,null,{country:'US'})).toBe(undefined);
			expect(_.validateState('',null,{country:'US'})).toBe(undefined);
			expect(_.validateState('WA',null,{country:'US'})).toBe(undefined);
		});

		it('it should display an error if the country has states but the value is empty',function(){
			SC.ENVIRONMENT.siteSettings.countries = {'US':{states:[]}};
			expect(_.validateState(null,null,{country:'US'})).toBe(undefined);
			expect(_.validateState(0,null,{country:'US'})).toBe(undefined);
			expect(_.validateState('',null,{country:'US'})).toBe('State is required');
			expect(_.validateState('WA',null,{country:'US'})).toBe(undefined);
		});
	});

	describe('SC.Utils.validateZipcode', function ()
	{
		it('it should approve all zipcodes when no country states set',function(){
			expect(_.validateZipCode(null,null,{country:'US'})).toBe(undefined);
			expect(_.validateZipCode(0,null,{country:'US'})).toBe(undefined);
			expect(_.validateZipCode('',null,{country:'US'})).toBe(undefined);
			expect(_.validateZipCode('11800',null,{country:'US'})).toBe(undefined);
		});

		it('it should display an error if the country zipcode is required but the value is empty',function(){
			SC.ENVIRONMENT.siteSettings.countries = {'US':{isziprequired:'T'}};
			expect(_.validateZipCode(null,null,{country:'US'})).toBe('Zip Code is required');
			expect(_.validateZipCode(0,null,{country:'US'})).toBe('Zip Code is required');
			expect(_.validateZipCode('',null,{country:'US'})).toBe('Zip Code is required');
			expect(_.validateZipCode('WA',null,{country:'US'})).toBe(undefined);
		});
	});

	describe('SC.Utils.getFullPathForElement ', function ()
	{
		it('it should give full path for basic elements',function(){
			expect(_.getFullPathForElement(document.body)).toBe('HTML > BODY');
			expect(_.getFullPathForElement(document.head || document.getElementsByTagName('head')[0])).toBe('HTML > HEAD');
			expect(_.getFullPathForElement(document.documentElement)).toBe('HTML');
		});

		it('it should give full path for inserted elements',function(){
			var el = document.createElement('div');
			el.setAttribute('id','myDiv');
			var el2 = document.createElement('span');
			el.appendChild(el2);
			var el3 = document.createElement('ul');
			el2.appendChild(el3);
			document.body.appendChild(el);
			expect(_.getFullPathForElement(el)).toBe('#myDiv');
			expect(_.getFullPathForElement(el2)).toBe('#myDiv > SPAN:nth-child(1)');
			expect(_.getFullPathForElement(el3)).toBe('#myDiv > SPAN:nth-child(1) > UL:nth-child(1)');
		});
	});

	describe('SC.Utils.formatQuantity', function ()
	{
		it('it should correctly format a number string',function(){
			expect(_.formatQuantity('')).toBe('');
			expect(_.formatQuantity(null)).toBe('n,ull');
			expect(_.formatQuantity([])).toBe('');
			expect(_.formatQuantity('0')).toBe('0');
			expect(_.formatQuantity('12')).toBe('12');
			expect(_.formatQuantity('123')).toBe('123');
			expect(_.formatQuantity('1234')).toBe('1,234');
			expect(_.formatQuantity('1234.0')).toBe('1,234.0');
			expect(_.formatQuantity('1234.00')).toBe('1,234.00');
			expect(_.formatQuantity('01234.00')).toBe('01,234.00');
			expect(_.formatQuantity(0)).toBe('0');
			expect(_.formatQuantity(12)).toBe('12');
			expect(_.formatQuantity(123)).toBe('123');
			expect(_.formatQuantity(1234)).toBe('1,234');
			expect(_.formatQuantity(1234.0)).toBe('1,234');
			expect(_.formatQuantity(1234.00)).toBe('1,234');
			expect(_.formatQuantity(1234.1)).toBe('1,234.1');
			expect(_.formatQuantity(1234.15)).toBe('1,234.15');
		});
	});

	describe('SC.Utils.highlightKeyword', function ()
	{
		it('it should correctly highlight a keyword',function(){
			expect(_.highlightKeyword('dábale arroz a la zorra el abad',null)).toBe('dábale arroz a la zorra el abad');
			expect(_.highlightKeyword('dábale arroz a la zorra el abad','')).toBe('dábale arroz a la zorra el abad');
			expect(_.highlightKeyword('dábale arroz a la zorra el abad',0)).toBe('dábale arroz a la zorra el abad');
			expect(_.highlightKeyword('','arroz')).toBe('');
			expect(_.highlightKeyword(null,'arroz')).toBe('');
			expect(_.highlightKeyword('dábale arroz a la zorra el abad','arroz')).toBe('dábale <strong>arroz</strong> a la zorra el abad');
			expect(_.highlightKeyword('dábale arroz a la zorra el abad arroz','arroz')).toBe('dábale <strong>arroz</strong> a la zorra el abad <strong>arroz</strong>');
			expect(_.highlightKeyword('dábale arrozarroz a la zorra el abad arroz','arroz')).toBe('dábale <strong>arroz</strong><strong>arroz</strong> a la zorra el abad <strong>arroz</strong>');
		});
	});

	describe('SC.Utils.substitute', function ()
	{
		it('it should correctly perform text substitutions',function(){
			expect(_.substitute('',{'lorem':'lorem ipsum'})).toBe('');
			expect(_.substitute(null,{'lorem':'lorem ipsum'})).toBe('');
			expect(_.substitute('lorem ipsum dolor sit amet',{'lorem':'lorem ipsum'})).toBe('lorem ipsum dolor sit amet');
			expect(_.substitute('lorem ipsum dolor sit amet')).toBe('lorem ipsum dolor sit amet');
			expect(_.substitute('lorem ipsum dolor sit amet'),{}).toBe('lorem ipsum dolor sit amet');
			expect(_.substitute('{lorem} ipsum dolor sit amet',{'lorem':'lorem ipsum'})).toBe('lorem ipsum ipsum dolor sit amet');
			expect(_.substitute('{lorem} ipsum dolor sit amet',{'lorem':'{lorem} ipsum'})).toBe('{lorem} ipsum ipsum dolor sit amet');
			expect(_.substitute('{lorem} {ipsum} dolor sit amet',{'lorem':'lorem ipsum','ipsum':'ipsum dolor'})).toBe('lorem ipsum ipsum dolor dolor sit amet');
		});
	});

	describe('SC.Utils.objectToAtrributes', function ()
	{
		it('it should correctly display ellipsis animation',function(){
			expect(_.objectToAtrributes()).toBe('');
			expect(_.objectToAtrributes({})).toBe('');
			expect(_.objectToAtrributes({a:'a'})).toBe(' a="a"');
			expect(_.objectToAtrributes({a:1,b:2,c:{a:1}})).toBe(' a="1" b="2"  c-a="1"');
			expect(_.objectToAtrributes(null,'%')).toBe('');
			expect(_.objectToAtrributes({},'%')).toBe('');
			expect(_.objectToAtrributes({a:'a'},'%')).toBe(' %-a="a"');
			expect(_.objectToAtrributes({a:1,b:2,c:{a:1}},'%')).toBe(' %-a="1" %-b="2" %- c-a="1"');
			expect(_.objectToAtrributes({css:{color:'red'}})).toBe(' style="color:red;"');
		});
	});

	describe('SC.Utils.ellipsis', function ()
	{
		it('it should correctly display ellipsis animation',function(){
			var el = document.createElement('div');
			el.setAttribute('id','ellipsis');
			document.body.appendChild(el);
			_.ellipsis('#ellipsis');
			var values = ['', '.', '..', '...', '..', '.'];
			var i=0;
			var finished = false;
			var t = setInterval(function(){
				var $el = jQuery('#ellipsis');
				expect($el.html()).toBe(values[i++]);
				if(i === values.length){
					$el.remove();
					clearInterval(t);
					finished = true;
				}
			},250);
			waitsFor(function(){
				return finished;
			});
		});
	});

	describe('SC.Utils.getWindow',function(){
		it('it should return the window element',function(){
			expect(_.getWindow()).toBe(window);
		});
	});

	describe('SC.Utils.resizeImage',function(){
		it('it should resize images changing the url',function(){
			expect(_.resizeImage([{name:'small',urlsuffix:'_small'}],'img.jpg','big')).toBe('img.jpg');
			expect(_.resizeImage([],'img.jpg','big')).toBe('img.jpg');
			expect(_.resizeImage(null,'img.jpg','big')).toBe('img.jpg');
			expect(_.resizeImage([{name:'small',urlsuffix:'_small'},{name:'big',urlsuffix:'_big'}],'img.jpg','small')).toBe('img.jpg?_small');
			expect(_.resizeImage([{name:'small',urlsuffix:'_small'},{name:'big',urlsuffix:'_big'}],'img.jpg','big')).toBe('img.jpg?_big');
			expect(_.resizeImage([{name:'small',urlsuffix:'_small'},{name:'big',urlsuffix:'_big'}],'img.jpg?param=val','small')).toBe('img.jpg?param=val&_small');
			expect(_.resizeImage([{name:'small',urlsuffix:'_small'},{name:'big',urlsuffix:'_big'}],'img.jpg?param=val','big')).toBe('img.jpg?param=val&_big');

		});
	});

	describe('SC.Utils.getAbsoluteUrl',function(){
		it('it should correctly prepend the domain to form the absolute url',function(){
			expect(_.getAbsoluteUrl(null)).toBe(null);
			expect(_.getAbsoluteUrl('')).toBe('');
			expect(_.getAbsoluteUrl('/test/url')).toBe('/test/url');
			SC.ENVIRONMENT.baseUrl = 'http://netsuite.com';
			expect(_.getAbsoluteUrl(null)).toBe('http://netsuite.com');
			expect(_.getAbsoluteUrl('')).toBe('http://netsuite.com');
			expect(_.getAbsoluteUrl('/test/url')).toBe('http://netsuite.com');
			SC.ENVIRONMENT.baseUrl = 'http://netsuite.com{{file}}';
			expect(_.getAbsoluteUrl(null)).toBe('http://netsuite.com');
			expect(_.getAbsoluteUrl('')).toBe('http://netsuite.com');
			expect(_.getAbsoluteUrl('/test/url')).toBe('http://netsuite.com/test/url');
		});
	});

	describe('SC.Utils.getDownloadPdfUrl',function(){
		it('it should return the pdf download url',function(){
			SC.ENVIRONMENT.baseUrl = '/{{file}}';
			expect(_.getDownloadPdfUrl()).toBe('http://localhost/download.ssp?n=');
			expect(_.getDownloadPdfUrl({param1:2})).toBe('http://localhost/download.ssp?param1=2&n=');
			SC.ENVIRONMENT.siteSettings.siteid = 3;
			expect(_.getDownloadPdfUrl()).toBe('http://localhost/download.ssp?n=3');
			expect(_.getDownloadPdfUrl({param1:2})).toBe('http://localhost/download.ssp?param1=2&n=3');
		});
	});

	describe('SC.Utils.getPathFromObject',function(){
		it('it should return the value located at path in the object or the default if no path found',function(){
			expect(_.getPathFromObject()).toBe(undefined);
			expect(_.getPathFromObject(null,null,null)).toBe(null);

			var empty = {};
			var obj3 = {d:2};
			var obj2 = {b:1,c:obj3};
			var obj1 = {a:obj2};


			expect(_.getPathFromObject(empty,null)).toBe(empty);
			expect(_.getPathFromObject(empty,'')).toEqual(empty);
			expect(_.getPathFromObject(obj1,'a')).toBe(obj2);
			expect(_.getPathFromObject(obj1,'a.b')).toEqual(1);
			expect(_.getPathFromObject(obj1,'a.c')).toBe(obj3);
			expect(_.getPathFromObject(obj1,'a.c.d')).toEqual(2);
			expect(_.getPathFromObject(obj1,'x')).toBe(undefined);
			expect(_.getPathFromObject(obj1,'x','default')).toBe('default');
		});
	});

	describe('SC.Utils.reorderUrlParams',function(){
		it('it should correctly sort url parameters',function(){
			expect(_.reorderUrlParams('')).toBe('');
			expect(_.reorderUrlParams('http://netsuite.com')).toBe('http://netsuite.com');
			expect(_.reorderUrlParams('http://netsuite.com?z=1')).toBe('http://netsuite.com?z=1');
			expect(_.reorderUrlParams('http://netsuite.com?z=1&a=2')).toBe('http://netsuite.com?a=2&z=1');
			expect(_.reorderUrlParams('http://netsuite.com?z=1&t=20&a=2')).toBe('http://netsuite.com?a=2&t=20&z=1');
		});
	});

	describe('SC.Utils.getSessionParams', function ()
	{
		it('should be defined', function ()
		{
			expect(_.getSessionParams).toBeA(Function);
		});

		it('should return empty object if no session params', function ()
		{
			// arrange
			var url = 'http://netsuite.com?z=1&t=20&a=2'
			,	expected = {};

			// act
			var result = _.getSessionParams(url);

			// arrange
			expect(result).toEqual(expected);
		});

		it('should return object with ck and cktime defined', function ()
		{
			// arrange
			var url = 'http://netsuite.com?z=1&ck=12345abcdef&t=20&a=2&cktime=321'
			,	expected = '321';

			// act
			var result = _.getSessionParams(url);

			// arrange
			expect(result.ck).toEqual('12345abcdef');
			expect(result.cktime).toEqual(expected);
		});

	});

	describe('SC.Utils.getParameterByName', function ()
	{
		it('should be defined', function ()
		{
			expect(_.getParameterByName).toBeA(Function);
		});

		it('should be empty if no param by name', function ()
		{
			// arrange
			var url = 'http://netsuite.com?z=1&ck=12345abcdef&t=20&a=2&cktime=321'
			,	expected = '';

			// act
			var result = _.getParameterByName(url, 'anything');

			// assert
			expect(result).toEqual(expected);
		});

		it('should be param value if name matches', function ()
		{
			// arrange
			var url = 'http://netsuite.com?z=1&ck=12345abcdef&t=20&a=2&cktime=321'
			,	expected = '20';

			// act
			var result = _.getParameterByName(url, 't');

			// assert
			expect(result).toEqual(expected);
		});

	});
});
