/*jshint  laxcomma:true*/

define(['ExtrasUnderscoreTemplates', 'jasmineTypeCheck'], function ()
{
	'use strict';

	describe('Underscore.templates', function ()
	{

		beforeEach(function()
		{
			SC.templates = {macros: {}}; 
		});

		it('add shortcut methods for compiling templates and macros', function()
		{
			expect(SC.compileMacros).toBeA(Function);
			expect(SC.compileMacros.length).toBe(1);

			expect(SC.template).toBeA(Function);
			expect(SC.template.length).toBe(2);
		});

		it('_.template should only be called the first time a template is required', function()
		{
			spyOn(_, 'template').andCallThrough(); 
			expect(_.template).not.toHaveBeenCalled();

			SC.templates.foo_tmpl = 'hello <%=foo%>';
			var result = SC.template('foo_tmpl', {foo: 'foo'}); 
			expect(result.indexOf('hello foo') !== -1).toBe(true); 
			expect(_.template.callCount).toBe(1); 

			var result2 = SC.template('foo_tmpl', {foo: 'bar'});
			expect(result2.indexOf('hello bar') !== -1).toBe(true); 
			expect(_.template.callCount).toBe(1); 
		});

		it('should support macros callable from templates', function()
		{
			SC.templates.macros.myMacro = '<% registerMacro("myMacro", function (context) { %> <p>hello <%= context %></p> <% }); %>';
			SC.compileMacros(SC.templates.macros);

			SC.templates.example_with_macro_tmpl = 'template says: <%= myMacro("world") %>';
			var result = SC.template('example_with_macro_tmpl', {}); 
			expect(result.indexOf('hello world') !== -1).toBe(true); 
			expect(result.indexOf('template says') !== -1).toBe(true); 
		});

		it('should support macros callable from other macros using the syntax <%= SC.macros.myMacro(context) %>', function()
		{
			SC.templates.macros.myMacro = '<% registerMacro("myMacro", function (context) { %> <p>hello <%= context %></p> <% }); %>';
			SC.templates.macros.anotherMacro = '<% registerMacro("anotherMacro", function (context) { %> <p>greeting: <%= SC.macros.myMacro(context) %></p> <% }); %>';
			SC.compileMacros(SC.templates.macros);

			SC.templates.another_example_with_macro_tmpl = 'template says: <%= anotherMacro("Venus") %>';
			var result = SC.template('another_example_with_macro_tmpl', {}); 
			expect(result.indexOf('hello Venus') !== -1).toBe(true); 
			expect(result.indexOf('template says') !== -1).toBe(true); 
			expect(result.indexOf('greeting') !== -1).toBe(true); 
		});

		it('should delete any script tag resulted in a template evaluation in SEO only', function()
		{
			SC.ENVIRONMENT.jsEnvironment = 'server'; 

			SC.templates.macros.scriptMacro = '<% registerMacro("scriptMacro", function (scriptTag) { %> '+
				'<p><SCRIPT>var c=2;</sCript><<%= scriptTag%>>var c=3;</<%= scriptTag%>></p> <% }); %>';
			SC.compileMacros(SC.templates.macros);

			SC.templates.template_with_scripts_tmpl = '<p>something</p><script>var a = "script 1"; </script >'+			
				'<  script type = "text/javascript">var b = "script 2"< / script ><script src="script3.js"></script>'+
				'<scr<!-- y esto lo escapamos? -->ipt></script>var t="hello";</script>'+
				'<% var scriptTag = "script"; %><<%= scriptTag%>>var c=1;</<%= scriptTag%>><p>'+
				'&lt;script>this is not a script&lt;/script><SCRIPT></sCript><ScRiPt></script>'+
				'<%= /* call a macro that generates a script */ SC.macros.scriptMacro("script") %>';

			var result = SC.template('template_with_scripts_tmpl', {s: 'script'}); 
			expect(result.indexOf('<script>') === -1).toBe(true); 
			expect(result.indexOf('<scr<!-- y esto lo escapamos? -->ipt>') === -1).toBe(true);			
			expect(result.indexOf('<  script type = "text/javascript">') === -1).toBe(true); 
			expect(result.indexOf('&lt;script>') !== -1).toBe(true); 
			expect(result.indexOf('SCRIPT') === -1).toBe(true); 
			expect(result.indexOf('sCript') === -1).toBe(true); 
			expect(result.indexOf('ScRiPt') === -1).toBe(true); 
			
			SC.ENVIRONMENT.jsEnvironment = 'browser'; 
		});

		it('should minify the markup (seo only)', function()
		{
			SC.ENVIRONMENT.jsEnvironment = 'server'; 

			SC.templates.macros.anotherMacro2 = '<% registerMacro("anotherMacro2", function () { %> <p><!--html comments in macros should not be printed in seo--></p> <% }); %>';
			SC.compileMacros(SC.templates.macros);

			SC.templates.another_example_with_macro2_tmpl = 'template says: <%= anotherMacro2() %> <!--html comments in templates should not be printed in seo--> <div id="spaces-between-tags should be removed">  <p></p>  </div>';
			var result = SC.template('another_example_with_macro2_tmpl', {}); 
			expect(result).toBe('template says: <p></p><div id="spaces-between-tags should be removed"><p></p></div>'); 

			SC.ENVIRONMENT.jsEnvironment = 'browser'; 

			result = SC.template('another_example_with_macro2_tmpl', {}); 
			expect(result.indexOf('<!--html comments in macros') > 0).toBe(true); 
			expect(result.indexOf('<!--html comments in templates') > 0).toBe(true); 
			expect(result.indexOf('<div id="spaces-between-tags should be removed">  <p></p>  </div>') > 0).toBe(true);
		});

		it('should wrap <img> with <noscript> (seo only)', function()
		{
			SC.ENVIRONMENT.jsEnvironment = 'server'; 

			SC.templates.macros.anotherMacro3 = '<% registerMacro("anotherMacro3", function () { %> <img src="1"/> <img src="2"></img> <img src="3"><% }); %>';
			SC.compileMacros(SC.templates.macros);

			SC.templates.another_example_with_macro3_tmpl = 'template says: <%= anotherMacro3() %> <noscript><img src="already wrapped1"></img></noscript><noscript><img src="already wrapped2"/></noscript><noscript><img src="already wrapped3"></noscript>';
			var result = SC.template('another_example_with_macro3_tmpl', {}); 
			
			expect(result).toBe('template says: <noscript><img src="1"/></noscript><noscript><img src="2"></img></noscript><noscript><img src="3"></noscript><noscript><img src="already wrapped1"></img></noscript><noscript><img src="already wrapped2"/></noscript><noscript><img src="already wrapped3"></noscript>'); 
			
			SC.ENVIRONMENT.jsEnvironment = 'browser'; 

			result = SC.template('another_example_with_macro3_tmpl', {}); 
			expect(result.indexOf('<img src="1"/> <img src="2"></img> <img src="3">') > 0).toBe(true); 
		});

	});
});
