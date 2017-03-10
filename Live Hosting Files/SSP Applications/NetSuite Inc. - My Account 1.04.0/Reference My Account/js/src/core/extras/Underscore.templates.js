// Underscore.templates.js
// -----------------------
// Handles compiling for the templates
// Pre-compiles all of the macros
// Adds comments to the begining and end of each template/macro
// to make it easier to spot templates with development tools
(function ()
{
	'use strict';
	
	SC.handleMacroError = function (error, macro_name)
	{
		console.error('Error in macro: '+ macro_name + '\n' + error + '\n ' + error.stack);
	};
	
	SC.compileMacros = function compileMacros(macros)
	{
		// Exports all macros to SC.macros
		SC.macros = {};

		var context = {

			// registerMacro:
			// method used on every macro to define itself
			registerMacro: function (name, fn)
			{
				var original_source = fn.toString()
				,	prefix = isSeo() ? '' : '\\n\\n<!-- MACRO STARTS: ' + name + ' -->\\n'
				,	posfix = isSeo() ? '' : '\\n<!-- MACRO ENDS: ' + name + ' -->\\n'
					// Adds comment lines at the begining and end of the macro
					// The rest of the mumbo jumbo is to play nice with underscore.js
				,	modified_source = ';try{var __p="' + prefix + '";' + original_source.replace(/^function[^\{]+\{/i, '').replace(/\}[^\}]*$/i, '') +';__p+="' + posfix + '";return __p;}catch(e){SC.handleMacroError(e,"'+ name +'")}' || []
					// We get the parameters from the string with a RegExp
				,	parameters = original_source.slice(original_source.indexOf('(') + 1, original_source.indexOf(')')).match(/([^\s,]+)/g) || [];
				
				parameters.push(modified_source);
				
				// Add the macro to SC.macros
				SC.macros[name] = _.wrap(Function.apply(null, parameters), function (fn)
				{
					var result = fn.apply(this, _.toArray(arguments).slice(1)); 
					result = minifyMarkup(result);
					result = removeScripts(result);  
					return result;
				});
			}
		};
		
		// Now we compile de macros
		_.each(macros, function (macro)
		{
			try
			{
				// http://underscorejs.org/#template
				_.template(macro, context);
			}
			catch (e)
			{
				// if there's an arror compiling a macro we just
				// show the name of the macro in the console and carry on
				SC.handleMacroError(e, macro.substring(macro.indexOf('(') + 2, macro.indexOf(',') - 2));
			}
		});
	};

	// Template compiling and rendering.
	// We compile the templates as they are needed 
	var processed_templates = {};

	function template (template_id, obj)
	{
		// Makes sure the template is present in the template collection 
		if (!SC.templates[template_id])
		{
			throw new Error('Template \''+template_id+'\' is not present in the template hash :(');
		}
		
		try
		{
			// If the template hasn't been compiled we compile it and add it to the dictionary
			processed_templates[template_id] = processed_templates[template_id] || _.template(SC.templates[template_id] || '');
			var prefix = isSeo() ? '' : '\n\n<!-- TEMPLATE STARTS: '+ template_id +'-->\n'
			,	posfix = isSeo() ? '' : '\n<!-- TEMPLATE ENDS: '+ template_id +' -->\n'; 
			// Then we return the template, adding the start and end comment lines
			return prefix + processed_templates[template_id](_.extend({}, SC.macros, obj)) + posfix;
		}
		catch (err)
		{
			// This adds the template id to the error message so you know which template to look at
			err.message = 'Error in template '+template_id+': '+err.message;
			throw err;
		}
	}

	// This is the noop function declared on Main.js
	SC.template = template;


	// heads up! - we override the _.template function for removing scripts. 
	// Also we remove spaces and comments if the current runtime is the SEO engine for performance.
	// <script>s are removed for avoiding accidentally XSS injections on code evaluation using external values. 
	var SCRIPT_REGEX = /<\s*script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi

		// Recursively removes all the appearances of script tags from tempaltes&macros output - only for SEO output. Originally this was designed to prevent XSS attacks but now it is only for cleaning up SEO output. 
	,	removeScripts = function (text)
		{
			if (isSeo() && text)
			{
				text = text.replace(/(<!--[\s\S]*?-->)/g, ' $1 '); //invalidates de XSS attack like <scr<!--cheat-->ipt> - keep the comment and add spaces
				while (SCRIPT_REGEX.test(text))
				{
					text = text.replace(SCRIPT_REGEX, '');
				}
			}
			return text || '';
		}

		// Is the current JavaScript context the SEO engine ? 
	,	isSeo = function () 
		{
			return SC.ENVIRONMENT.jsEnvironment === 'server'; 
		}

		// minifyMarkup 
		// function that runs only in SEO and minifies templates&macros output, jQuery.html() and jQuery.append(). It minifies HTML output, remove comments and wrap images with noscript for performance. 
	,	minifyMarkup = function (text)
		{
			if (isSeo() && text)
			{
				text = text
					// remove spaces between tags.
					.replace(/\>\s+</g, '><')
					// remove html comments that our markup could have.
					.replace(/<!--[\s\S]*?-->/g, '')
					// replace multiple spaces with a single one.
					.replace(/\s+/g, ' ')

					// Performance: wrap all images with noscript if in SEO so the browser don't start loading the images when parsing the SEO markup.
					// We do this with a regexp instead using parsed object because of the SEO engine. The following regexp wrap all <img> tags 
					// with <noscript> only if they are not already wrapped. It supports the three formats: <img />, <img></img> and <img> 
					.replace(/(<img\s+[^>]*>\s*<\/img>|<img\s+[^>]*\/>|(?:<img\s+[^>]*>)(?!\s*<\/img>))(?!\s*<\s*\/noscript\s*>)/gmi,'<noscript>$1</noscript>');
			}
			return text || '';
		};  

	// if in SEO we also override jQuery.html() and jQuery.append() so html output is minified and images are wrapped with <noscript>. Also remove scripts - so content scripts don't appear in SEO output.
	if (isSeo())
	{
		var jQuery_originalHtml = jQuery.fn.html;
		jQuery.fn.html = function(html)
		{
			if (typeof html === 'string')
			{
				html = minifyMarkup(html);
				html = removeScripts(html);				
			}			
			return jQuery_originalHtml.apply(this, [html]);
		};

		var jQuery_originalAppend = jQuery.fn.append;
		jQuery.fn.append = function(html)
		{
			if (typeof html === 'string')
			{
				html = minifyMarkup(html);
				html = removeScripts(html);
			}			
			return jQuery_originalAppend.apply(this, [html]);
		};
	}

	// _.template
	// Patch to the _.template function that removes all the script tags in the processed template
	_.template_original = _.template;

	_.template = _.wrap(_.template, function(_template)
	{
		// Calls the original _.template(), wrap if neccesary and filter the output with minifyMarkup() and removeScripts()
		var compiled_or_executed_template = _template.apply(this, Array.prototype.slice.call(arguments, 1));
		
		// The original has two signatures - we override both _.template('', {}) and _.template('').apply(this, [{}]);
		// _.template(source), generates a compiled version of the template to be executed at later time
		if (typeof compiled_or_executed_template === 'function')
		{
			return _.wrap(compiled_or_executed_template, function(compiled_template_function)
			{
				var result = compiled_template_function.apply(this, Array.prototype.slice.call(arguments, 1)); 
				result = minifyMarkup(result);
				result = removeScripts(result); 
				return result;
			});
		}
		else
		{
			compiled_or_executed_template = minifyMarkup(compiled_or_executed_template);
			compiled_or_executed_template = removeScripts(compiled_or_executed_template); 
			return compiled_or_executed_template;
		}
	});

	
})();
