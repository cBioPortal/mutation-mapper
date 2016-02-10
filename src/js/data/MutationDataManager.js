/**
 * Global data manager for Mutation Data, and for other data proxies.
 *
 * @param options   data manager options (proxies, views, etc.)
 *
 * @author Selcuk Onur Sumer
 */
function MutationDataManager(options)
{
	var _viewMap = {};

	// default options
	var _defaultOpts = {
		// TODO default data functions have a strong dependency on MutationDetailsTable instance!
		dataFn: {
			variantAnnotation: function(dataProxies, params, callback) {
				var mutations = params.mutationTable.getMutations();
				var annotationProxy = dataProxies.variantAnnotationProxy;
				var variants = [];

				_.each(mutations, function(mutation, idx) {
					var variantKey = mutation.get("variantKey") ||
					                 VariantAnnotationUtil.generateVariantKey(mutation);

					if (!_.isUndefined(variantKey))
					{
						variants.push(variantKey);
					}
				});

				if (variants.length > 0 && annotationProxy)
				{
					// make variants a comma separated list
					variants = variants.join(",");

					annotationProxy.getAnnotationData(variants, function(annotationData) {
						// enrich current mutation data with the annotation data
						VariantAnnotationUtil.addAnnotationData(mutations, annotationData);

						if (_.isFunction(callback))
						{
							callback(params);
						}
					});
				}
				else if (_.isFunction(callback))
				{
					callback(params);
				}
			},
			pdbMatch: function(dataProxies, params, callback) {
				var mutations = params.mutationTable.getMutations();
				var gene = params.mutationTable.getGene();
				var pdbProxy = dataProxies.pdbProxy;
				//var uniprotId = params.uniprotId;

				// TODO this is not a safe way of getting the uniprot ID!
				var mainView = _viewMap[gene];
				var uniprotId = mainView.model.uniprotId;

				if (mutations && pdbProxy && uniprotId)
				{
					pdbProxy.getPdbRowData(uniprotId, function(pdbRowData) {
						PdbDataUtil.addPdbMatchData(mutations, pdbRowData);

						if (_.isFunction(callback))
						{
							callback(params);
						}
					});
				}
				else if (_.isFunction(callback))
				{
					callback(params);
				}
			},
			cBioPortal: function(dataProxies, params, callback) {
				var pancanProxy = dataProxies.pancanProxy;
				var mutationUtil = params.mutationTable.getMutationUtil();
				var mutations = params.mutationTable.getMutations();

				// get the pancan data and update the data & display values
				pancanProxy.getPancanData({cmd: "byProteinPos"}, mutationUtil, function(dataByPos) {
					pancanProxy.getPancanData({cmd: "byHugos"}, mutationUtil, function(dataByGeneSymbol) {
						var frequencies = PancanMutationDataUtil.getMutationFrequencies(
							{protein_pos_start: dataByPos, hugo: dataByGeneSymbol});

						// update mutation counts (cBioPortal data field) for each datum
						_.each(mutations, function(ele, i) {
							//var proteinPosStart = ele[indexMap["datum"]].mutation.get("proteinPosStart");
							var proteinPosStart = ele.get("proteinPosStart");

							// update the value of the datum only if proteinPosStart value is valid
							if (proteinPosStart > 0)
							{
								var value = PancanMutationDataUtil.countByKey(frequencies, proteinPosStart) || 0;
								//ele[indexMap["datum"]].mutation.set({cBioPortal: value});
								ele.set({cBioPortal: value});
							}
							else
							{
								//ele[indexMap["datum"]].mutation.set({cBioPortal: 0});
								ele.set({cBioPortal: 0});
							}
						});

						if (_.isFunction(callback))
						{
							// frequencies is the custom data, that we should not attach to the
							// mutation object directly, so passing it to the callback function
							callback(params, frequencies);
						}
					});
				});
			}
		},
		dataProxies : {}
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	// list of request queues keyed by data request type
	// <type, RequestQueue instance> pairs
	var _requestManager = {};

	/**
	 * Retrieves the data for the given data type by invoking the corresponding
	 * data retrieval function
	 *
	 * @param type      data type
	 * @param params    params to be passed over the callback function
	 * @param callback  callback function to be invoked after data retrieval
	 */
	function getData(type, params, callback)
	{
		// init a different queue for each distinct type
		if (_requestManager[type] == null)
		{
			_requestManager[type] = new RequestQueue();

			// init with a custom request process function
			_requestManager[type].init(function(element) {
				// corresponding data retrieval function
				var dataFn = _options.dataFn[element.type];

				if (_.isFunction(dataFn))
				{
					// call the function, with a special callback
					dataFn(_options.dataProxies, element.params, function(params, data) {
						// call the actual callback function
						element.callback(params, data);

						// process of the current element complete
						_requestManager[element.type].complete();
					});
				}
				// no data function is registered for this data field
				else
				{
					element.callback(element.params, null);
					// process of the current element complete
					_requestManager[type].complete();
				}
			});
		}

		// add the request to the corresponding queue.
		// this helps preventing simultaneously requests to the server for the same type
		// (NOTE: this does not check if the parameters are exactly the same or not)
		_requestManager[type].add({type: type, params: params, callback: callback});
	}

	function addView(gene, mainView)
	{
		_viewMap[gene] = mainView;
	}

	this.getData = getData;
	this.addView = addView;
}
