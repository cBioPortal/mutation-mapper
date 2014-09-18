/**
 * This class is designed to retrieve PFAM data on demand.
 *
 * @author Selcuk Onur Sumer
 */
function PancanMutationDataProxy()
{
	// name of the PFAM data servlet
	var _servletName;

	// flag to indicate if the initialization is full or lazy
	var _fullInit;

	// map of <keyword, data> pairs
	var _cacheByKeyword = {};
	// map of <gene, data> pairs
	var _cacheByGeneSymbol = {};

	var _mutationUtil = null;

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
		_cacheByKeyword = data.byKeyword;
		_cacheByGeneSymbol = data.byGeneSymbol;

		_fullInit = true;
	}

	function setMutationUtil(mutationUtil)
	{
		_mutationUtil = mutationUtil;
	}

	function getPancanData(servletParams, callback)
	{
		var cmd = servletParams.cmd;
		var q = servletParams.q;

		if (cmd == null)
		{
			// no command provided, nothing to retrieve
			callback(null);
			return;
		}

		// actual param q is missing, construct q by using mutation data
		if (q == null)
		{
			if (_mutationUtil == null)
			{
				// no access to mutations
				callback(null);
				return;
			}

			// TODO depending on cmd build q
			var genes = _mutationUtil.getAllGenes();
			var keywords = _mutationUtil.getAllKeywords();
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
		setMutationUtil: setMutationUtil,
		getPancanData: getPancanData
	};
}
