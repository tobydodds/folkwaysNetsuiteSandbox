/* ====================================================================
 * MENU TREE WIDGET
 * ==================================================================== */

!function ($) {

	'use strict';

	/* MENU TREE CLASS DEFINITION
	 * ======================= */

	var Tree = function (el, options) {
		this.id = $(el).data('id');
		this.element = el;
		this.init(el,options);
	};

	Tree.prototype = {

		init: function (el, options)
		{
			var $el = $(el);

			$('[data-type="sub-menu"]', $el).hide();

			$('div.expandable', $el).click( function (e) 
			{
				if (!e.target.href || e.target.href === '')
				{
					var $this = $(this)
					,	check_element = $this.next();
					if ((check_element.is('ul')) && (check_element.is(':visible')))
					{
						check_element.slideUp('normal');
						check_element.removeClass('tree-expanded');
						$this.find('i').removeClass('icon-chevron-down').addClass('icon-chevron-right');
						$this.removeClass('is-last-item');
						return false;
					}
					if ((check_element.is('ul')) && (!check_element.is(':visible')))
					{
						check_element.slideDown('normal');
						check_element.addClass('tree-expanded');
						$this.find('i').removeClass('icon-chevron-right').addClass('icon-chevron-down');
						$this.addClass('is-last-item');
						return false;
					}
				}
			});
		
			$('li > a', $el).click(function ()
			{
				$('li', $('[data-toggle="tree"]')).removeClass('tree-active');
				$('[data-toggle="tree"]').removeClass('active');
				$el.addClass('active');
				$(this).closest('li').addClass('tree-active');
				$(this).parentsUntil($el, 'ul').closest('li').addClass('tree-active'); 
			});

			if(options)
			{
				this.updateUI(options);
			}
		}

		// updates ui options
	,	updateUI: function (options)
		{
			var $el = $(this.element);
			$(options.expanded).each(function ()
			{
				$('[data-id="' + this + '"] ul:first()',$el.parent()).slideDown('normal');
				$('[data-id="' + this + '"] ul:first()',$el.parent()).addClass('tree-expanded');
				$('[data-id="' + this + '"] i:first()',$el.parent()).removeClass('icon-chevron-right').addClass('icon-chevron-down');
			});
			
			if(options.active && options.active.length > 0)
			{
				$('.tree-active',$el).removeClass('tree-active');
				$el.addClass('active');
				$(options.active).each(function ()
				{
					$('[data-id="' + this + '"]',$el.parent()).addClass('tree-active');
				});
			}
		}

		// get the expanded sub-menus ids
	,	getExpanded: function ()
		{
			var $el = $(this.element);
			var expanded_ids = _($('.tree-expanded', $el).closest('li')).map(function (elem)
			{
				return $(elem).data('id');
			});
			return expanded_ids;
		}

		// get the active items
	,	getActive: function ()
		{
			var $el = $(this.element);
			var active_ids = _($('.tree-active', $el).closest('li')).map(function (elem)
			{
				return $(elem).data('id');
			});
			return active_ids;
		}

	};

	// TREE PLUGIN DEFINITION
	// ========================

	// standar jQuery plugin definition
	$.fn.tree = function (options)
	{
		return this.each(function ()
		{			
			var $this = $(this)
			,	data = $this.data('tree');

			// if it wasn't initialized, we do so
			if (!data) 
			{
				$this.data('tree', (data = new Tree(this, options)));	
			}
		});
	};

	$.fn.tree.Constructor = Tree;

} (window.jQuery);