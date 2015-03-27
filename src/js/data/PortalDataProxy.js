/**
 * This class is designed to retrieve cBio Portal specific data on demand.
 *
 * @param options  additional options
 *
 * @author Selcuk Onur Sumer
 */
function PortalDataProxy(options)
{
	var self = this;

	// default options
	var _defaultOpts = {
		servletName: "portalMetadata.json"
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	// call super constructor to init options and other params
	AbstractDataProxy.call(this, _options);
	_options = self._options;

	// cache
	var _data = {};

	/**
	 * Initializes with full portal data. Once initialized with full data,
	 * this proxy class assumes that there will be no additional data.
	 *
	 * @param options   data proxy options
	 */
	function fullInit(options)
	{
		_data = options.data;
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
			else
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
			$.getJSON(_options.servletName,
			          queryParams,
			          processData);
		}
	}

	// override required base functions
	self.fullInit = fullInit;

	// class specific functions
	self.getPortalData = getPortalData;
}

// PdbDataProxy extends AbstractDataProxy...
PortalDataProxy.prototype = new AbstractDataProxy();
PortalDataProxy.prototype.constructor = PortalDataProxy;