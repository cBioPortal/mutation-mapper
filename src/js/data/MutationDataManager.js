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
		dataFn: {
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
			}
		},
		dataProxies : {}
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	function getData(type, params, callback)
	{
		// TODO make sure not to hit more than once to the server for the exact same parameters!
		var dataFn = _options.dataFn[type];
		dataFn(_options.dataProxies, params, callback);
	}

	function addView(gene, mainView)
	{
		_viewMap[gene] = mainView;
	}

	this.getData = getData;
	this.addView = addView;
}
