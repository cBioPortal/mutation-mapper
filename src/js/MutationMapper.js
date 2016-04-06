/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an "as is" basis, and Memorial Sloan-Kettering Cancer Center has no
 * obligations to provide maintenance, support, updates, enhancements or
 * modifications. In no event shall Memorial Sloan-Kettering Cancer Center be
 * liable to any party for direct, indirect, special, incidental or
 * consequential damages, including lost profits, arising out of the use of this
 * software and its documentation, even if Memorial Sloan-Kettering Cancer
 * Center has been advised of the possibility of such damage.
 */

/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
			variantAnnotationProxy: {
				instance: null,
				instanceClass: VariantAnnotationDataProxy,
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
			mutationAlignerProxy: {
				instance: null,
				instanceClass: MutationAlignerDataProxy,
				options: {
					data: {}
				}
			},
			portalProxy: {
				instance: null,
				instanceClass: PortalDataProxy,
				options: {
					data: {}
				}
			}
		},
		// data manager configuration,
		// dataFn: additional custom data retrieval functions
		// dataProxies: additional data proxies
		dataManager: {
			dataFn: {},
			dataProxies: {}
		}
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	function init()
	{
		_options.proxy.mutationProxy.options.geneList = _options.data.geneList.join(" ");

		// init all data proxies & data manager
		var dataProxies = DataProxyUtil.initDataProxies(_options.proxy);
		_options.dataManager = jQuery.extend(true, {}, _options.dataManager, {dataProxies: dataProxies});
		var dataManager = new MutationDataManager(_options.dataManager);

		// TODO pass other view options (pdb table, pdb diagram, etc.)

		var model = {
			mutationProxy: dataProxies.mutationProxy,
			sampleArray: _options.data.sampleList,
			tableOpts: _options.view.mutationTable,
			diagramOpts: _options.view.mutationDiagram
		};

		var viewOptions = {el: _options.el,
			model: model};

		var mutationDetailsView = new MutationDetailsView(viewOptions);
		_mutationDetailsView = mutationDetailsView;

		// init main controller...
		var controller = new MutationDetailsController(
			mutationDetailsView,
			dataManager,
			dataProxies,
			model.sampleArray,
			_options.view.mutationDiagram,
			_options.view.mutationTable,
			_options.view.vis3d);

		// ...and let the fun begin!
		mutationDetailsView.render();
	}

	this.init = init;
	this.getView = function() {return _mutationDetailsView;};
}
