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
	var _progress = {};

	// default options
	var _defaultOpts = {
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
				var uniprotId = mainView.model.sequence.metadata.identifier;

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

	function getData(type, params, callback)
	{
		function predicate(progress) {
			return _.isEqual(progress, params);
		}

		function isInProgress(type, predicate) {
			return _progress[type] &&
			       _.find(_progress[type], predicate);
		}

		// make sure not to hit more than once to the server for the exact same parameters
		if(isInProgress(type, predicate))
		{
			// TODO ignoring the call for now, queue instead?
		}
		else
		{
			// corresponding data retrieval function
			var dataFn = _options.dataFn[type];

			if (_.isFunction(dataFn))
			{
				// mark the call as in progress
				_progress[type] = _progress[type] || [];
				_progress[type].push(params);

				// call the function, with a special callback
				dataFn(_options.dataProxies, params, function(params, data) {
					var inProgress = _.find(_progress[type], predicate);

					// remove params from in progress list
					if (inProgress)
					{
						_progress[type] = _.without(_progress, inProgress);
					}

					// call the actual callback function
					callback(params, data);
				});
			}
			// no data function is registered for this data field
			else
			{
				callback(params, null);
			}
		}
	}

	function addView(gene, mainView)
	{
		_viewMap[gene] = mainView;
	}

	this.getData = getData;
	this.addView = addView;
}
