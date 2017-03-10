define('TestHelper', ['ItemsKeyMapping', 'ItemDetails.Model', 'jasmine', 'Application', 'jasmineTypeCheck'], function (ItemsKeyMapping, ItemDetailsModel)
{
	'use strict';

	return (function ()
	{
		/*

		Constructor
		
		options.applicationName - String - name of the application to be used. Default: testApplication + random number between 0 and 100
		options.applicationConfiguration - Object - configuration of the application, default value: {}
		options.useItemKeyMapping - Boolean - determine if necessary load the ItemsKeyMapping. This is used when you have a view that have items.
		options.loadTemplates - Boolean - determine if you want or not load the templates defined by the manifest.txt file
		options.startApplication - Boolean || Function - option to start the application, if the option is a function, this function is used as callback when the application is started.
		options.mountModules - Array - List of modules that should be loaded when application start.
		options.environment - Object - defines the object SC.ENVIRONMENT used for the tests, default value {}
		options.simpleLayout - Boolean - replace the layout template with a version simple, use this options if you have error when call the funcion showContent (view or layout)

		*/
		var TestHelper = function (options)
		{
			var self = this;
			this.is_started = false;
			this.layout;
			this.initialization_completed = false;
			this.options = options || {};

			this.rootPath = options.rootPath || '../../../../../';


			SC.ENVIRONMENT = this.options.environment ? this.options.environment : {};

			// add the baseUrl value if not defined, this value is used by Utils.js
			SC.ENVIRONMENT.baseUrl = SC.ENVIRONMENT.baseUrl ? SC.ENVIRONMENT.baseUrl : '/test/app/{{file}}';

			// create the application - if no name, using a random value.
			this.application = SC.Application(this.options.applicationName || 'testApplication' + '-' + _.random(0, 100));

			this.application.Configuration = this.options.applicationConfiguration || {};

			if (!this.application.Configuration.siteSettings)
			{
				this.application.Configuration.siteSettings = SC.ENVIRONMENT.siteSettings || {};
			}

			if (this.options.mountModules && _.isArray(this.options.mountModules))
			{
				if (!this.application.Configuration.modules)
				{
					this.application.Configuration.modules = [];
				}

				this.application.Configuration.modules = _.union(this.application.Configuration.modules, this.options.mountModules);
			}

			if (this.options.useItemKeyMapping)
			{
				ItemsKeyMapping.mapAllApplications();
				ItemDetailsModel.prototype.keyMapping = this.application.getConfig('itemKeyMapping', {});
			}

			if (this.options.loadTemplates)
			{
				this.loadTemplates(this.rootPath);
			}

			if (this.options.simpleLayout)
			{
				if (!SC.templates)
				{
					SC.templates = {};
				}
				SC.templates.layout_tmpl = '<div id="content"></div>';
			}

			if (this.options.startApplication)
			{
				// redefine the method it. 
				var original_it = it;

				it = function (description, original_fn)
				{
					// add a wait function, the test run after application start.
					original_fn = _.wrap(original_fn, function()
					{
						
						waitsFor(function()
						{
							return self ? self.is_started : true;
						});
					});
					// call the original it function.
					original_it(description, original_fn);
				};

				jQuery(this.application.start(function()
				{
					// callback function.
					if (_.isFunction(self.options.startApplication))
					{
						self.options.startApplication(self.application);
					}
					self.is_started = true;
				}));
			}
			else
			{
				this.is_started = true;	
			}

		};


		TestHelper.prototype.testViewSelectors = function (view, asserts, data, test_description)
		{
			describe(test_description || ('Model ID: ' +  (data.internalid || data.id)), function()
			{

				_.each(asserts, function(assert)
				{
					if (!assert)
					{
						return;
					}
					
					var attribute
					,	actual;
					
					if (_.isFunction(assert.actual))
					{
						actual =  assert.actual(view);
					}
					else
					{
						attribute = assert.attribute || 'text';

						switch (attribute)
						{
							case 'checked':
								actual = view.$(assert.selector).prop('checked');
								break;
							case 'disabled':
								actual = view.$(assert.selector).prop('disabled');
								break;
							default:
								actual = view.$(assert.selector)[attribute]();
						}
					}

					var	result = _.isFunction(assert.result) ? assert.result(data) : assert.result 
					,	is_not = (assert.operation && assert.operation.indexOf('not.') === 0)
					,	operation = (assert.operation && assert.operation.replace('not.', '')) || 'toBe'
					,	description = (_.isFunction(assert.actual) ? assert.actual.toString() : ('$(\'' + assert.selector + '\').' + attribute + '()') );

					description += (is_not ? ' not ' : ' ');
					description += operation + ' ';
					description += _.isFunction(assert.result) ? assert.result.toString() : (assert.hasOwnProperty('result') ? (assert.result === '' ? '\'\'' : assert.result) : '');

					if (attribute === 'text' || attribute === 'html')
					{
						result = result ? (result + '') : result;
					}

					it(description, function()
					{
						var exp = is_not ? expect(actual).not : expect(actual);
						exp[operation](result);
					});

				});
			});
		};

		TestHelper.prototype.loadTemplates = function(rootPath)
		{
			rootPath = rootPath || this.rootPath;
			//Download and compile all templates and macros
			jQuery.ajax({ url: rootPath + 'manifest.txt', async: false, dataType: 'html'}).done(function (data)
			{

				SC.templates = { macros: [] };

				var lines = data.split('\n');

				_.each(lines, function(line)
				{
					if (~line.indexOf(' metataghtml="'))
					{
						var values = line.split(' metataghtml="')
						,	file_path = values[0]
						,	tag = values[1] && values[1].replace(/[\s"]/gi,'');



						jQuery.ajax({url: rootPath + file_path, async: false}).done(function (template)
						{
							if (tag === 'macro')
							{
								SC.templates.macros.push(template);
							}
							else
							{
								SC.templates[tag] = template;
							}
						});
					}
				});

				SC.compileMacros(SC.templates.macros);
			});
		};

		TestHelper.prototype.testModelValidations = function (model, test, test_description)
		{
			var result = test.result;

			describe(test_description || ('Model ID: ' +  (model.internalid || model.id || model.get('id') || model.get('internalid'))), function()
			{

				model = _.extend(model, Backbone.Validation.mixin);

				_.each(result.invalidFields, function(invalidField)
				{
					it('the field ' + invalidField + ' should be invalid', function()
					{
						expect(model.isValid(invalidField)).toBe(false);
						
					});
				});

				_.each(result.validFields, function(validField)
				{
					it('the field ' + validField + ' should be valid', function()
					{
						expect(model.isValid(validField)).toBe(true);
						
					});
				});

			
			});
		};

		
		return TestHelper;
	})();

});