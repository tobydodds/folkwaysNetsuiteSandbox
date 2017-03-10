/*jshint  laxcomma:true*/

define(['MenuTree'], function ()
{
	'use strict';

	describe('MenuTree.js', function ()
	{
		var control
		,	menu;

		beforeEach(function ()
		{
			control = '<li data-id="root" data-type="tree" data-toggle="tree"><div class="expandable"><a><i></i></a></div><ul class="tree-level-1"><li data-id="child1"><a href="/child1"><a/></li><li data-id="child2"><a href="/child2"><a/></li><li data-id="child3"><a href="/child3"><a/></li></ul></li>';
			menu = '<ul></ul>';
		});

		it('Setup: jQuery plugin definition', function(){
			var tree = $(control).tree()
			,	tree_control = tree.data('tree');

			expectPluginDefinition(tree_control);
		});

		it('Initialize: data("tree") should be defined', function ()
		{
			var tree = $(control).tree()
			,	tree_control = tree.data('tree');

			expectCorrectInit(tree_control);
		});

		it('getExpanded: list of expanded ids', function ()
		{
			var tree = $(control).tree()
			,	tree_control = tree.data('tree');

			expectExpanded(tree_control, 1);
		});

		it('getActive: list of active ids', function ()
		{
			var tree = $(control).tree()
			,	tree_control = tree.data('tree');

			expectActive(tree_control, 1);
		});

		it('Setup: support multiple dom elements', function(){
			var control2 = '<li data-id="root2" data-type="tree" data-toggle="tree"><div class="expandable"><a><i></i></a></div><ul class="tree-level-1"><li data-id="child1"><a href="/child1"><a/></li><li data-id="child2"><a href="/child2"><a/></li><li data-id="child3"><a href="/child3"><a/></li></ul></li>';
			var $menu = $(menu).append(control).append(control2);
			
			var trees = $menu.find('[data-toggle="tree"]').tree();
			
			expect(trees.length).toBe(2);

			trees.each(function (){
				var tree_control = $(this).data('tree');
				expectPluginDefinition(tree_control);
				expectCorrectInit(tree_control);
				expectExpanded(tree_control,1);
				expectActive(tree_control,1);
			});
		});	

		function expectPluginDefinition (tree)
		{
			expect(tree instanceof $.fn.tree.Constructor).toBeTruthy();
		}

		function expectCorrectInit(tree)
		{
			expect(tree).toBeDefined();
			expect(tree.id).toBeDefined();
			expect(tree.element).toBeDefined();
			expect(tree.init instanceof Function).toBeTruthy();
		}

		function expectExpanded(tree, expectedCount)
		{			
			$('div.expandable:first()', $(tree.element)).trigger('click');	
			var expected_expanded = tree.getExpanded();
			expect(expected_expanded.length).toBe(expectedCount);
		}

		function expectActive(tree, expectedCount)
		{
			$('[data-id="child1"] a:first()', $(tree.element)).trigger('click');
			var expected_actives = tree.getActive();
			expect(expected_actives.length).toBe(expectedCount);	
		}
	});
});
