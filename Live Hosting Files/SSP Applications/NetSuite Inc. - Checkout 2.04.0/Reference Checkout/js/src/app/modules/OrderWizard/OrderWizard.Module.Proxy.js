// OrderWizard.Module.Proxy.js
// --------------------------------
//
define('OrderWizard.Module.Proxy', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({

		//List of modules to switch of
		/*
		modules: [
			{
				constr: MultiShipToShippingAddress
			,	instance: null
			,	options: {}
			,	isActive: function ()
				{
					return true;
				}
			,	updateEvents: 'ismultishiptoUpdated secondEvent'
			,	isReady: function ()
				{
					return false;
				}
			}
		]

		states: [
			{
				urlOptions: 'state=selectAddress'
			}
		]
		*/

		initialize: function (options)
		{
			if (this.states)
			{
				this.errors = ['NOT_ERR_NEXT_STATE', 'NOT_ERR_PREVIOUS_STATE'];
			}

			WizardModule.prototype.initialize.apply(this, arguments);

			this.state_index = 0; // In case of using multiples state_index indicate the current position
			this.move_forward = true;
			this.original_step_hash = (this.options.step && this.options.step.url) || this.options.stepGroup.url;
			this.view_rendered = false;
			this.active_modules_cache_valid = false;
			this.current_active_modules = [];

			var self = this
			,	module_options;

			_.each(this.modules, function (selected_module)
			{
				//Initialize each sub-module
				module_options = _.extend({}, options, selected_module.options || {});
				selected_module.instance = new selected_module.constr(module_options);

				//Handle error at proxy level
				var original_module_error_handle = selected_module.instance.manageError;
				selected_module.instance.manageError = _.bind(function (original_handle)
				{
					var aux_params = Array.prototype.slice.call(arguments, 1)
					,	aux_error = aux_params[0];

					if (!self.error)
					{
						self.error = [];
					}

					var previous_same_error = _.find(self.error, function (previous_error)
					{
						var errorCode = _.isString(aux_error) ? aux_error :
										_.isObject(aux_error) ? aux_error.errorCode : '';

						return previous_error.errorCode === errorCode;
					});

					original_handle.apply(this, aux_params);

					//If the error is new AND the submodule took into account the error, it could happend that the submodule just ingore the error and dont save it
					if (!previous_same_error && this.error)
					{
						self.error.push(aux_error);
					}

				}, selected_module.instance, original_module_error_handle);

				// forward module events
				selected_module.instance.on('all', function ()
				{
					self.trigger.apply(self, arguments);
				});

			}, this);

			self.attachToUpdate();
		}

		// Helper to invoke a funciton of a collection. I dont use _.invoke because that does not control that the function in each item
	,	invokeFunction: function (items, fun)
		{
			var args =  Array.prototype.slice.call(arguments, 2);
			_.each(items, function (item)
			{
				(item && _.isFunction(item[fun])) ? item[fun].apply(item, args) : null;
			});
		}

		// Forward present call to active modules
	,	present: function ()
		{
			this.active_modules_cache_valid = true;

			this.invokeFunction(this.getCurrentActiveModules(), 'present');
			_.each(this.getCurrentActiveModules(), function (module_instance)
			{
				module_instance.state = 'present';
			});
		}

		// Forward future call to active modules
	,	future: function ()
		{
			this.invokeFunction(this.getCurrentActiveModules(), 'future');
		}

		// Forward past call to active modules
	,	past: function ()
		{
			this.invokeFunction(this.getModulesForPastValidation(), 'past');
		}

		// Register for each module to what events listen to re-render (update the layout)
	,	attachToUpdate: function ()
		{
			var selected_events = _.flatten(_.map(_.pluck(this.modules, 'updateEvents'), function (events)
				{
					return _.map((events || '').split(' '), function (event) {
						return jQuery.trim(event);
					});
				}))
			,	self = this;

			_.each(_.uniq(selected_events), function (event)
			{
				if (event)
				{
					self.wizard.model.on(event, function ()
					{
						self.active_modules_cache_valid = false;
						// Owing to the fact that we are in the same wizard steo emulating many steps or just changind the rendered module
						// in the current step it is require to execute present in each submodule to notify and update its state
						self.present();
						self.render();
					});
				}
			});
		}

		// Navigate, in case there are states defined, to the specified index state
	,	navigateToState: function (stateIndex, trigger)
		{
			if (this.states)
			{
				var url_options = this.getURLForState(stateIndex)
				,	is_back_visible = (stateIndex < this.states.length && stateIndex > 0)
				,	extra_url_params = Backbone.history.location.hash ? _.parseUrlOptions(Backbone.history.location.hash) : {}
				,	obj_url_options = _.parseUrlOptions(url_options)
				,	are_params_to_add = false;

				_.each(_.keys(extra_url_params), function (key)
				{
					if ((extra_url_params[key] || _.isBoolean(extra_url_params[key]) || extra_url_params[key] === 0) && _.isUndefined(obj_url_options[key]))
					{
						are_params_to_add = true;
					}
					else
					{
						delete extra_url_params[key];
					}
				});

				Backbone.history.navigate(are_params_to_add ? _.addParamsToUrl(url_options, extra_url_params) : url_options, {trigger: _.isBoolean(trigger) ? trigger : true, replace:true});

				this.trigger('change_visible_back', is_back_visible);
			}
		}

		// Returns the URL corresponding with the state index passed in
	,	getURLForState: function (stateIndex)
		{
			var current_hash = this.original_step_hash;

			return current_hash + (~current_hash.indexOf('?') ? '&' : '?') + this.states[stateIndex].urlOptions;
		}

		// Returns the current state based om the current URL, in case there are states, 0 otherwise
	,	getCurrentStateFromURL: function ()
		{
			if (!this.states)
			{
				return 0;
			}

			var current_hash = this.getCurrentHash()
			,	state_index_local = 0;

			_.each(this.states, function (select_state, index)
			{
				if (~current_hash.indexOf(select_state.urlOptions))
				{
					state_index_local = index;
				}
			}, this);

			return state_index_local;
		}

		// Wrapper over windows.location.hash created to testability increate
	,	getCurrentHash: function ()
		{
			return window.location.hash;
		}

		// Method used to evalute the existence of future modules when usign the proxy with states (emulating steps)
	,	getActiveModulesWithStates: function (lookForward, state)
		{
			if (!this.states || (state + 1) > this.states.length || state < 0)
			{
				return null;
			}

			var active_modules = []
			,	is_active_aux
			,	is_ready_aux
			,	module_is_not_ready
			,	selected_state = this.states[state];

			_.each(this.modules, function (current_module)
			{
				is_active_aux = _.isFunction(current_module.isActive) ? current_module.isActive : current_module.instance.isActive;

				//A module is active its active function returns true, and when rendering does NOT trigger a "ready" event
				if(is_active_aux.call(this, selected_state))
				{
					is_ready_aux = _.isFunction(current_module.isReady) ? current_module.isReady : current_module.instance.isReady;
					module_is_not_ready = _.isFunction(is_ready_aux) ? !is_ready_aux.call(this) : true;

					if (module_is_not_ready)
					{
						active_modules.push(current_module.instance);
					}
				}
			}, this);

			return active_modules.length ?
				{
					modules: active_modules
				,	state: state
				} :
				this.getActiveModulesWithStates(lookForward, lookForward ? state + 1 : state - 1) ;
		}

		// Returns the list of active modules when using the proxy without states
	,	getActiveModulesWithoutStates: function (initial_state)
		{
			var active_modules = []
			,	is_active_aux;

			if (initial_state !== 0)
			{
				return null;
			}

			_.each(this.modules, function (selected_module)
			{
				is_active_aux = _.isFunction(selected_module.isActive) ? selected_module.isActive : selected_module.instance.isActive;

				if(is_active_aux.call(this))
				{
					active_modules.unshift(selected_module.instance);
				}
			}, this);

			return {
				modules: active_modules
			,	state: 0
			};
		}

		// Return the list of module that are being shown
	,	getCurrentActiveModules: function ()
		{
			if (!this.current_active_modules.length || !this.view_rendered || !this.active_modules_cache_valid)
			{
				this.active_modules_cache_valid = true;
				this.getNextModules(this.move_forward, this.state_index);
			}
			return this.current_active_modules;
		}

		// Returns the list of modules independently if the proxy is working with states or not
	,	getNextModules: function (look_forward, initial_state)
		{
			var result = this.states ?
						this.getActiveModulesWithStates(look_forward, initial_state) :
						this.getActiveModulesWithoutStates(initial_state);

			if (result)
			{
				this.state_index = result.state;
				this.current_active_modules = result.modules;
			}
			return result;
		}

		//The prorxy will be active if there is at least one submodule to show up
	,	isActive: function ()
		{
			var active_modules = this.getNextModules(this.move_forward, this.state_index);
			return active_modules && active_modules.modules.length;
		}

		// Call the appropiate render
	,	render: function ()
		{
			// This is to handle the reload of the page to not loose the current state
			if ( (this.state_index === 0 && !this.view_rendered) || this.getCurrentHash().substr(1) === this.original_step_hash.substr(1) )
			{
				this.onPageRefresh && this.onPageRefresh();
				this.state_index = this.getCurrentStateFromURL();
			}

			this.view_rendered = true;
			var active_modules = this.getNextModules(this.move_forward, this.state_index);
			this.$el.html('');

			if (active_modules && active_modules.modules.length)
			{
				if (this.getTitle())
				{
					this.$el.append('<h3 class="section-header">' + this.getTitle() + '</h3>');
				}

				_.each(active_modules.modules, function (active_module)
				{
					active_module.render();
					this.$el.append(active_module.$el);
				}, this);
			}

			this.navigateToState(this.state_index, false); // This is made in order to update the url after rendering in case of refresh
			this.error = null;

			//If we dont have any module to show, the entire proxy is ready to be skipped
			if (!active_modules || !active_modules.modules.length)
			{
				this.trigger('ready', true);
			}
		}

		// When validating the proxy and it's in the past the group of modules tov alidate shouwl be as extensive as posible
	,	getModulesForPastValidation: function ()
		{
			var selected_modules = this.states ?
						this.getModulesForAnyState() :
						this.getActiveModulesWithoutStates(0);

			return selected_modules.modules;
		}

		// Returns the list of modules when using states, that would be available for at least one state
	,	getModulesForAnyState: function ()
		{
			var active_modules = []
			,	is_active_aux;

			_.each(this.modules, function (current_module)
			{
				_.each(this.states, function (selected_state)
				{
					is_active_aux = _.isFunction(current_module.isActive) ? current_module.isActive : current_module.instance.isActive;

					//A module is active its active function returns true, and when rendering does NOT trigger a "ready" event
					if(is_active_aux.call(this, selected_state))
					{
						active_modules.push(current_module.instance);
					}

				}, this);
			}, this);

			return {
				modules: active_modules
			};
		}

	,	getForWhichStateAModuleIsValid: function (current_module)
		{
			var result_state_index = -1;
			_.each(this.states, function (selected_state, index)
			{
				var is_active_aux = _.isFunction(current_module.isActive) ? current_module.isActive : current_module.instance.isActive;

				//A module is active its active function returns true, and when rendering does NOT trigger a "ready" event
				if(result_state_index < 0 & is_active_aux.call(this, selected_state))
				{
					result_state_index = index;
				}

			}, this);

			return result_state_index;
		}

		// Group isValid per each module and returns a promise of this groupping
	,	isValid: function ()
		{
			var self = this
			,	selected_modules_for_validation = this.state === 'past' ? this.getModulesForPastValidation() : this.getCurrentActiveModules()
			,	result = this._collectPromisesForMethod('isValid', selected_modules_for_validation);

			result.promise.fail(function ()
			{
				//If in the validation process any module fails and the proxy is emulating steps, based on the failing modules we calculate the first state where a module is failing
				if (self.states)
				{
					var	promises_in_error = _.filter(result.promises_array, function (promise)
						{
							return promise.state() === 'rejected';
						})
					,	submodule_instances_in_error = _.map(promises_in_error, function (erroneous_promise)
						{
							var internal_submodule_index = result.promises_array.indexOf(erroneous_promise);
							return result.original_module_list[internal_submodule_index];
						})
					,	submodules_in_error = _.filter(self.modules, function (module)
						{
							return _.find(submodule_instances_in_error, function (internal_instance)
							{
								return module.instance === internal_instance;
							});
						})
					,	state_indexes_with_error = _.map(submodules_in_error, function (submodule_in_error)
						{
							return self.getForWhichStateAModuleIsValid(submodule_in_error);
						});

					self.state_index = _.min(state_indexes_with_error);
				}
			}).done(function ()
			{
				self.error = null;
			});
			return result.promise;
		}

		// Helper method used to group a list of promises generated based on exencuting on each avtive module the function named as the first paraemter
	,	_collectPromisesForMethod: function (funName, selected_modules)
		{
			var active_modules = selected_modules || this.getCurrentActiveModules()
			,	promises_result = _.reduce(active_modules, function (are_modules_valid, active_module)
				{
					are_modules_valid.push(active_module[funName]());
					return are_modules_valid;
				}, []);

			return {
				promise: jQuery.when.apply(jQuery, promises_result)
			,	promises_array: promises_result
			,	original_module_list: active_modules
			};
		}

		// Group submit per each module and returns a promise of this groupping
	,	submit: function ()
		{
			this.move_forward = true;
			var result = jQuery.Deferred()
			,	valid_submit = function ()
				{
					var future_modules = this.getNextModules(this.move_forward, this.state_index + 1);

					// The this module is done is there is no states or there is no more future states
					if (!future_modules)
					{
						// We are in the last state or there is not states at all
						result.resolve();
					}
					else
					{
						result.reject({
								errorCode: 'NOT_ERR_NEXT_STATE'
							,	errorMessage: 'This is NOT error, just moving to the next fake step'
							});
					}
				};

			this._collectPromisesForMethod('submit').promise
				.then(_.bind(valid_submit, this), result.reject);

			return result;
		}

		// We override the cancel in order manage an emulate the back button
	,	cancel: function ()
		{
			this.move_forward = false;
			var result = jQuery.Deferred()
			,	valid_submit = function ()
				{
					// Update the state_index and cehck of there are previous steps to show
					var previous_modules = this.getNextModules(this.move_forward, this.state_index - 1);
					if (!previous_modules)
					{
						// We are in the last state or there is not states at all
						result.resolve();
					}
					else
					{
						result.reject({
								errorCode: 'NOT_ERR_PREVIOUS_STATE'
							,	errorMessage: 'This is NOT error, just moving to the previous fake step'
							});
					}
				};

			this._collectPromisesForMethod('cancel').promise
				.then(_.bind(valid_submit, this), result.reject);

			return result;
		}

		// Handle the fake error generate wwhen emulating continue and back
	,	manageError: function (error)
		{
			if (error && (error.errorCode === 'NOT_ERR_NEXT_STATE' || error.errorCode === 'NOT_ERR_PREVIOUS_STATE'))
			{
				this.navigateToState(this.state_index);
				this.render();
			}
			else
			{
				WizardModule.prototype.manageError.apply(this, arguments);
			}
		}
	});

});
