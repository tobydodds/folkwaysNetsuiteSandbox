/*jshint laxcomma:true*/
define(['Address.Model'], function (AddressModel)
{
	'use strict';

	return describe('Address Model', function() {
		
		var model
		,	validation_model;

		beforeEach(function ()
		{
			model =  new AddressModel();
			validation_model = _.extend(model, Backbone.Validation.mixin);
		});

		describe('Validate',function() {
			it ('full name is required', function() {
				expect(validation_model.isValid('fullname')).toBe(false);
			});
			it ('and address 1 is required', function() {
				expect(validation_model.isValid('addr1')).toBe(false);
			});
			it ('and country is required', function() {
				expect(validation_model.isValid('country')).toBe(false);
			});
			it ('and city is required', function() {
				expect(validation_model.isValid('city')).toBe(false);
			});
			it ('and zip code is required', function() {
				expect(validation_model.isValid('zip')).toBe(false);
			});
			it ('and phone is required', function() {
				expect(validation_model.isValid('phone')).toBe(false);
			});
		});

		describe('getFormattedAddress', function() {
			it ('should always return full name', function() {
				var model_full_name = 'MY FULL NAME';
				model.set('fullname', model_full_name);
				
				var formatted_address = model.getFormattedAddress();

				expect(formatted_address.indexOf(model_full_name) >= 0 ).toBe(true);

				model.unset('fullname');
				formatted_address = model.getFormattedAddress();
				expect(formatted_address.indexOf(model_full_name) >= 0 ).toBe(false);
			});

			it ('should return company', function() {
				var model_company = 'COMPANY';
				model.set('company', model_company);
				
				var formatted_address = model.getFormattedAddress();

				expect(formatted_address.indexOf(model_company) >= 1 ).toBe(true);
			});

			it ('should return address 1', function() {
				var model_addr1 = 'ADDRESS 1';
				model.set('addr1', model_addr1);
				
				var formatted_address = model.getFormattedAddress();

				expect(formatted_address.indexOf(model_addr1) >= 1 ).toBe(true);
			});

			it ('should return address 2', function() {
				var model_addr2 = 'ADDRESS 2';
				model.set('addr2', model_addr2);
				
				var formatted_address = model.getFormattedAddress();

				expect(formatted_address.indexOf(model_addr2) >= 1 ).toBe(true);
			});

			it ('should return city', function() {
				var model_city = 'CITY';
				model.set('city', model_city);
				
				var formatted_address = model.getFormattedAddress();

				expect(formatted_address.indexOf(model_city) >= 1 ).toBe(true);

				model.unset('city');
				formatted_address = model.getFormattedAddress();

				expect(formatted_address.indexOf(model_city) >= 1 ).toBe(false);
			});

			it ('should return state', function() {
				var model_state = 'STATE';

				model.set('state', model_state);
				
				var formatted_address = model.getFormattedAddress();

				expect(formatted_address.indexOf(model_state) >= 1 ).toBe(true);

				model.unset('state');
				formatted_address = model.getFormattedAddress();

				expect(formatted_address.indexOf(model_state) >= 1 ).toBe(false);
			});

			it ('should return zip', function() {
				var model_zip = 'ZIP';
				model.set('zip', model_zip);
				
				var formatted_address = model.getFormattedAddress();

				expect(formatted_address.indexOf(model_zip) >= 1 ).toBe(true);

				model.unset('zip');
				formatted_address = model.getFormattedAddress();

				expect(formatted_address.indexOf(model_zip) >= 1 ).toBe(false);
			});

			it ('should return country', function() {
				var model_country = 'COUNTRY';
				model.set('country', model_country);
				
				var formatted_address = model.getFormattedAddress();

				expect(formatted_address.indexOf(model_country) >= 1 ).toBe(true);

				model.unset('country');
				formatted_address = model.getFormattedAddress();

				expect(formatted_address.indexOf(model_country)).toBe(-1);
			});

		});
		
	});
});