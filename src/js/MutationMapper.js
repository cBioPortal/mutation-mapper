/**
 * Main wrapper for the whole mutation mapper instance.
 *
 * @param options   data, view options, and proxy settings
 * @constructor
 *
 * @author Selcuk Onur Sumer
 */
var MutationMapper = function(options)
{
	var self = this;

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
				lazy: true,
				data: {},
				servletName: "getPfamSequence.json"
			},
			mutation: {
				lazy: true,
				data: {},
				servletName: "getMutationData.json",
				servletParams: ""
			},
			pdb: {
				lazy: true,
				servletName: "get3dPdb.json",
				data: {
					mappingData: {},
					infoData: {},
					summaryData: {}
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

		var mutationProxy = new MutationDataProxy(_options.data.geneList.join(" "));
		var pfamProxy = new PfamDataProxy();
		var pdbProxy = null;

		if (mut3dVis &&
		    mutationProxy.hasData())
		{
			pdbProxy = new PdbDataProxy(mutationProxy.getMutationUtil());
		}

		// init proxies

		if (mutationProxyOpts.lazy)
		{
			mutationProxy.initWithoutData(mutationProxyOpts.servletName,
			                              mutationProxyOpts.servletParams);
		}
		else
		{
			// init mutation data proxy with full data
			mutationProxy.initWithData(mutationProxyOpts.data);
		}

		if (pfamProxyOpts.lazy)
		{
			pfamProxy.initWithoutData(pfamProxyOpts.servletName);
		}
		else
		{
			pfamProxy.initWithData(pfamProxyOpts.data);
		}

		// TODO PDB proxy...
		if (pdbProxy != null)
		{
			if (pdbProxyOpts.lazy)
			{
				//pdbProxy.initWithoutData(pdbProxyOpts.servletName);
			}
			else
			{
				//pdbProxy.initWithData(pdbProxyOpts.data);
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

		// init main controller...
		var controller = new MutationDetailsController(
			mutationDetailsView,
			mutationProxy,
			pfamProxy,
			pdbProxy,
			model.sampleArray,
		    model.diagramOpts,
		    model.tableOpts,
		    mut3dVis);

		// ...and let the fun begin!
		mutationDetailsView.render();
	}

	this.init = init;
};
