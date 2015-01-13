/**
 * This class is designed to retrieve PFAM data on demand.
 *
 * @param options  additional options
 *
 * @author Selcuk Onur Sumer
 */
function PancanMutationDataProxy(options)
{
	// default options
	var _defaultOpts = {};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	// name of the PFAM data servlet
	var _servletName;

	// flag to indicate if the initialization is full or lazy
	var _fullInit;

	// map of <keyword, data> pairs
	var _cacheByKeyword = {};
	// map of <proteinChange, data> pairs
	var _cacheByProteinChange = {};
	// map of <proteinPosStart, data> pairs
	var _cacheByProteinPosition = {};
	// map of <gene, data> pairs
	var _cacheByGeneSymbol = {};

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
		_cacheByProteinChange = data.byProteinChange;
		_cacheByGeneSymbol = data.byGeneSymbol;

		_fullInit = true;
	}

	function getPancanData(servletParams, mutationUtil, callback)
	{
		var cmd = servletParams.cmd;
		var q = servletParams.q;

		var data = null;
		var toQuery = null;

		if (cmd == null)
		{
			// no command provided, nothing to retrieve
			callback(null);
		}
		else if (cmd == "byKeywords")
		{
			// if no query params (keywords) provided, use all available
			var keywords = (q == null) ? mutationUtil.getAllKeywords() : q.split(",");
			getData(cmd, keywords, _cacheByKeyword, "keyword", callback);
		}
		else if (cmd == "byHugos")
		{
			// if no query params (genes) provided, use all available
			var genes = (q == null) ? mutationUtil.getAllGenes() : q.split(",");
			getData(cmd, genes, _cacheByGeneSymbol, "hugo", callback);
		}
		else if (cmd == "byProteinChanges")
		{
			// if no query params (genes) provided, use all available
			var proteinChanges = (q == null) ? mutationUtil.getAllProteinChanges() : q.split(",");
			getData(cmd, proteinChanges, _cacheByProteinChange, "protein_change", callback);
		}
		else if (cmd == "byProteinPos")
		{
			// if no query params (genes) provided, use all available
			var proteinPositions = (q == null) ? mutationUtil.getAllProteinPosStarts() : q.split(",");
			getData(cmd, proteinPositions, _cacheByProteinPosition, "protein_pos_start", callback);
		}
		else
		{
			// invalid command
			callback(null);
		}
	}

	/**
	 * Retrieves the data from the cache and/or server.
	 *
	 * @param cmd       cmd (byHugos or byKeyword)
	 * @param keys      keys used to get cached data
	 * @param cache     target cache (byKeyword or byGeneSymbol)
	 * @param field     field name to be used as a cache key
	 * @param callback  callback function to forward the data
	 */
	function getData(cmd, keys, cache, field, callback)
	{
		// get cached data
		var data = getCachedData(keys, cache);
		// get keywords to query
		var toQuery = getQueryContent(data);

		if (toQuery.length > 0 &&
		    !_fullInit)
		{
			// retrieve missing data from the servlet
			$.getJSON(_servletName,
			          {cmd: cmd, q: toQuery.join(",")},
			          function(response) {
				          processData(response, data, cache, field, callback);
			          }
			);
		}
		// everything is already cached (or full init)
		else
		{
			processData([], data, cache, field, callback);
		}
	}

	/**
	 * Processes and caches the raw data.
	 *
	 * @param response  raw data
	 * @param data      previously cached data (for provided keys)
	 * @param cache     target cache (byKeyword or byGeneSymbol)
	 * @param field     field name to be used as a cache key
	 * @param callback  callback function to forward the processed data
	 */
	function processData (response, data, cache, field, callback) {
		_.each(response, function(ele, idx) {
			var key = ele[field];

			// init the list if not init yet
			if (cache[key] == null)
			{
				cache[key] = [];
			}

			if (data[key] == null)
			{
				data[key] = [];
			}

			// add data to the cache
			cache[key].push(ele);
			data[key].push(ele);
		});

		var dataArray = [];
		_.each(data, function(ele) {
			dataArray = dataArray.concat(ele);
		});

		// forward the processed data to the provided callback function
		callback(dataArray);
	}

	/**
	 * Get already cached data for the given keys.
	 * Returned object has null data for not-yet-cached keys.
	 *
	 * @param keys      cache keys
	 * @param cache     data cache
	 * @returns {Object} cached data as a map
	 */
	function getCachedData(keys, cache)
	{
		var data = {};

		_.each(keys, function(key) {
			data[key] = cache[key];
		});

		return data;
	}

	/**
	 * Returns the list of keys to query.
	 *
	 * @param data  map of <key, data> pairs
	 * @returns {Array}     list of keys to query
	 */
	function getQueryContent(data)
	{
		// keys to query
		var toQuery = [];

		_.each(_.keys(data), function(key) {
			// data not cached yet for the given key
			if (data[key] == null)
			{
				toQuery.push(key);
			}
		});

		return toQuery
	}

	return {
		initWithData: fullInit,
		initWithoutData: lazyInit,
		getPancanData: getPancanData
	};
}
