/*!
* Description: SuiteCommerce Reference My Account
*
* @copyright (c) 2000-2013, NetSuite Inc.
* @version 1.0
*/

// Application.js
// --------------
// Extends the application with My Account specific core methods

/*global _:true, SC:true, jQuery:true*/

(function (MyAccount)
{
	'use strict';

	// Stores a reference of some functions that we will be overriding later
	var originalLayoutShowContent = MyAccount.Layout.prototype.showContent
	,	originalInitialize = MyAccount.Layout.prototype.initialize
	,	originalRender = MyAccount.Layout.prototype.render;

	// Extends the layout of my Account
	MyAccount.Layout = MyAccount.Layout.extend({

		// Register the global key Elements, in this case the sidebar and the breadcrum
		key_elements: {
			sidebar: '#sidebar'
		,	breadcrumb: '#breadcrumb'
		}

	,	initialize: function ()
		{
			this.fixedMenuItems = this.getFixedMenuItems();
			originalInitialize.apply(this, arguments);
		}

		// showContent:
		// Extends the original show content and
		// adds support to update the sidebar and the breadcrumb
	,	showContent: function (view, selectedMenu, crumbtrail, dont_scroll)
		{
			originalLayoutShowContent.call(this, view, dont_scroll);
			this.updateCrumbtrail(crumbtrail);
			this.updateSidebar(selectedMenu);
			return jQuery.Deferred().resolveWith(this, [view]);
		}

		// updateCrumbtrail:
		// Recives a collection of pages, runs the breadcrumb macro and updates the layout
	,	updateCrumbtrail: function (pages)
		{
			if (!_.isArray(pages))
			{
				pages = [pages];
			}

			pages.unshift({
				href: '#'
			,	'data-touchpoint': 'home'
			,	'data-hashtag': '#'
			,	text: _('Home').translate()
			}, {
				href: '#'
			,	'data-touchpoint': 'customercenter'
			,	'data-hashtag': '#overview'
			,	text: _('My Account').translate()
			});

			this.$breadcrumb.empty().append(
				SC.macros.breadcrumb(pages)
			);
		}

	,	hideBreadcrumb: function ()
		{
			this.$breadcrumb.empty();
		}

		// updateSidebar:
		// Sets the active link in the menu (handles active links on tree menus)
	,	updateSidebar: function (label)
		{
			var current_menu = this.$sidebar.children().removeClass('active').filter(function ()
			{
				return jQuery(this).data('label') === label;
			});

			if (current_menu && current_menu.length > 0)
			{
				// standard menu item
				current_menu.addClass('active');
			}
			else
			{
				// tree menu child case:
				// - remove all active classes
				// - add tree-active class to current selected item and its li parents
				// - add active class to the parent li on the menu
				jQuery('[data-type="tree"] li', this.$sidebar).removeClass('tree-active');
				var current_menu_item = this.$sidebar.find('[data-label="' + label + '"]');
				current_menu_item.addClass('tree-active');

				var current_menu_item_parents_until = current_menu_item.parentsUntil(this.$sidebar, 'ul');

				// set actives
				var current_menu_list = current_menu_item_parents_until.closest('li');
				current_menu_list.addClass('tree-active');
				current_menu_list.first().addClass('active');

				// expand
				current_menu_list.find('i').removeClass('icon-chevron-right').addClass('icon-chevron-down');
				current_menu_item_parents_until.slideDown('normal');
				current_menu_item_parents_until.addClass('tree-expanded');
			}
		}

		// Wraps the SC.Utils.resizeImage and passes in the settings it needs
	,	resizeImage: function (url, size)
		{
			var mapped_size = this.getConfig('imageSizeMapping.'+ size, size);
			return SC.Utils.resizeImage(this.getConfig('siteSettings.imagesizes', []), url, mapped_size);
		}

	,	render: function ()
		{
			// menuitem fixing is done at render time so render-time customizations are allowed.
			// this.menuItems are the original menu items declarations, for rendering we will build & use fixed cloned version this.fixedMenuItems
			this.fixedMenuItems = this.getFixedMenuItems();

			// get trees' current information (expanded sub-menus)
			var previous_state = [];

			if (this.trees)
			{
				this.trees.each(function ()
				{
					var current_tree = jQuery(this).data('tree');

					if (current_tree)
					{
						previous_state.push({
							id: current_tree.id
						,	expanded: current_tree.getExpanded()
						,	active: current_tree.getActive()
						});
					}
				});
			}

			originalRender.apply(this, arguments);

			// Invoke tree menu control
			this.trees = this.$('[data-toggle="tree"]').each(function ()
			{
				var options = _.findWhere(previous_state, {id: jQuery(this).data('id')});
				jQuery(this).tree(options);
			});
		}

		// menuItems.
		// My Account has support for a gloabally accesible Menu. See *MenuItem methods.
		// Modules are able to publish their own menu entries without the need to update a central list
		// The format of a menu item is the following. Note that all property values support a function
		// that accepts this application and returns the native value (useful for dynamic values):
		//
		// id: 'mymodule1'
		//
		// name: _('My Module 1').translate() // the label for this module.
		//
		// url: 'mymodule1' // if not null the item will be represented with an anchor that will navigate
		//		to this url. If falsy there will be no navigation for this item (useful for multi-level menues).
		//
		// index: 9 // index number in the menu from top to bottom, lower values are on top.
		//
		// children: // [{name: 'Child1', url: '/child1'}, ...] an array of children menu items. Notice that,
		//		for children declarations, all these properties are taken in account recursively, including
		//		'index' and more (sub)'childrens'. By default, this is presented in a tree-view.
	,	menuItems: []

		// while this.menuItems are the original user values (that can contain functions yet to evaluate)
		// this.fixedMenuItems = this.getFixedMenuItems() is a clone of the entire tree but with the fixed
		// values and sorted, this is, with functions already evaluated so safe to use in the UI.
		// Notice that this calculation is made in render() so dynamic re-calcalculations are supported. See this.updateMenuItemsUI()
	,	getFixedMenuItems: function ()
		{
			var self = this
			,	fixed = null
			,	parent = null
			,	parsed_menu_items = []
			,	menu_items_with_parent = [];

			_.each(this.menuItems, function (item)
			{
				// we are ignoring no-value menu item definitions
				fixed = item && self.fixMenuItems(item);

				if (fixed)
				{
					parsed_menu_items.push(fixed);

					if (fixed.parent)
					{
						menu_items_with_parent.push(fixed);
					}
				}
			});

			// Add outsider children to parent menu items.
			_.each(menu_items_with_parent, function (menu_item)
			{
				parent = _.findWhere(parsed_menu_items, {
					id: menu_item.parent
				});

				if (parent)
				{
					if (!_.findWhere(parent.children, {id: menu_item.id}))
					{
						parent.children.push(menu_item);
					}

					parsed_menu_items = _.without(parsed_menu_items, menu_item);
				}
			});

			return this.sortMenuItems(parsed_menu_items);
		}

		// getMenuItems:
		// returns the menu items array
	,	getMenuItems: function ()
		{
			return this.fixedMenuItems;
		}

		// sortMenuItems:
		// sorts menu items by index and then by name
	,	sortMenuItems: function (menuItems)
		{
			return menuItems.sort(function (item1, item2)
			{
				// TODO: the commented return statement won't work on Safary because of its buggy sort method.
				// return (item1.index !== item2.index) ? (item1.index - item2.index) : (item1.name > item2.name);
				if (item1.index !== item2.index)
				{
					return item1.index - item2.index;
				}
				else
				{
					return item1.name > item2.name ? 1 : -1;
				}
			});
		}

		// addMenuItem:
		// Appends an menu item to the collection
	,	addMenuItem: function (items)
		{
			var self = this;

			items = _.isArray(items) ? items : [items];

			_.each(items, function (item)
			{
				self.menuItems.push(item);
			});
		}

		// fixMenuItems recursive !
	,	fixMenuItems: function (item_)
		{
			var self = this
			,	item = self.fixMenuItem(item_);

			if (item && _.isArray(item.children))
			{
				_.each(item.children, function (item)
				{
					self.fixMenuItems(item);
				});
			}

			return item;
		}

		// every menu item config property is evaluated using this function.
	,	menuItemValue: function (value)
		{
			return _.isFunction(value) ? value.apply(this, [this.application]) : value;
		}

		// fixMenuItem
		// normalizes the passed menuitem object setting its properties to its native types.
	,	fixMenuItem: function (item_)
		{
			var item = null;

			item_ = this.menuItemValue(item_);

			if (!item_)
			{
				return undefined;
			}

			item = _.clone(item_);

			item.parent = this.menuItemValue(item.parent);
			item.name = this.menuItemValue(item.name);
			item.index = this.menuItemValue(item.index);
			item.url = this.menuItemValue(item.url);
			item.id = this.menuItemValue(item.id);
			item.children = this.menuItemValue(item.children) || [];

			return item;
		}

		// removeMenuItem:
		// Removes the item from the menu
	,	removeMenuItem: function (id)
		{
			this.menuItems = _.reject(this.menuItems, function (item)
			{
				return item.id === id;
			});
		}

		// re-render the menu items menu - useful for dynamic menu items that need to re-render when something changes. Each module is responsible of calling this method when appropiate.
	,	updateMenuItemsUI: function ()
		{
			this.render();
			var currentView = this.currentView;
			if (currentView)
			{
				currentView.getViewLabel ? currentView.showContent(currentView.getViewLabel()) : currentView.showContent();

				//TODO: neccessary when the view that triggers chages that require re-render menuitems is on a modal
				jQuery('.modal-backdrop').remove();
				jQuery('body').removeClass('modal-open');
			}
		}

		// Given a filter, replaces an existing menu item with a new one
	,	replaceMenuItem: function(filter, new_menu_item)
		{
			for (var i = 0; i < this.menuItems.length; i++)
			{
				if (filter(this.fixMenuItem(this.menuItems[i])))
				{
					this.menuItems[i] = new_menu_item;
				}
			}
		}
	});

	MyAccount.start = _.wrap(MyAccount.start, function(fn)
	{
		var wizard_modules = _(this.getConfig('paymentWizardSteps')).chain().pluck('steps').flatten().pluck('modules').flatten().value();

		wizard_modules = _.uniq(wizard_modules);

		this.Configuration.modules = _.union(this.getConfig('modules'), wizard_modules);

		fn.apply(this, _.toArray(arguments).slice(1));
	});


	// Once Modules are loaded this checks if they are exporting a menu entry and if so
	// this adds it to the array of menu entries
	MyAccount.on('afterModulesLoaded', function (application)
	{
		_.each(MyAccount.modules, function (module)
		{
			if (module)
			{
				if (module.MenuItems)
				{
					application.getLayout().addMenuItem(module.MenuItems);
				}
			}
		});
	});

	// Wraps the SC.Utils.resizeImage and passes in the settings it needs
	_.extend(MyAccount, {
		resizeImage: function (url, size)
		{
			var mapped_size = MyAccount.getConfig('imageSizeMapping.'+ size, size);
			return SC.Utils.resizeImage(MyAccount.getConfig('siteSettings.imagesizes', []), url, mapped_size);
		}
	});

	// Setup global cache for this application
	jQuery.ajaxSetup({cache:false});

	// TODO: relocate this line (in Shopping and MyAccount)
	// It triggers main nav collapse when any navigation occurs
	Backbone.history.on('all', function ()
	{
		jQuery('.main-nav.in').collapse('hide');
	});


	// TODO: the following should be on a separate file.
	var layout = MyAccount.getLayout();

	_.extend(layout,
	{
		itemsExpander: function (e)
		{
			e.preventDefault();

			jQuery(e.currentTarget)
				.parent().find('[data-action="items-expander"] a i').toggleClass('icon-minus').end()
				.find('[data-content="items-body"]').stop().slideToggle();
		}
	});

	_.extend(layout.events,
	{
		'click [data-action="items-expander"]' : 'itemsExpander'
	});

})(SC.Application('MyAccount'));
