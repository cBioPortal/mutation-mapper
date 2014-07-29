/**
 * This class is designed to retrieve PFAM data on demand.
 *
 * @author Selcuk Onur Sumer
 */
var PfamDataProxy = function()
{
	// name of the PFAM data servlet
	var _servletName;

	// flag to indicate if the initialization is full or lazy
	var _fullInit;

	// map of <gene, data> pairs
	var _pfamDataCache = {};

	/**
	 * Initializes the proxy without actually grabbing anything from the server.
	 * Provided servlet name will be used later.
	 *
	 * @param servletName   name of the PFAM data servlet (used for AJAX query)
	 */
	function lazyInit(servletName)
	{
		_servletName = servletName;
		_fullInit = false;
	}

	/**
	 * Initializes with full PFAM data. Once initialized with full data,
	 * this proxy class assumes that there will be no additional data.
	 *
	 * @param pfamData  full PFAM data
	 */
	function fullInit(pfamData)
	{
		//assuming the given data is a map of <gene, sequence data> pairs
		_pfamDataCache = pfamData;

		_fullInit = true;
	}

	function getPfamData(servletParams, callback)
	{
		// TODO allow more than one gene at a time? (see MutationDataProxy)
		var gene = servletParams.geneSymbol;

		if (gene == null)
		{
			// no gene symbol provided, nothing to retrieve
			callback(null);
			return;
		}

		// retrieve data from the server if not cached
		if (_pfamDataCache[gene] == undefined)
		{
			if (_fullInit)
			{
				callback(null);
				return;
			}

			// process & cache the raw data
			var processData = function(data) {
				_pfamDataCache[gene] = data;

				// forward the processed data to the provided callback function
				callback(data);
			};

			// retrieve data from the servlet
			$.getJSON(_servletName,
			          servletParams,
			          processData);
		}
		else
		{
			// data is already cached, just forward it
			callback(_pfamDataCache[gene]);
		}
	}

	return {
		initWithData: fullInit,
		initWithoutData: lazyInit,
		getPfamData: getPfamData
	};
};
