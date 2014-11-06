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
			pfamProxy: {
				instance: null,
				instanceClass: PfamDataProxy,
				lazy: true,
				servletName: "getPfamSequence.json",
				data: {},
				options: {}
			},
			mutationProxy: {
				instance: null,
				instanceClass: MutationDataProxy,
				lazy: true,
				servletName: "getMutationData.json",
				data: {},
				options: {
					servletParams: ""
				}
			},
			pdbProxy: {
				instance: null,
				instanceClass: PdbDataProxy,
				lazy: true,
				servletName: "get3dPdb.json",
				data: {
					pdbData: {},
					infoData: {},
					summaryData: {},
					positionData: {}
				},
				options: {}
			},
			pancanProxy: {
				instance: null,
				instanceClass: PancanMutationDataProxy,
				lazy: true,
				servletName: "pancancerMutations.json",
				data: {
					byKeyword: {},
					byGeneSymbol: {}
				},
				options: {}
			},
			portalProxy: {
				instance: null,
				instanceClass: PortalDataProxy,
				lazy: true,
				servletName: "portalMetadata.json",
				data: {},
				options: {}
			}
		}
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	function init(mut3dVis)
	{
		// init proxies
		var dataProxies = {};

		// workaround: alphabetically sorting to ensure that mutationProxy is
		// initialized before pdpProxy, since pdbProxy depends on the mutationProxy instance
		_.each(_.keys(_options.proxy).sort(), function(proxy) {
			var proxyOpts = _options.proxy[proxy];

			// used the provided custom instance if available
			var instance = proxyOpts.instance;

			if (instance == null)
			{
				var Constructor = proxyOpts.instanceClass;

				// default optional params for specific proxies
				if (proxy == "mutationProxy")
				{
					proxyOpts.options.geneList = _options.data.geneList.join(" ");
				}
				else if (proxy == "pdbProxy")
				{
					var mutationProxy = dataProxies["mutationProxy"];

					if (mut3dVis && mutationProxy.hasData())
					{
						proxyOpts.options.mutationUtil = mutationProxy.getMutationUtil();
					}
					else
					{
						// do not initialize pdbProxy at all
						dataProxies["pdbProxy"] = null;
						return;
					}

				}

				// init data proxy
				instance = Constructor(proxyOpts.options);

				if (proxyOpts.lazy)
				{
					// init without data
					instance.initWithoutData(proxyOpts.servletName);
				}
				else
				{
					// init with full data
					instance.initWithData(proxyOpts.data);
				}
			}

			dataProxies[proxy] = instance;
		});

		// TODO pass other view options (pdb table, pdb diagram, etc.)

		var model = {
			mutationProxy: dataProxies.mutationProxy,
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
			dataProxies,
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
