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
		// lazy: indicates if it will be lazy init or full init
		// servletName: name of the servlet to retrieve the actual data
		// data: actual data. will be used only if it is a full init, i.e {lazy: false}
		// options: options to be passed to the data proxy constructor
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
					params: {},
					geneList: ""
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
				options: {
					mutationUtil: {}
				}
			},
			pancanProxy: {
				instance: null,
				instanceClass: PancanMutationDataProxy,
				lazy: true,
				servletName: "pancancerMutations.json",
				data: {
					byKeyword: {},
					byProteinChange: {},
					byProteinPosition: {},
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
