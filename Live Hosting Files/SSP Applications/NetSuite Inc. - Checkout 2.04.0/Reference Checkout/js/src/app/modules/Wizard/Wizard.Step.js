// Wizard.Step.js
// --------------
// Step View, Renders all the components of the Step
define('Wizard.Step', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'wizard_step'

	,	events: {
			'click [data-action="previous-step"]': 'previousStep'
		,	'click [data-action="submit-step"]': 'submit'
		}

		// default label for the "continue" button, this is overridden in the configuration file
	,	continueButtonLabel: _('Continue').translate()

		// by defaul the back button is shown, this is overridden in the configuration file
	,	hideBackButton: false

	,	bottomMessage: null

	,	bottomMessageClass: ''

		// Will be extended with the modules to be instanciated
	,	modules: []

		// step.initialize
		// initializes some variables and Instanciates all the modules
	,	initialize: function (options)
		{
			this.wizard = options.wizard;
			this.stepGroup = options.stepGroup;
			this.moduleInstances = [];

			// This is used to know when to execute the events
			this.renderPromise = jQuery.Deferred().resolve();

			var self = this;
			_.each(this.modules, function (module)
			{
				var module_options = {};

				if (_.isArray(module))
				{
					module_options = module[1];
					module = module[0];
				}
				// Requires the module
				var ModuleClass = require(module);

				var module_instance = new ModuleClass(_.extend({
					wizard: self.wizard
				,	step: self
				,	stepGroup: self.stepGroup
				//	set the classname of the module to the module's name
				,	className: 'orderwizard-module ' + module.replace(/\./g,'-').toLowerCase()
				}, module_options));

				// add listeners to some events available to the modules
				module_instance.on({
					ready: function (is_ready)
					{
						self.moduleReady(this, is_ready);
					}
				,	navbar_toggle: function (toggle)
					{
						self.moduleNavbarToggle(this, toggle);
					}
				,	change_enable_continue: function (enable, options)
					{
						var selected_options = _.extend({onlyContinue: false}, options);
						enable ? self.enableNavButtons(selected_options) : self.disableNavButtons(selected_options);
					}
				,	change_visible_back: function (visible)
					{
						self.changeVisibleNavButtons({
							backBtn: true
						,	visible: visible
						});
					}
				,	update_step_name: function ()
					{
						self.$('[data-type="wizard-step-name-container"]').text(self.getName());
					}
				,	change_label_continue: function (label)
					{
						self.changeLabelContinue(label);
					}
				,	error: function (error)
					{
						self.moduleError(this, error);
					}
				});

				// attach wizard events to error handling
				_.each(module_instance.errors, function (errorId)
				{
					self.wizard.handledErrors.push(errorId);

					self.wizard.on(errorId, function (error)
					{
						module_instance.manageError(error);
					});
				});

				if (module_instance.modules)
				{
					_.each(module_instance.modules, function (submodule)
					{
						_.each(submodule.instance.errors, function (errorId)
						{
							self.wizard.handledErrors.push(errorId);

							self.wizard.on(errorId, function (error)
							{
								submodule.instance.manageError(error);
							});
						});
					});
				}

				// ModuleClass is expected to be a View
				self.moduleInstances.push(module_instance);
			});
		}

		// When a step gets in the pass it is requested to set all its module instances to false, so if the step get to be presetn again (back and foward) dot get skiped
	,	removeReadyFromModules: function ()
		{
			_.each(this.moduleInstances, function (module_instance)
			{
				module_instance.isReady = false;
			});
		}

		// when a module is ready triggers this
		// if all the modules in the step are ready, and the advance conditions are met, the step submits itself
	,	moduleReady: function (module, ready)
		{
			var self = this;
			// submit the step if changed the state of isReady and step is in the present.
			if (module.isReady !== ready)
			{
				module.isReady = ready;

				if (self.stepAdvance() && self.state === 'present')
				{
					this.renderPromise.done(function ()
					{
						self.submit();
					});
				}
			}
		}

	,	moduleError: function (module, error)
		{
			// if the error doesnt come from a module, and this step is being shown, display the error
			if (!module && this.state !== 'future')
			{
				this.error = error;
				if (this === this.wizard.getCurrentStep())
				{
					this.showError();
				}
			}
		}

	,	hasErrors: function ()
		{
			return this.error || _.some(this.moduleInstances, function (module)
			{
				return module.error;
			});
		}

	,	showError: function ()
		{
			if (this.error)
			{
				this.$('[data-type="alert-placeholder-step"]').html(
					SC.macros.message(this.wizard.processErrorMessage(this.error.errorMessage), 'error', true)
				);
				jQuery('html, body').animate({
					scrollTop: 0
				}, 600);
				this.error = null;
			}
		}

		// auxiliar function to determine if we have to advance to the next step.
	,	stepAdvance: function ()
		{
			return this.areAllModulesReady() && this.isStepReady();
		}

	,	areAllModulesReady: function ()
		{
			var ready_state_array = _(this.moduleInstances).chain().pluck('isReady').uniq().value()
			,	url_options = _.parseUrlOptions(Backbone.history.location.hash);

			return !url_options.force && ready_state_array.length === 1 && ready_state_array[0] === true;
		}

		// method to be ovewritten to put custom logic to determine if a step is ready to be skipped
	,	isStepReady: function ()
		{
			return false;
		}

		// when a module doesn't need the navigation bar triggers this
		// if no modules in the step needs it, the step hide the navigation buttons
	,	moduleNavbarToggle: function (module, toggle)
		{
			var self = this;
			this.renderPromise.done(function ()
			{
				module.navigationToggle = toggle;

				var toggle_state_array = _(self.moduleInstances).chain().pluck('navigationToggle').uniq().value();

				if (toggle_state_array.length === 1 && toggle_state_array[0] === false)
				{
					self.$('.step-navigation-buttons').hide();
				}
				else
				{
					self.$('.step-navigation-buttons').show();
				}
			});
		}

		// communicate the status of the step to it's modules (past, present, future)
	,	tellModules: function (what)
		{
			_.each(this.moduleInstances, function (module_instance)
			{
				_.isFunction(module_instance[what]) && module_instance[what]();
				module_instance.state = what;
			});
		}

		// step.past
		// ---------
		// Will be called ever time a step is going to be renderd
		// and this step is previous in the step order
	,	past: function ()
		{
			this.validate();
		}

		// step.present
		// ------------
		// Will be called ever time a step is going to be renderd
		// and this is the step
	,	present: jQuery.noop

		// step.future
		// -----------
		// Will be called ever time a step is going to be renderd
		// and this step is next in the step order
	,	future: function ()
		{
			// cleanup future errors
			this.error = null;
			_.each(this.moduleInstances, function (module_instance)
			{
				module_instance.error = null;
			});
		}

		// step.render
		// -----------
		// overrides the render function to not only render itself
		// but also call the render function of its modules
	,	render: function ()
		{
			var self = this
			,	position = this.wizard.getStepPosition();

			this.removeReadyFromModules();

			this.renderPromise = jQuery.Deferred();

			this.currentModelState = JSON.stringify(this.wizard.model);

			// ***** WARNING *****
			// Please do NOT take this as a reference
			// we are using it only as a last resort
			// to show/hide some elements on the last
			// page of the checkout process
			this.$el.attr({
				'data-from-begining': position.fromBegining
			,	'data-to-last': position.toLast
			});

			// Renders itself
			this._render();
			var content_element = this.$('#wizard-step-content');

			// Empties the modules container
			content_element.empty();

			var containers = [];

			// Then Renders the all the modules and append them into the container
			_.each(this.moduleInstances, function (module_instance)
			{
				module_instance.isReady = false;
				module_instance.render();
				var content = content_element
				,	container = module_instance.options.container;

				if (container)
				{
					var added = false;
					if (!containers[container])
					{
						containers[container] = true;
						added = true;
					}

					var content_temp = self.$(container);
					if (content_temp.length)
					{
						if (added)
						{
							content_temp.empty();
						}
						content = content_temp;
					}
				}

				content.append(module_instance.$el);
			});

			this.wizard.application.getLayout().once('afterAppendView', function ()
			{
				self.renderPromise.resolve();
			});

			this.showError();

			return this;
		}

		// step.previousStep
		// -----------------
		// Goes to the previous step.
		// Calls the cancel of each module
		// and asks the wizard to go to the previous step
	,	previousStep: function (e)
		{
			// Disables the navigation Buttons
			e && this.disableNavButtons();

			// Calls the submite method of the modules and collects errors they may have
			var promises = [];
			_.each(this.moduleInstances, function (module_instance)
			{
				promises.push(
					module_instance.cancel()
				);
			});

			var self = this;
			jQuery.when.apply(jQuery, promises).then(
				// Success Callback
				function ()
				{
					// Makes the wizard gon to the previous step
					self.wizard.goToPreviousStep();
				}
				// Error Callback
			,	function (error)
				{
					if (error)
					{
						self.wizard.manageError(error, self);
						e && self.enableNavButtons();
					}
				}
			);
		}

	,	submitErrorHandler: function (error)
		{
			this.enableNavButtons();
			this.wizard.manageError(error, this);

			_.each(this.moduleInstances, function (module_instance)
			{
				module_instance.enableInterface();
			});
		}

		// step.submit
		// -----------
		// Calls the submit method of each module
		// cals our save function
		// and asks the wizard to go to the next step
	,	submit: function (e)
		{
			// Disables the navigation Buttons
			e && this.disableNavButtons();

			// Calls the submite method of the modules and collects errors they may have
			var promises = [];

			_.each(this.moduleInstances, function (module_instance)
			{
				promises.push(
					module_instance.submit(e)
				);
				module_instance.disableInterface();
			});

			var self = this;
			jQuery.when.apply(jQuery, promises).then(
				// Success Callback
				function ()
				{
					//NOTE: Here the order between then and always have changed, because when certain module wanted to disable nav buttons this always re-enable them!
					//Validate this change!
					self.save().always(function ()
					{
						self.enableNavButtons();
					}).done(function ()
					{
						self.wizard.goToNextStep();
					}).fail(function (error)
					{
						self.submitErrorHandler(error);
					});
				}
				// Error Callback
			,	function (error)
				{
					self.submitErrorHandler(error);
				}
			);
		}

		//Each time a next step is going to be rendered, it is asked if the step should be shown or not. In this way an entiere step can be skipped
		//This function acepts a wizard parameterø
	,	showStep: function ()
		{
			return _.some(
				_.filter(this.moduleInstances
				,	function (module_to_filter)
					{
						return !module_to_filter.options.exclude_on_skip_step;
					})
			,	function (module_instance)
				{
					return module_instance.isActive();
				});
		}

		// Change the label of the 'continue' button
	,	changeLabelContinue: function (label)
		{
			this._executeAfterRender(function()
			{
				this.wizard.application.getLayout().$('[data-action="submit-step"]').html(label || this.continueButtonLabel);
			}, this);

			this.changedContinueButtonLabel = label || this.continueButtonLabel;
		}

		// step.save
		// ---------
		// If there is a model calls the save function of it.
		// other ways it returns a resolved promise, to return something standard
	,	_save: function ()
		{
			if (this.wizard.model && this.currentModelState !== JSON.stringify(this.wizard.model))
			{
				return this.wizard.model.save().fail(function (jqXhr)
				{
					jqXhr.preventDefault = true;
				});
			}
			else
			{
				return jQuery.Deferred().resolveWith(this);
			}
		}

	,	save: function ()
		{
			return this._save();
		}

		// calls validation on all modules and call the error manager
	,	validate: function ()
		{
			var promises = [];
			_.each(this.moduleInstances, function (module_instance)
			{
				promises.push(
					module_instance.isValid()
				);
			});

			var self = this;
			jQuery.when.apply(jQuery, promises).fail(
				// Error Callback
				function (error)
				{
					self.wizard.manageError(error, self);
				}
			);
		}

		// step.disableNavButtons
		// ----------------------
		// Disables the navigation buttons
	,	disableNavButtons: function (options)
		{
			this._executeAfterRender(function()
			{
				var selector = '[data-action="edit-module"], ';
				if (!options || !options.onlyContinue)
				{
					selector += '[data-action="previous-step"], ';
				}

				if (!options || !options.notDisableTouchs)
				{
					selector += '[data-touchpoint], ';
				}

				if (!options || !options.notDisableBreads)
				{
					selector += '.breadcrumb a, .wizard-step-link a, ';
				}

				selector += ' [data-action="submit-step"]';

				this.wizard.application.getLayout().$(selector).attr('disabled', true);
			}, this);
		}

		//Show or hide the specified navigation button
	,	changeVisibleNavButtons: function (options)
		{
			this._executeAfterRender(function()
			{
				var selector = '';

				if (options.continueBtn)
				{
					selector = (selector ? ', ' : '') + '[data-action="edit-module"]';
				}

				if (options.backBtn)
				{
					selector += (selector ? ', ' : '') + '[data-action="previous-step"]';
				}

				this.wizard.application.getLayout().$(selector).css('display', options.visible ? 'block' : 'none');
			}, this);
		}

	,	enableNavButtons: function (options)
		{
			this._executeAfterRender(function()
			{
				var selector = '[data-action="edit-module"], ';
				if (!options || !options.onlyContinue)
				{
					selector += '[data-action="previous-step"], ';
				}

				if (!options || !options.notDisableTouchs)
				{
					selector += '[data-touchpoint], ';
				}

				if (!options || !options.notDisableBreads)
				{
					selector += '.breadcrumb a, .wizard-step-link a, ';
				}

				selector += ' [data-action="submit-step"]';

				this.wizard.application.getLayout().$(selector).attr('disabled', false);
			}, this);
		}

	,	_executeAfterRender: function (fn, ctx)
		{
			if (this.renderPromise.state() !== 'resolved')
			{
				this.renderPromise.done(_.bind(fn, ctx));
			}
			else
			{
				_.bind(fn, ctx)();
			}
		}

	,	getName: function ()
		{
			return this.name;
		}
	});
});