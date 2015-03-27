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
		// instance: custom instance, if provided all other parameters are ignored
		// instanceClass: constructor to initialize the data proxy
		// options: options to be passed to the data proxy constructor (see AbstractDataProxy default options)
		proxy: {
			pfamProxy: {
				instance: null,
				instanceClass: PfamDataProxy,
				options: {
					data: {}
				}
			},
			mutationProxy: {
				instance: null,
				instanceClass: MutationDataProxy,
				options: {
					data: {},
					params: {},
					geneList: ""
				}
			},
			pdbProxy: {
				instance: null,
				instanceClass: PdbDataProxy,
				options: {
					data: {
						pdbData: {},
						infoData: {},
						summaryData: {},
						positionData: {}
					},
					mutationUtil: {}
				}
			},
			pancanProxy: {
				instance: null,
				instanceClass: PancanMutationDataProxy,
				options: {
					data: {
						byKeyword: {},
						byProteinChange: {},
						byProteinPosition: {},
						byGeneSymbol: {}
					}
				}
			},
			portalProxy: {
				instance: null,
				instanceClass: PortalDataProxy,
				options: {
					data: {}
				}
			}
		}
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	function init(mut3dVis)
	{
		_options.proxy.mutationProxy.options.geneList = _options.data.geneList.join(" ");

		// init all data proxies
		var dataProxies = DataProxyUtil.initDataProxies(
			_options.proxy, mut3dVis);

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
