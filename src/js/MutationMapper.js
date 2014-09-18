/**
 * Main wrapper for the whole mutation mapper instance.
 *
 * @param options   data, view options, and proxy settings
 * @constructor
 *
 * @author Selcuk Onur Sumer
 */
function MutationMapper(options)
{
	var self = this;
	var _mutationDetailsView = null;

	// default options object
	var _defaultOpts = {
		// target html container
		el: "#mutation_details",
		// initial data (genes & samples)
		data: {
			geneList: [],
			sampleList: []
		},
		// view component options
		view: {
			mutationDiagram: {},
			mutationTable: {},
		    pdbPanel: {},
			pdbTable: {},
			vis3d: {}
		},
		// data proxy configuration
		proxy: {
			pfam: {
				instance: null,
				lazy: true,
				data: {},
				servletName: "getPfamSequence.json"
			},
			mutation: {
				instance: null,
				lazy: true,
				data: {},
				servletName: "getMutationData.json",
				servletParams: ""
			},
			pdb: {
				instance: null,
				lazy: true,
				servletName: "get3dPdb.json",
				data: {
					pdbData: {},
					infoData: {},
					summaryData: {},
					positionData: {}
				}
			},
			pancan: {
				instance: null,
				lazy: true,
				servletName: "pancancerMutations.json",
				data: {
					byKeyword: {},
					byGeneSymbol: {}
				}
			}
		}
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	function init(mut3dVis)
	{
		var mutationProxyOpts = _options.proxy.mutation;
		var pfamProxyOpts = _options.proxy.pfam;
		var pdbProxyOpts = _options.proxy.pdb;
		var pancanProxyOpts = _options.proxy.pancan;

		var mutationProxy = null;

		// init proxies

		if (mutationProxyOpts.instance)
		{
			// a custom instance is provided
			mutationProxy = mutationProxyOpts.instance;
		}
		else if (mutationProxyOpts.lazy)
		{
			mutationProxy = new MutationDataProxy(_options.data.geneList.join(" "));

			// init mutation data without a proxy
			mutationProxy.initWithoutData(mutationProxyOpts.servletName,
			                              mutationProxyOpts.servletParams);
		}
		else
		{
			mutationProxy = new MutationDataProxy(_options.data.geneList.join(" "));

			// init mutation data proxy with full data
			mutationProxy.initWithData(mutationProxyOpts.data);
		}

		var pfamProxy = null;

		if (pfamProxyOpts.instance)
		{
			pfamProxy = pfamProxyOpts.instance;
		}
		else if (pfamProxyOpts.lazy)
		{
			pfamProxy = new PfamDataProxy();
			pfamProxy.initWithoutData(pfamProxyOpts.servletName);
		}
		else
		{
			pfamProxy = new PfamDataProxy();
			pfamProxy.initWithData(pfamProxyOpts.data);
		}

		var pancanProxy = null;
		
		if (pancanProxyOpts.instance)
		{
			pancanProxy = pancanProxyOpts.instance;
		}
		else if (pancanProxyOpts.lazy)
		{
			pancanProxy = new PancanMutationDataProxy();
			pancanProxy.initWithoutData(pancanProxyOpts.servletName);
		}
		else
		{
			pancanProxy = new PancanMutationDataProxy();
			pancanProxy.initWithData(pancanProxyOpts.data);
		}
		
		var pdbProxy = null;

		if (mut3dVis &&
		    mutationProxy.hasData())
		{
			if (pdbProxyOpts.instance)
			{
				pdbProxy = pdbProxyOpts.instance;
			}
			else
			{
				pdbProxy = new PdbDataProxy(mutationProxy.getMutationUtil());
			}
		}

		if (pdbProxy != null)
		{
			if (pdbProxyOpts.lazy)
			{
				pdbProxy.initWithoutData(pdbProxyOpts.servletName);
			}
			else
			{
				pdbProxy.initWithData(pdbProxyOpts.data);
			}
		}


		// TODO pass other view options (pdb table, pdb diagram, etc.)

		var model = {
			mutationProxy: mutationProxy,
			sampleArray: _options.data.sampleList,
			tableOpts: _options.view.mutationTable,
			diagramOpts: _options.view.mutationDiagram
		};

		var viewOptions = {el: _options.el,
			model: model,
			mut3dVis: mut3dVis};

		var mutationDetailsView = new MutationDetailsView(viewOptions);
		_mutationDetailsView = mutationDetailsView;

		// init main controller...
		var controller = new MutationDetailsController(
			mutationDetailsView,
			mutationProxy,
			pfamProxy,
			pdbProxy,
			pancanProxy,
			model.sampleArray,
		    model.diagramOpts,
		    model.tableOpts,
		    mut3dVis);

		// ...and let the fun begin!
		mutationDetailsView.render();
	}

	this.init = init;
	this.getView = function() {return _mutationDetailsView;};
}
