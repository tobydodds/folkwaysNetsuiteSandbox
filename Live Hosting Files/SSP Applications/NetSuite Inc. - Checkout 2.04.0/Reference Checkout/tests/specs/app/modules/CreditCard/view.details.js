// Credit Card Views Tests
// --------------------
// Testing Core
define(['CreditCard.Views', 'CreditCard.Collection', 'CreditCard.Model', 'TestHelper'], function (Views, Collection, Model, TestHelper)
{
	'use strict';

	describe('Credit Card Details View', function ()
	{
		//Define an global application, start it, load require modules and mount to app to each loaded module
		var helper = new TestHelper({
				applicationName: 'CreditCardDetailsView'
			,	loadTemplates: true
			,	beforeEachReady: function ()
				{
					var user = this.application.getUser();
					if (!user.get('creditcards'))
					{
						user.set('creditcards', new Collection(SC.ENVIRONMENT.CREDITCARD), {silent: true});
					}
					else
					{
						user.get('creditcards').reset(SC.ENVIRONMENT.CREDITCARD);
					}

					initialize_variables();
				}
			})
			,	view
			,	model
			,	collection;

		function initialize_variables()
		{
			collection = helper.application.getUser().get('creditcards');
			model = collection.first();
			view = new Views.Details({
				application: helper.application
			,	collection: collection
			,	model: model
			});
		}

		helper.beforeEach();
		helper.afterEach();

		it('should render all credit card values when showing an already created credit card', function ()
		{
			view.showContent('credit cards');

			expect(jQuery('[name="paymentmethod"]').val()).toEqual('5'); //Credit card type
			expect(jQuery('#ccnumber').val().match(/\d$/)).toBeTruthy();
			expect(jQuery('#expmonth').val()).toBe(model.get('expmonth'));
			//As the credit card is already expired the year seletor is disabled
			expect(jQuery('#expyear').find('option[selected]').is(':disabled')).toBe(true);
			expect(jQuery('#ccname').val()).toEqual(model.get('ccname'));
		});

		it('should not allow mark as default when current user is guest', function ()
		{
			var guest_value = helper.application.getUser().get('isGuest');
			helper.application.getUser().set('isGuest', 'T');

			view.showContent('credit cards');

			expect(jQuery('#ccdefault').length).toBe(0);

			helper.application.getUser().set('isGuest', guest_value);
		});

		it('should not allow mark as default when current touchpoint is not my account', function ()
		{
			spyOn(helper.application,'getConfig').andReturn('NOTcustomercenter');
			view.showContent('credit cards');

			expect(jQuery('#ccdefault').length).toBe(0);
		});

		it('should allow mark as default when current touchpoint is my account and the curent user is not guest', function ()
		{
			helper.application.foo = true;
			var guest_value = helper.application.getUser().get('isGuest');

			helper.application.getUser().set('isGuest', 'F');
			spyOn(helper.application,'getConfig').andReturn('customercenter');

			//Re create the view here so it takes into account the changes we make bafore
			view = new Views.Details({
				application: helper.application
			,	collection: collection
			,	model: model
			});

			view.showContent('credit cards');

			expect(jQuery('#ccdefault').length).toBe(1);

			helper.application.getUser().set('isGuest', guest_value);
		});

		it('should correctly validate missing name when updating', function ()
		{
			//emulate a cart without creditcards
			var old_getCart = helper.application.getCart;
			helper.application.getCart = function ()
			{
				return {
					get: function ()
					{
						return [];
					}
				};
			};

			view.showContent('credit cards');
			jQuery('#ccname').val('');

			expect(model.isValid()).toBeUndefined();
			expect(jQuery('[for="ccname"]').parent().hasClass('has-error')).toBe(false);

			jQuery('[type="submit"]').click();

			expect(model.isValid()).toBe(false);
			expect(jQuery('[for="ccname"]').parent().hasClass('has-error')).toBe(true);

			helper.application.getCart = old_getCart;
		});

		it('should correctly validate missing expiration date when updating', function ()
		{
			//emulate a cart without creditcards
			var old_getCart = helper.application.getCart;
			helper.application.getCart = function ()
			{
				return {
					get: function ()
					{
						return [];
					}
				};
			};

			view.showContent('credit cards');

			jQuery('#expmonth').val('');

			expect(model.isValid()).toBeUndefined();
			expect(jQuery('[for="expmonth"]').parent().hasClass('has-error')).toBe(false);

			jQuery('[type="submit"]').click();

			expect(model.isValid()).toBe(false);
			expect(jQuery('[for="expmonth"]').parent().hasClass('has-error')).toBe(true);

			helper.application.getCart = old_getCart;
		});

		it('should correctly validate when creating new', function ()
		{
			//emulate a cart without creditcards
			var old_getCart = helper.application.getCart;
			helper.application.getCart = function ()
			{
				return {
					get: function ()
					{
						return [];
					}
				};
			};

			view = new Views.Details({
				application: helper.application
			,	collection: collection
			,	model: new Model()
			});
			view.showContent('credit cards');
			jQuery('[type="submit"]').click();
			expect(jQuery('.alert-error').length).toBe(1);

			expect(jQuery('[for="expmonth"]').parent().hasClass('has-error')).toBe(false); //today is set as default
			expect(jQuery('[for="ccnumber"]').parent().hasClass('has-error')).toBe(true);
			expect(jQuery('[for="ccname"]').parent().hasClass('has-error')).toBe(true);

			helper.application.getCart = old_getCart;
		});

		it('should correctly create a new credit card from scratch', function ()
		{
			//emulate a cart without creditcards
			var old_getCart = helper.application.getCart;
			helper.application.getCart = function ()
			{
				return {
					get: function ()
					{
						return {
							each: function () {}
						};
					}
				};
			};

			view = new Views.Details({
				application: helper.application
			,	collection: collection
			,	model: new Model()
			});
			view.showContent('credit cards');

			expect(view.model.isNew()).toBe(true);

			jQuery('#ccname').val('VISA');
			jQuery('#ccnumber').val('4111111111111111');

			jQuery('[type="submit"]').click();
			expect(jQuery('.alert-error').length).toBe(0);

			var firstXhr  = jasmine.Ajax.requests.at(0);
			firstXhr.response({
				status: 200
			,	responseText: '{"ccsecuritycode":null,"expmonth":"1","customercode":null,"paymentmethod":{"ispaypal":"F","name":"VISA","creditcard":"T","internalid":"5","key":"5,-1,1555641112"},"debitcardissueno":null,"ccnumber":"************1111","validfrommon":null,"expyear":"2019","validfromyear":null,"savecard":"T","ccdefault":"F","ccexpiredate":"1/1/2019","internalid":"611","validfrom":null,"ccname":"VISA"}'
			});

			expect(view.model.isNew()).toBe(false);
			expect(view.model.id).toEqual('611');
			helper.application.getCart = old_getCart;
		});
	});
});