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
 * Controller class for the Mutation Details view.
 *
 * @author Selcuk Onur Sumer
 */
function MutationDetailsController(
	mutationDetailsView, dataManager, dataProxies, sampleArray, diagramOpts, tableOpts)
{
	var mutationProxy = dataProxies.mutationProxy;
	var pfamProxy = dataProxies.pfamProxy;
	var pdbProxy = dataProxies.pdbProxy;

	var _geneTabView = {};

	// a single 3D view instance shared by all MainMutationView instances
	var _mut3dVisView = null;

	function init()
	{
		// add listeners to the custom event dispatcher of the view
		mutationDetailsView.dispatcher.on(
			MutationDetailsEvents.GENE_TAB_SELECTED,
			geneTabSelectHandler);

		mutationDetailsView.dispatcher.on(
			MutationDetailsEvents.GENE_TABS_CREATED,
			geneTabCreateHandler);

		mutationDetailsView.dispatcher.on(
			MutationDetailsEvents.VIS_3D_PANEL_INIT,
			vis3dInitHandler);
	}

	function vis3dInitHandler(container)
	{
		var mut3dVis = new Mutation3dVis("default3dView", {
			appOptions: {el: container || "#mutation_details"}
		});
		mut3dVis.init();
		init3dView(mut3dVis);
	}

	function geneTabSelectHandler(gene)
	{
		if (_geneTabView[gene] == null)
		{
			initView(gene, sampleArray, diagramOpts, tableOpts);
		}
	}

	function geneTabCreateHandler()
	{
		// init 3D view with no visualizer
		// (to initially hide 3d container)
		init3dView(null);

		// init the view for the first gene only
		var genes = mutationProxy.getGeneList();
		initView(genes[0], sampleArray, diagramOpts, tableOpts);
	}

	function init3dView(mut3dVis)
	{
		var container3d = mutationDetailsView.$el.find(".mutation-3d-container");

		// init 3D view if the visualizer is available
		if (mut3dVis)
		{
			// TODO remove mutationProxy?
			var mutation3dVisView = new Mutation3dVisView(
				{el: container3d,
					mut3dVis: mut3dVis,
					pdbProxy: pdbProxy,
					mutationProxy: mutationProxy});

			mutation3dVisView.render();

			// update reference to the 3d vis view
			_mut3dVisView = mutation3dVisView;

			mutationDetailsView.dispatcher.trigger(
				MutationDetailsEvents.VIS_3D_PANEL_CREATED,
				mutation3dVisView);
		}
		// if no visualizer, hide the 3D vis container
		else
		{
			$(container3d).hide();
		}
	}

	/**
	 * Initializes mutation view for the given gene and cases.
	 *
	 * @param gene          hugo gene symbol
     * @param cases         array of case ids (samples)
     * @param diagramOpts   [optional] mutation diagram options
     * @param tableOpts     [optional] mutation table options
	 */
	function initView(gene, cases, diagramOpts, tableOpts)
	{
		// callback function to init view after retrieving
		// sequence information.
		var init = function(sequenceData, mutationData)
		{
			// TODO a new util for each instance instead?
//			var mutationUtil = new MutationDetailsUtil(
//				new MutationCollection(mutationData));
			var mutationUtil = mutationProxy.getMutationUtil();

			// prepare data for mutation view
			var model = {geneSymbol: gene,
				mutationData: mutationData,
				dataProxies: dataProxies,
				dataManager: dataManager,
				uniprotId: sequenceData.metadata.identifier, // TODO get uniprot id(s) from elsewhere
				sampleArray: cases};

			// init the main view
			var mainView = new MainMutationView({
				el: "#mutation_details_" + cbio.util.safeProperty(gene),
				model: model});

			mainView.render();

			// update the references after rendering the view
			_geneTabView[gene].mainMutationView = mainView;
			dataManager.addView(gene, mainView);

			// no mutation data, nothing to show...
			if (mutationData == null ||
			    mutationData.length == 0)
			{
				mainView.showNoDataInfo();
			}
			else
			{
				initComponents(mainView, gene, mutationUtil, sequenceData, diagramOpts, tableOpts);
			}
		};

		// get mutation data for the current gene
		mutationProxy.getMutationData(gene, function(data) {
			// init reference mapping
			_geneTabView[gene] = {};

			// create an empty array if data is null
			if (data == null)
			{
				data = [];
			}

			// get the sequence data for the current gene & init view

			// get the most frequent uniprot accession string (excluding "NA")
			var uniprotInfo = mutationProxy.getMutationUtil().dataFieldCount(
				gene, "uniprotAcc", ["NA"]);

			var uniprotAcc = null;
			var servletParams = {geneSymbol: gene};

			if (uniprotInfo.length > 0)
			{
				uniprotAcc = uniprotInfo[0].uniprotAcc;
			}

			// if exists, also add uniprotAcc to the servlet params
			if (uniprotAcc)
			{
				servletParams.uniprotAcc = uniprotAcc;
			}

			// TODO table can be initialized without the PFAM data...
			pfamProxy.getPfamData(servletParams, function(sequenceData) {
				// sequenceData may be null for unknown genes...
				if (sequenceData == null)
				{
					console.log("[warning] no pfam data found: %o", servletParams);
					return;
				}

				// get the first sequence from the response
				var sequence = sequenceData[0];

				// get annotation data in any case
				dataManager.getData("variantAnnotation",
                    {mutations: data},
                    function(params, data) {
	                    init(sequence, params.mutations);
                    });

			});
		});
	}

	function initComponents(mainView, gene, mutationUtil, sequenceData, diagramOpts, tableOpts)
	{
		// init mutation table
		var tableView = mainView.initMutationTableView(tableOpts);

		// init mutation diagram
		var diagramView = null;

		function initDiagram()
		{
			diagramView = mainView.initMutationDiagramView(diagramOpts, sequenceData);

			new MutationDiagramController(
				diagramView.mutationDiagram, tableView.mutationTable, mutationUtil);
		}

		if (mutationUtil.containsProteinChange(gene))
		{
			initDiagram();
		}
		// cannot initialize mutation diagram without protein change data
		else
		{
			dataManager.getData("variantAnnotation",
				{mutationTable: tableView.mutationTable},
			    function(params, data) {
					initDiagram();
				});

			// TODO diagram place holder?
		}

		// just init the 3D button
		var view3d = mainView.init3dView(null);

		// init controllers
		new MainMutationController(mainView);
		new MutationDetailsTableController(mainView, mutationDetailsView);

		new Mutation3dController(mutationDetailsView, mainView,
			_mut3dVisView, view3d, pdbProxy, mutationUtil, gene);
	}

	init();
}
