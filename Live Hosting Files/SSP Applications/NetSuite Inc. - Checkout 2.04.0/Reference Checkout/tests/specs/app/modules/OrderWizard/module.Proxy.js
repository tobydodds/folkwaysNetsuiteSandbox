define(['OrderWizard.Module.Proxy', 'Application'],
	function (AbstractProxy)
{
	'use strict';

	describe('OrderWizard Abstract Proxy Module', function ()
	{
		var fake_module = (function ()
			{
				var module = function ()
				{
				};

				module.prototype.on = function ()
				{
				};

				return module;
			})()
		,	States_module = AbstractProxy.extend(
			{
				initialize: function (options)
				{
					this.modules = (options && options.modules) ? options.modules : [
						{
							constr: fake_module
						,	isActive: function ()
							{
								return true;
							}
						,	updateEvents: 'event1 event2'
						}
					,	{
							constr: fake_module
						,	isActive: function ()
							{
								return false;
							}
						,	updateEvents: 'fake_event'
						}
					];

					this.states = (options && options.states) ? options.states : [
						{
							urlOptions: 'selectAddress=true'
						}
					,	{
							urlOptions: 'packages=true'
						}
					];

					AbstractProxy.prototype.initialize.apply(this, arguments);
				}
			})
		,	Simple_module = AbstractProxy.extend(
			{
				initialize: function ()
				{
					this.modules = [
						{
							constr: fake_module
						,	isActive: function ()
							{
								return true;
							}
						,	updateEvents: 'fake_event'
						}
					,	{
							constr: fake_module
						,	isActive: function ()
							{
								return false;
							}
						}
					];

					AbstractProxy.prototype.initialize.apply(this, arguments);
				}
			})
		,	creation_options;

		beforeEach(function ()
		{
			creation_options = {
					wizard: {
						model :{
							on : function () {}
						}
					}
				,	stepGroup : {
						url : 'test-url'
					}
				};
		});

		describe('initialization', function ()
		{
			var mock;

			beforeEach(function ()
			{
				mock = new States_module({
					wizard: {
						model :{
							on : function () {}
						}
					}
				,	stepGroup : {
						url : 'test-url'
					}
				});
			});

			it ('Should register errors in case there are states defined', function ()
			{
				expect(mock.errors).toBeDefined();
				expect(mock.errors.length).toBe(2);
				expect(_.contains(mock.errors, 'NOT_ERR_NEXT_STATE')).toBeTruthy();
				expect(_.contains(mock.errors, 'NOT_ERR_PREVIOUS_STATE')).toBeTruthy();
			});

			it('Should create an instance of each module', function ()
			{
				expect(mock.modules.length).toBe(2);
				expect(mock.modules[0].instance).toBeDefined();
				expect(mock.modules[1].instance).toBeDefined();
			});

			it('Should attach to the specifed event in each module', function ()
			{
				var fake_model = jasmine.createSpyObj('model', ['on']);
				mock = new States_module({
					wizard: {
						model: fake_model
					}
				,	stepGroup : {
						url : 'test-url'
					}
				});

				expect(fake_model.on).toHaveBeenCalled();
				expect(fake_model.on.calls.length).toBe(3);
				expect(fake_model.on.calls[0].args[0]).toEqual('event1');
				expect(fake_model.on.calls[1].args[0]).toEqual('event2');
				expect(fake_model.on.calls[2].args[0]).toEqual('fake_event');
			});

			it('Should call present on each sub-module when re-render event is triggered', function ()
			{
				var callback;
				mock = new Simple_module({
					wizard: {
						model :{
							on : function (event_name, clbk) {callback = clbk;}
						}
					}
				,	stepGroup : {
						url : 'test-url'
					}
				});

				spyOn(mock, 'render');
				spyOn(mock, 'present');

				callback();
				expect(mock.render).toHaveBeenCalled();
				expect(mock.present).toHaveBeenCalled();
			});
		});

		describe('Navigate to State', function ()
		{
			it('Should execute only of there are states defined', function ()
			{
				var mock = new Simple_module(creation_options);

				spyOn(mock, 'trigger');
				mock.navigateToState(1);

				expect(mock.trigger).not.toHaveBeenCalled();
			});

			it('Should update the current url with the specified index\'s state url adding an &', function ()
			{
				var mock = new States_module(creation_options);

				spyOn(mock, 'trigger');
				spyOn(Backbone.history, 'navigate');

				mock.navigateToState(0);

				expect(mock.trigger).toHaveBeenCalledWith('change_visible_back', false);
				expect(Backbone.history.navigate).toHaveBeenCalledWith('test-url?selectAddress=true', { trigger : true, replace: true } );
			});

			it('Should update the current url with the specified index\'s state url adding a ?', function ()
			{
				var mock = new States_module(creation_options);
				mock.original_step_hash = 'test-url?really=true';

				spyOn(mock, 'trigger');
				spyOn(Backbone.history, 'navigate');

				mock.navigateToState(0);

				expect(mock.trigger).toHaveBeenCalledWith('change_visible_back', false);
				expect(Backbone.history.navigate).toHaveBeenCalledWith('test-url?really=true&selectAddress=true', { trigger : true, replace: true } );
			});
		});

		describe('Forward function calls', function ()
		{
			var mock;

			beforeEach(function ()
			{
				mock = new Simple_module(creation_options);
			});


			it('Should forward present function call to active modules', function ()
			{
				mock.modules[0].instance.present = function() {};
				mock.modules[1].instance.present = function() {};
				spyOn(mock.modules[0].instance, 'present');
				spyOn(mock.modules[1].instance, 'present');

				mock.present();

				expect(mock.modules[0].instance.present).toHaveBeenCalled();
				expect(mock.modules[1].instance.present).not.toHaveBeenCalled();
			});

			it('Should forward future function call to active modules', function ()
			{
				mock.modules[0].instance.future = function() {};
				mock.modules[1].instance.future = function() {};
				spyOn(mock.modules[0].instance, 'future');
				spyOn(mock.modules[1].instance, 'future');

				mock.future();

				expect(mock.modules[0].instance.future).toHaveBeenCalled();
				expect(mock.modules[1].instance.future).not.toHaveBeenCalled();
			});

			it('Should forward past function call to active mdoules', function ()
			{
				mock.modules[0].instance.past = function() {};
				mock.modules[1].instance.past = function() {};
				spyOn(mock.modules[0].instance, 'past');
				spyOn(mock.modules[1].instance, 'past');

				mock.past();

				expect(mock.modules[0].instance.past).toHaveBeenCalled();
				expect(mock.modules[1].instance.past).not.toHaveBeenCalled();
			});
		});

		describe('Get Current State from URL', function ()
		{
			it('Should return 0 if there is not state declare', function ()
			{
				var mock = new Simple_module(creation_options);

				expect(mock.getCurrentStateFromURL()).toBe(0);
			});

			it('Should update the state index based on the current url and return the sate based on the state index', function ()
			{
				var mock = new States_module(creation_options);
				mock.state_index = 12;
				spyOn(mock, 'getCurrentHash').andReturn('test-url?packages=true');

				var result = mock.getCurrentStateFromURL();

				expect(result).toEqual(1);
				expect(mock.state_index).toBe(12); //This method should NOT update the state index
			});
		});

		describe('Get Active Modules with States', function ()
		{
			it('Should return null if there is not states defined', function ()
			{
				var mock = new Simple_module(creation_options);

				expect(mock.getActiveModulesWithStates(true, 0)).toBe(null);
			});

			it('Should return null if the specified state index is greater than the amount of defiend states', function ()
			{
				var mock = new States_module(creation_options);

				expect(mock.getActiveModulesWithStates(true, 45)).toBe(null);
			});

			it('Should return return the next state if this is active', function ()
			{
				var active_module = {
						constr: fake_module
					,	isActive: function ()
						{
							return true;
						}
					};

				creation_options.modules = [
					{
						constr: fake_module
					,	isActive: function ()
						{
							return false;
						}
					}
				,	active_module
				,	{
						constr: fake_module
					,	isActive: function ()
						{
							return false;
						}
					}
				];
				creation_options.states = [
					{
						urlOptions: 'one=1'
					}
				,	{
						urlOptions: 'two=2'
					}
				,	{
						urlOptions: 'three=3'
					}
				];

				var mock = new States_module(creation_options)
				,	result = mock.getActiveModulesWithStates(true, 0);

				expect(result.modules.length).toBe(1);
				expect(result.modules[0]).toBe(active_module.instance);
				expect(result).toEqual({
					modules: [active_module.instance]
				,	state: 0
				});
			});

			it('Should itself recursively if the next state is not the active', function ()
			{
				var active_module = {
						constr: fake_module
					,	isActive: function (state)
						{
							return state.urlOptions === 'two=2';
						}
					};

				creation_options.modules = [
					{
						constr: fake_module
					,	isActive: function ()
						{
							return false;
						}
					}
				,	active_module
				,	{
						constr: fake_module
					,	isActive: function ()
						{
							return false;
						}
					}
				];
				creation_options.states = [
					{
						urlOptions: 'one=1'
					}
				,	{
						urlOptions: 'two=2'
					}
				,	{
						urlOptions: 'three=3'
					}
				];

				var mock = new States_module(creation_options)
				,	result = mock.getActiveModulesWithStates(true, 0);

				expect(result.modules.length).toBe(1);
				expect(result.modules[0]).toBe(active_module.instance);
				expect(result).toEqual({
					modules: [active_module.instance]
				,	state: 1
				});
			});
		});

		describe('Get Active Modules', function ()
		{
			it('Should return the list of active modules from "state" if there is no active modules loaded', function ()
			{
				var mock = new States_module(creation_options)
				,	result;

				spyOn(mock, 'getActiveModulesWithStates').andReturn({
					state: 12
				,	modules: ['expected_result']
				});

				expect(mock.current_active_modules.length).toBe(0);

				result = mock.getCurrentActiveModules();

				expect(result.length).toBe(1);
				expect(result[0]).toEqual('expected_result');
			});

			it('Should return the list of active modules from "without" if there is no active modules loaded', function ()
			{
				var mock = new Simple_module(creation_options)
				,	result;

				spyOn(mock, 'getActiveModulesWithoutStates').andReturn({
					state: 12
				,	modules: ['expected_result']
				});

				expect(mock.current_active_modules.length).toBe(0);

				result = mock.getCurrentActiveModules();

				expect(result.length).toBe(1);
				expect(result[0]).toEqual('expected_result');
			});
		});

		describe('Render', function ()
		{
			it('Should call to each active module the render function and call navigateToState', function ()
			{
				var mock = new States_module(creation_options);
				mock.modules[0].instance.$el = '<div id="module01"></div>';
				mock.modules[0].instance.render = function (){};
				mock.modules[1].instance.$el = '<div id="module02"></div>';
				mock.modules[1].instance.render = function (){};
				spyOn(mock, 'navigateToState');

				mock.render();

				expect(mock.$el.html()).toEqual('<div id="module01"></div>');
				expect(mock.navigateToState).toHaveBeenCalledWith(0, false);
			});
		});

		describe('Is Valid', function ()
		{
			it('Should return success if all sub module return valid', function ()
			{
				var mock = new States_module(creation_options);
				mock.modules[0].instance.isValid = function (){ return jQuery.Deferred().resolve(); };
				mock.modules[1].instance.isValid = function (){ return jQuery.Deferred().resolve(); };

				var result = mock.isValid();

				expect(result.state()).toEqual('resolved');
			});

			it('Should return fail if at least one submodule fail', function ()
			{
				creation_options.modules =  [
						{
							constr: fake_module
						,	isActive: function ()
							{
								return true;
							}
						}
					,	{
							constr: fake_module
						,	isActive: function ()
							{
								return true;
							}
						}
					];

				var mock = new States_module(creation_options);
				mock.modules[0].instance.isValid = function () { return jQuery.Deferred().resolve(); };
				mock.modules[1].instance.isValid = function () { return jQuery.Deferred().reject(); };

				var result = mock.isValid();

				expect(result.state()).toEqual('rejected');
			});
		});

		describe('submit', function ()
		{
			beforeEach(function ()
			{
				creation_options.modules =  [
					{
						constr: fake_module
					,	isActive: function ()
						{
							return true;
						}
					}
				,	{
						constr: fake_module
					,	isActive: function ()
						{
							return true;
						}
					}
				];
			});


			it('Should reject if at least one submodule reject', function ()
			{
				var mock = new States_module(creation_options);
				mock.modules[0].instance.submit = function () { return jQuery.Deferred().resolve(); };
				mock.modules[1].instance.submit = function () { return jQuery.Deferred().reject(); };

				var result = mock.submit();

				expect(result.state()).toEqual('rejected');
			});

			it('Should resolve if each module sucess and there is no states register', function ()
			{
				var mock = new Simple_module(creation_options);
				mock.modules[0].instance.submit = function () { return jQuery.Deferred().resolve(); };
				mock.modules[1].instance.submit = function () { return jQuery.Deferred().resolve(); };

				var result = mock.submit();

				expect(result.state()).toEqual('resolved');
			});

			it('Should resolve if each module sucess if there are states register and the current state is the last one', function ()
			{
				var mock = new Simple_module(creation_options);
				mock.modules[0].instance.submit = function () { return jQuery.Deferred().resolve(); };
				mock.modules[1].instance.submit = function () { return jQuery.Deferred().resolve(); };
				spyOn(mock, 'getNextModules').andReturn(null); //Last module, becaus future modules is null

				var result = mock.submit();

				expect(result.state()).toEqual('resolved');
			});

			it('Should reject with fake error if each module sucess and there are states register and the current state is NOT the last one', function ()
			{
				var mock = new States_module(creation_options)
				,	error_throw;
				mock.modules[0].instance.submit = function () { return jQuery.Deferred().resolve(); };
				mock.modules[1].instance.submit = function () { return jQuery.Deferred().resolve(); };
				spyOn(mock, 'getNextModules').andReturn(true); //Trutlhy indicating there are more future modules

				var result = mock.submit();

				expect(result.state()).toEqual('rejected');

				result.fail(function (error)
				{
					error_throw = error;
				});
				expect(error_throw).toEqual({
					errorCode: 'NOT_ERR_NEXT_STATE'
				,	errorMessage: 'This is NOT error, just moving to the next fake step'
				});
			});
		});

		describe('cancel', function ()
		{
			beforeEach(function ()
			{
				creation_options.modules =  [
					{
						constr: fake_module
					,	isActive: function ()
						{
							return true;
						}
					}
				,	{
						constr: fake_module
					,	isActive: function ()
						{
							return true;
						}
					}
				];
			});


			it('Should reject if at least one submodule reject', function ()
			{
				var mock = new States_module(creation_options);
				mock.modules[0].instance.cancel = function () { return jQuery.Deferred().resolve(); };
				mock.modules[1].instance.cancel = function () { return jQuery.Deferred().reject(); };

				var result = mock.cancel();

				expect(result.state()).toEqual('rejected');
			});

			it('Should resolve if each module success and there are NO states register', function ()
			{
				var mock = new Simple_module(creation_options);
				mock.modules[0].instance.cancel = function () { return jQuery.Deferred().resolve(); };
				mock.modules[1].instance.cancel = function () { return jQuery.Deferred().resolve(); };

				var result = mock.cancel();

				expect(result.state()).toEqual('resolved');
			});

			it('Should resolve if each module success and there are states register', function ()
			{
				var mock = new States_module(creation_options);
				mock.modules[0].instance.cancel = function () { return jQuery.Deferred().resolve(); };
				mock.modules[1].instance.cancel = function () { return jQuery.Deferred().resolve(); };

				var result = mock.cancel();

				expect(result.state()).toEqual('resolved');
			});

			it('Should reject with fake error if each module success and there are states register and the current state is NOT the first one', function ()
			{
				var mock = new States_module(creation_options)
				,	error_throw;
				mock.modules[0].instance.cancel = function () { return jQuery.Deferred().resolve(); };
				mock.modules[1].instance.cancel = function () { return jQuery.Deferred().resolve(); };
				mock.state_index = 1; //Not first step

				var result = mock.cancel();

				expect(result.state()).toEqual('rejected');

				result.fail(function (error)
				{
					error_throw = error;
				});
				expect(error_throw).toEqual({
					errorCode: 'NOT_ERR_PREVIOUS_STATE'
				,	errorMessage: 'This is NOT error, just moving to the previous fake step'
				});
			});
		});

		describe('Manage Error', function ()
		{
			it('Should manage the error navigating to the next step if the error is NOT_ERR_NEXT_STATE', function ()
			{
				var mock = new States_module(creation_options);
				mock.state_index = 0;
				spyOn(mock, 'navigateToState');
				spyOn(mock, 'render');

				mock.manageError({
					errorCode: 'NOT_ERR_NEXT_STATE'
				});

				expect(mock.navigateToState).toHaveBeenCalledWith(0);
				expect(mock.render).toHaveBeenCalled();
			});

			it('Should manage the error navigating to the previous step if the error is NOT_ERR_PREVIOUS_STATE', function ()
			{
				var mock = new States_module(creation_options);
				mock.state_index = 10;
				spyOn(mock, 'navigateToState');
				spyOn(mock, 'render');

				mock.manageError({
					errorCode: 'NOT_ERR_PREVIOUS_STATE'
				});

				expect(mock.navigateToState).toHaveBeenCalledWith(10);
				expect(mock.render).toHaveBeenCalled();
			});

			it('Should deletegate to the father is the error is not one of the register ones', function ()
			{
				var mock = new States_module(creation_options)
				,	gran_pa = Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(mock)));

				spyOn(gran_pa, 'manageError');

				mock.manageError({
					errorCode: 'FATHER_ERROR'
				});

				expect(gran_pa.manageError).toHaveBeenCalled();
			});
		});

	});
});
