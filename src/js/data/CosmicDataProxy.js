/**
 * This class is designed to retrieve COSMIC data on demand.
 *
 * @param options  additional options
 *
 * @author Selcuk Onur Sumer
 */
function CosmicDataProxy(options)
{
	// default options
	var _defaultOpts = {};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	// name of the COSMIC data servlet
	var _servletName;

	// flag to indicate if the initialization is full or lazy
	var _fullInit;

	// data cache built on mutation keyword
	var _cache;

	/**
	 * Initializes the proxy without actually grabbing anything from the server.
	 * Provided servlet name will be used later.
	 *
	 * @param servletName   name of the data servlet (used for AJAX query)
	 */
	function lazyInit(servletName)
	{
		_servletName = servletName;
		_fullInit = false;
	}

	/**
	 * Initializes with full data. Once initialized with full data,
	 * this proxy class assumes that there will be no additional data.
	 *
	 * @param data
	 */
	function fullInit(data)
	{
		_cache = data;

		_fullInit = true;
	}

	function getCosmicData(servletParams, mutationUtil, callback)
	{
		var data = {};

		// TODO retrieve the actual data...

		callback(data);
	}

	return {
		initWithData: fullInit,
		initWithoutData: lazyInit,
		getCosmicData: getCosmicData
	};
}
