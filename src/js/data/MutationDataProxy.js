/**
 * This class is designed to retrieve mutation data on demand, but it can be also
 * initialized with the full mutation data already retrieved from the server.
 *
 * @param options  additional options
 *
 * @author Selcuk Onur Sumer
 */
function MutationDataProxy(options)
{
	var self = this;

	// default options
	var _defaultOpts = {
		servletName: "getMutationData.json",
		geneList: "", // list of target genes (genes of interest) as a string
		params: {}    // fixed servlet params
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	// call super constructor to init options and other params
	AbstractDataProxy.call(this, _options);
	_options = self._options;

	// MutationDetailsUtil instance
	var _util = new MutationDetailsUtil();
	// list of target genes as an array of strings (in the exact input order)
	var _unsortedGeneList = _options.geneList.trim().split(/\s+/);
	// alphabetically sorted list of target genes as an array of strings
	var _geneList = _options.geneList.trim().split(/\s+/).sort();

	/**
	 * Initializes with full mutation data. Once initialized with full data,
	 * this proxy class assumes that there will be no additional mutation data.
	 *
	 * @param options   data proxy options
	 */
	function fullInit(options)
	{
		var data = options.data;
		var mutations = new MutationCollection(data);
		_util.processMutationData(mutations);
	}

	function getGeneList()
	{
		// TODO lazy init: to find out genes with mutation data ONLY,
		// we need to query the server before hand. Otherwise,
		// we cannot remove the genes without data from the list until
		// the corresponding gene tab is clicked.
		return _geneList;
	}

	function getUnsortedGeneList()
	{
		return _unsortedGeneList;
	}

	function getRawGeneList()
	{
		return _options.geneList;
	}

	function getMutationUtil()
	{
		return _util;
	}

	/**
	 * Returns the mutation data for the given gene(s).
	 *
	 * @param geneList  list of hugo gene symbols as a whitespace delimited string
	 * @param callback  callback function to be invoked after retrieval
	 */
	function getMutationData(geneList, callback)
	{
		var genes = geneList.trim().split(/\s+/);
		var genesToQuery = [];

		// get previously grabbed data (if any)
		var mutationData = [];
		var mutationMap = _util.getMutationGeneMap();

		// process each gene in the given list
		_.each(genes, function(gene, idx) {
			gene = gene.toUpperCase();

			var data = mutationMap[gene];

			if (data == undefined ||
			    data.length == 0)
			{
				// mutation data does not exist for this gene, add it to the list
				genesToQuery.push(gene);
			}
			else
			{
				// data is already cached for this gene, update the data array
				mutationData = mutationData.concat(data);
			}
		});

		// all data is already retrieved (full init)
		if (self.isFullInit())
		{
			// just forward the call the callback function
			callback(mutationData);
		}
		// we need to retrieve missing data (lazy init)
		else
		{
			var process = function(data) {
				// process new data retrieved from server
				var mutations = new MutationCollection(data);
				_util.processMutationData(mutations);

				// concat new data with already cached data,
				// and forward it to the callback function
				mutationData = mutationData.concat(data);
				callback(mutationData);
			};

			// some (or all) data is missing,
			// send ajax request for missing genes
			if (genesToQuery.length > 0)
			{
				var servletParams = _options.params;

				// add genesToQuery to the servlet params
				servletParams.geneList = genesToQuery.join(" ");

				// retrieve data from the server
				//$.post(_options.servletName, servletParams, process, "json");
				$.ajax({
					type: "POST",
					url: _options.servletName,
					data: servletParams,
					success: process,
					error: function() {
						console.log("[MutationDataProxy.getMutationData] " +
							"error retrieving mutation data for genetic profiles: " + servletParams.geneticProfiles);
						process([]);
					},
					dataType: "json"
				});
			}
			// data for all requested genes already cached
			else
			{
				// just forward the data to the callback function
				callback(mutationData);
			}
		}
	}

	/**
	 * Checks if there is mutation data for the current query
	 * (For the current gene list, case list, and cancer study).
	 *
	 * @return {boolean} true if there is mutation data, false otherwise.
	 */
	function hasData()
	{
		// TODO returning true in any case for now
		// we need to query server side for lazy init
		// since initially there is definitely no data
		//return (_util.getMutations().length > 0);
		return true;
	}

	// override required base functions
	self.fullInit = fullInit;

	// class specific functions
	self.getMutationData = getMutationData;
	self.getGeneList = getGeneList;
	self.getRawGeneList = getRawGeneList;
	self.getUnsortedGeneList = getUnsortedGeneList;
	self.getMutationUtil = getMutationUtil;
	self.hasData = hasData;
}

// MutationDataProxy extends AbstractDataProxy...
MutationDataProxy.prototype = new AbstractDataProxy();
MutationDataProxy.prototype.constructor = MutationDataProxy;
