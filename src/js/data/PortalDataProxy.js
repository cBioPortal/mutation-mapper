/**
 * This class is designed to retrieve cBio Portal specific data on demand.
 *
 * @param options  additional options
 *
 * @author Selcuk Onur Sumer
 */
function PortalDataProxy(options)
{
	// default options
	var _defaultOpts = {};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	var _servletName;
	var _fullInit;

	// cache
	var _data = {};

	/**
	 * Initializes the proxy without actually grabbing anything from the server.
	 * Provided servlet name will be used later.
	 *
	 * @param servletName   name of the portal data servlet (used for AJAX query)
	 */
	function lazyInit(servletName)
	{
		_servletName = servletName;
		_fullInit = false;
	}

	/**
	 * Initializes with full portal data. Once initialized with full data,
	 * this proxy class assumes that there will be no additional data.
	 *
	 * @param portalData  full portal data
	 */
	function fullInit(portalData)
	{
		//assuming the given data is a map of <gene, sequence data> pairs
		_data = portalData;

		_fullInit = true;
	}

	function getPortalData(servletParams, callback)
	{
		// for each servlet param, retrieve data (if not cached yet)
		var metadata = {};
		var queryParams = {};

		_.each(_.keys(servletParams), function(key, idx) {
			// not cached yet
			if (_data[key] == null)
			{
				// update query params
				queryParams[key] = servletParams[key];
			}
			// already cached
			{
				// get data from cache
				metadata[key] = _data[key];
			}
		});

		var processData = function(data)
		{
			// update the cache
			_.each(_.keys(data), function(key, idx) {
				_data[key] = data[key];
			});

			// forward data to the callback function
			if(_.isFunction(callback))
			{
				callback(jQuery.extend(true, {}, metadata, data));
			}
		};

		// TODO full init...

		// everything is cached
		if (_.isEmpty(queryParams))
		{
			// just forward
			processData(metadata);
		}
		else
		{
			// retrieve data from the servlet
			$.getJSON(_servletName,
			          queryParams,
			          processData);
		}
	}

	return {
		initWithData: fullInit,
		initWithoutData: lazyInit,
		getPortalData: getPortalData
	};
}
