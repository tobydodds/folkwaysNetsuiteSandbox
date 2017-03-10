/* global nsglobal */
// ItemDetails.Router.js
// ---------------------
// Adds route listener to display Product Detailed Page
// Parses any options pased as parameters
define('ItemDetails.Router', function()
{
	'use strict';
	
	return Backbone.Router.extend({
		
		routes: {
			':url': 'productDetailsByUrl'
		}
		
	,	initialize: function (options)
		{
			this.application = options.application;
			// we will also add a new regexp route to this, that will cover any url with slashes in it so in the case
			// you want to handle urls like /cat1/cat2/urlcomponent, as this are the last routes to be evaluated,
			// it will only get here if there is no other more apropiate one
			this.route(/^(.*?)$/, 'productDetailsByUrl');
			this.Model = options.model;
			this.View = options.view;
			
			// This is the fallback url if a product does not have a url component.
			this.route('product/:id', 'productDetailsById');
			this.route('product/:id?:options', 'productDetailsById');
		}
		
	,	productDetailsByUrl: function (url)
		{
			if (!url) 
			{
				return;
			}

			// if there are any options in the URL
			var options = null;

			if (~url.indexOf('?'))
			{
				options = SC.Utils.parseUrlOptions(url);
				url = url.split('?')[0];
			}
			// Now go grab the data and show it
			if (options)
			{
				this.productDetails({url: url}, url, options);				
			}
			else
			{
				this.productDetails({url: url}, url);				
			} 
		}
		
	,	productDetailsById: function (id, options)
		{
			// Now go grab the data and show it
			this.productDetails({id: id}, '/product/'+id, SC.Utils.parseUrlOptions(options));
		}
		
	,	productDetails: function (api_query, base_url, options)
		{
			// Decodes url options 
			_.each(options, function (value, name)
			{
				options[name] = decodeURIComponent(value);
			});

			var application = this.application
			,	model = new this.Model()
				// we create a new instance of the ProductDetailed View
			,	view = new this.View({
					model: model
				,	baseUrl: base_url
				,	application: this.application
				});

			model.application = this.application;
			model.fetch({
				data: api_query
			,	killerId: this.application.killerId
			,	pageGeneratorPreload: true
			}).then(
				// Success function
				function (data)
				{
					if (!model.isNew())
					{
						// once the item is fully loaded we set its options
						model.parseQueryStringOptions(options);
						
						if (!(options && options.quantity))
						{
							model.set('quantity', model.get('_minimumQuantity'));
						}

						if (api_query.id && model.get('urlcomponent') && SC.ENVIRONMENT.jsEnvironment === 'server')
						{
							nsglobal.statusCode = 301;
							nsglobal.location = model.get('_url') + model.getQueryString();
						}						

						if (data.corrections && data.corrections.length > 0)
						{
							if (model.get('urlcomponent') && SC.ENVIRONMENT.jsEnvironment === 'server')
							{
								nsglobal.statusCode = 301;
								nsglobal.location = '/' + data.corrections[0].url + model.getQueryString();
							}
							else
							{
								Backbone.history.navigate('#' + data.corrections[0].url + model.getQueryString(), {trigger: true});
							}
						}
						
						// we first prepare the view
						view.prepView();
						
						// then we show the content
						view.showContent(options);
					}
					else
					{
						// We just show the 404 page
						application.getLayout().notFound();
					}
				}
				// Error function
			,	function (model, jqXhr)
				{	
					// this will stop the ErrorManagment module to process this error
					// as we are taking care of it
					try
					{
						jqXhr.preventDefault = true;
					}
					catch (e)
					{						
						// preventDefault could be readonly!
						console.log(e.message);
					}

					// We just show the 404 page
					application.getLayout().notFound();
				}
			);
		}
	});
});
