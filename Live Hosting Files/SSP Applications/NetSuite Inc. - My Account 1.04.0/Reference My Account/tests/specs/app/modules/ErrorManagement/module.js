/*jshint laxcomma:true*/
define(['ErrorManagement', 'Application'], function (ErrorManagement)
{
	'use strict';

	return describe('ErrorManagement Module', function ()
	{
		var application = SC.Application('ErrorManagementTest')
		,	layout = application.getLayout();

		ErrorManagement.mountToApp(application);

		describe('Extends the layout with error handling methods', function ()
		{
			it('page not found', function ()
			{
				expect(layout.notFound).toBeDefined();
			});

			it('internal server error', function ()
			{
				expect(layout.internalError).toBeDefined();
			});

			it('expired link', function ()
			{
				expect(layout.expiredLink).toBeDefined();
			});

			it('forbidden', function ()
			{
				expect(layout.forbiddenError).toBeDefined();
			});

			it('unauthorized error', function ()
			{
				expect(layout.unauthorizedError).toBeDefined();
			});
		});

		describe('When an ajax error occurs, the handler is called based on the response status', function ()
		{
			var triggered = false;

			beforeEach(function ()
			{
				triggered = false;
			});

			it('401 triggers unauthorizedError', function ()
			{
				spyOn(layout, 'unauthorizedError');

				jQuery.ajax({
					url: '/401'
				,	killerId: _.uniqueId('ajax_killer_')
				,	error: function (jqXhr)
					{
						jqXhr.status = 401;
						triggered = true;
					}
				});

				waitsFor(function ()
				{
					return triggered;
				}, 'Error should have been triggered', 4000);

				runs(function ()
				{
					expect(layout.unauthorizedError).toHaveBeenCalled();
				});
			});

			it('403 triggers forbiddenError', function ()
			{
				spyOn(layout, 'forbiddenError');
				
				jQuery.ajax({
					url: '/403'
				,	killerId: _.uniqueId('ajax_killer_')
				,	error: function (jqXhr)
					{
						jqXhr.status = 403;
						triggered = true;
					}
				});

				waitsFor(function ()
				{
					return triggered;
				}, 'Error should have been triggered', 4000);

				runs(function ()
				{
					expect(layout.forbiddenError).toHaveBeenCalled();
				});
			});

			it('404 triggers notFound', function ()
			{
				spyOn(layout, 'notFound');
				
				jQuery.ajax({
					url: '/404'
				,	killerId: _.uniqueId('ajax_killer_')
				,	error: function (jqXhr)
					{
						jqXhr.status = 404;
						triggered = true;
					}
				});

				waitsFor(function ()
				{
					return triggered;
				}, 'Error should have been triggered', 4000);

				runs(function ()
				{
					expect(layout.notFound).toHaveBeenCalled();
				});
			});

			it('Anything else triggers internalError', function ()
			{
				spyOn(layout, 'internalError');
				
				jQuery.ajax({
					url: '/500'
				,	killerId: _.uniqueId('ajax_killer_')
				,	error: function (jqXhr)
					{
						jqXhr.status = 500;
						triggered = true;
					}
				});

				waitsFor(function ()
				{
					return triggered;
				}, 'Error should have been triggered', 4000);

				runs(function ()
				{
					expect(layout.internalError).toHaveBeenCalled();
				});
			});
		});
	});
});