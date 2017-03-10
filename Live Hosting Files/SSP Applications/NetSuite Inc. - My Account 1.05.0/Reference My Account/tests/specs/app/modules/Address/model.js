define(['Address.Model'], function (AddressModel)
{
	'use strict';

	return describe('Address Model', function() {

		var model
		,	model_2
		,	model_3
		,	model_4
		,	model_5
		,	validation_model;


		beforeEach(function ()
		{
			model =  new AddressModel();
			model_2 = _.extend(new AddressModel({country: 'UY', zip: null}), Backbone.Validation.mixin);
			model_3 = _.extend(new AddressModel({country: 'CL', zip: null}), Backbone.Validation.mixin);
			model_4 = _.extend(new AddressModel({country: 'UY', state: null}), Backbone.Validation.mixin);
			model_5 = _.extend(new AddressModel({country: 'US', state: null}), Backbone.Validation.mixin);
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
			it ('and phone is required', function() {
				expect(validation_model.isValid('phone')).toBe(false);
			});
			it ('and zip is required', function() {
				expect(validation_model.isValid('zip')).toBe(false);
			});
		});

		describe('Validate model with country that zip code is required',function() {
			it ('the country is valid', function() {

				expect(!model_2.validate().country).toBe(true);
			});
			it ('and zip code is required', function() {
				expect(!!model_2.validate().zip).toBe(true);
			});
		});

		describe('Validate model with country that zip code is not required',function() {
			it ('the country is valid', function() {
				expect(!model_3.validate().country).toBe(true);
			});
			it ('and zip code is not required', function() {
				expect(!model_3.validate().zip).toBe(true);
			});
		});

		describe('Validate model with country that state is not required',function() {
			it ('the country is valid', function() {
				expect(!model_4.validate().country).toBe(true);
			});
			it ('and state is not required', function() {
				expect(!model_4.validate().state).toBe(true);
			});
		});

		describe('Validate model with country that state is required',function() {
			it ('the country is valid', function() {
				expect(!model_5.validate().country).toBe(true);
			});
			it ('and state is required', function() {
				expect(!model_5.validate().state).toBe(true);
			});
		});

		/*
		describe('getInvalidAttributes', function() {
			it ('should return all of them for a empty address', function() {
				var x = model.getInvalidAttributes();
				expect(x.length).toBe(6);
				var expectedValues = ['Full Name','Address','Country','City','Zip Code','Phone Number'];
				for (var i in x)
				{
					expect(expectedValues.indexOf(x[i])).not.toBeLessThan(0);
				}
			});
		});
		*/
	});
});