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

var MutationDetailsEvents = require("../controller/MutationDetailsEvents");
var PileupUtil = require("../util/PileupUtil");
var MutationDataConverter = require("../util/MutationDataConverter");

var $ = require("jquery");
var _ = require("underscore");

/**
 * Controller class for the 3D Mutation view.
 * Listens to the various events and make necessary changes
 * on the view wrt each event type.
 *
 * @param mutationDetailsView   a MutationDetailsView instance
 * @param mainMutationView      a MainMutationView instance
 * @param viewOptions           view component options
 * @param renderOptions         view class options
 * @param mut3dVisView          a Mutation3dVisView instance
 * @param mut3dView             a Mutation3dView instance
 * @param pdbProxy              proxy for pdb data
 * @param mutationUtil          data utility class (having the related mutations)
 * @param geneSymbol            hugo gene symbol (string value)
 *
 * @author Selcuk Onur Sumer
 */
function Mutation3dController(mutationDetailsView, mainMutationView, viewOptions, renderOptions,
	mut3dVisView, mut3dView, pdbProxy, mutationUtil, geneSymbol)
{
	// we cannot get pdb panel view as a constructor parameter,
	// since it is initialized after initializing this controller
	var _pdbPanelView = null;
	var _pdbTableView = null;

	var _mut3dVisView = null; // a Mutation3dVisView instance
	var _mut3dVis = null;     // singleton Mutation3dVis instance
	var _mutationDiagram = null;

	// TODO this can be implemented in a better/safer way
	// ...find a way to bind the source info to the actual event

	// flags for distinguishing actual event sources
	var _chainSelectedByTable = false;

	function init()
	{
		if (mainMutationView.diagramView &&
		    mainMutationView.diagramView.mutationDiagram)
		{
			//diagramInitHandler(mainMutationView.diagramView.mutationDiagram);
			_mutationDiagram = mainMutationView.diagramView.mutationDiagram;
		}
		else
		{
			mainMutationView.dispatcher.on(
				MutationDetailsEvents.DIAGRAM_INIT,
				function(diagram) {
					_mutationDiagram = diagram;
				});
		}

		if (mainMutationView.tableView &&
		    mainMutationView.tableView.mutationTable)
		{
			// add listeners for the mutation table view
			mainMutationView.tableView.mutationTable.dispatcher.on(
				MutationDetailsEvents.PDB_LINK_CLICKED,
				pdbLinkHandler);
		}

		// add listeners for the mutation 3d view
		mut3dView.addInitCallback(mut3dInitHandler);

		// add listeners for the mutation details view
		mutationDetailsView.dispatcher.on(
			MutationDetailsEvents.GENE_TAB_SELECTED,
			geneTabSelectHandler);

		// set mut3dVisView instance if it is already initialized
		if (mut3dVisView)
		{
			vis3dCreateHandler(mut3dVisView)
		}
		// if not init yet, wait for the init event
		else
		{
			mutationDetailsView.dispatcher.on(
				MutationDetailsEvents.VIS_3D_PANEL_CREATED,
				vis3dCreateHandler);
		}

		var mutationDataDispatcher = $(mainMutationView.model.mutationData.dispatcher);

		mutationDataDispatcher.on(
			MutationDetailsEvents.MUTATION_FILTER,
			mutationFilterHandler
		);

		mutationDataDispatcher.on(
			MutationDetailsEvents.MUTATION_HIGHLIGHT,
			mutationHighlightHandler
		);

		mutationDataDispatcher.on(
			MutationDetailsEvents.MUTATION_SELECT,
			mutationSelectHandler
		);
	}

	function mutationSelectHandler(event, params, noWarning)
	{
		var mutationData = params.mutationData;

		if (_mut3dVisView && _mut3dVisView.isVisible())
		{
			// get all selected and highlighted elements
			var selected = mutationData.getState().selected;
			var highlighted = mutationData.getState().highlighted;

			var combined = _.union(selected, highlighted);

			if (!_.isEmpty(combined))
			{
				// TODO this is an expensive conversion,
				// find a better/faster way to highlight residues without using pileup data
				var pileups = PileupUtil.convertToPileups(
					MutationDataConverter.convertToCollection(combined));
				highlight3dResidues(pileups, noWarning);
			}
			// nothing selected, nothing filtered, show nothing
			else
			{
				// remove all highlights!
				_mut3dVisView.resetHighlight();
				_mut3dVisView.hideResidueWarning();
			}
		}
	}

	function mutationHighlightHandler(event, params)
	{
		// in case of highlight event, no need to update the warning message.
		// so set noWarning = true
		mutationSelectHandler(event, params, true);
	}

	function mutationFilterHandler(event, params)
	{
		// refresh view wrt to filtered data
		if (_mut3dVisView && _mut3dVisView.isVisible())
		{
			// reset all previous visualizer filters
			_mut3dVisView.refreshView();
		}
	}

	function vis3dCreateHandler(mutation3dVisView)
	{
		// init the 3d view initializer & 3D controller
		if (mutation3dVisView)
		{
			_mut3dVisView = mutation3dVisView;
			_mut3dVis = mutation3dVisView.options.mut3dVis;

			// add listeners for the mutation 3d vis view
			_mut3dVisView.dispatcher.on(
				MutationDetailsEvents.VIEW_3D_PANEL_CLOSED,
				view3dPanelCloseHandler);

			_mut3dVisView.dispatcher.on(
				MutationDetailsEvents.VIEW_3D_STRUCTURE_RELOADED,
				view3dReloadHandler);
		}
	}

	function geneTabSelectHandler(gene)
	{
//		var sameGene = (gene.toLowerCase() == geneSymbol.toLowerCase());
//		var reset = sameGene &&
//		            mut3dView &&
//					mut3dVisView &&
//		            mut3dVisView.isVisible();

		// reset if the 3D panel is visible,
		// and selected gene is this controller's gene
//		if (reset)
//		{
//			// TODO instead of reset, restore to previous config:
//			// may need to update resetView and loadDefaultChain methods
//			// (see issue #456)
//			mut3dView.resetView();
//		}

		// just hide the 3D view for now

		if (_mut3dVisView)
		{
			_mut3dVisView.resetPanelPosition();
			_mut3dVisView.hideView();
		}
	}

	function view3dPanelCloseHandler()
	{
		// hide the corresponding pdb panel and table views

		if (_pdbPanelView)
		{
			_pdbPanelView.hideView();
		}
	}

	function mut3dInitHandler(event)
	{
		reset3dView();

		if (_mut3dVisView != null)
		{
			_mut3dVisView.resetPanelPosition();
			_mut3dVisView.maximizeView();
		}
	}

	function panelResizeStartHandler(newHeight, prevHeight, maxHeight)
	{
		// check if it is expanded beyond the max height
		if (newHeight > maxHeight)
		{
			// add the toggle bar at the beginning of the resize
			_pdbPanelView.toggleScrollBar(maxHeight);
		}
	}

	function panelResizeEndHandler(newHeight, prevHeight, maxHeight)
	{
		// check if it is collapsed
		if (newHeight <= maxHeight)
		{
			// remove the toggle bar at the end of the resize
			_pdbPanelView.toggleScrollBar(-1);
		}

		// if there is a change in the size,
		// then also scroll to the correct position
		if (prevHeight != newHeight)
		{
			_pdbPanelView.scrollToSelected();
		}
	}

	function panelChainSelectHandler(element)
	{
		// scroll to the selected chain if selection triggered by the table
		// (i.e: exclude manual selection for the sake of user-friendliness)
		if (_chainSelectedByTable)
		{
			// scroll the view
			_pdbPanelView.scrollToSelected();
		}

		// update 3D view with the selected chain data
		var datum = element.datum();

		if (_mut3dVisView != null)
		{
			_mut3dVisView.maximizeView();
			_mut3dVisView.updateView(geneSymbol, datum.pdbId, datum.chain);
		}

		// also update the pdb table (highlight the corresponding row)
		if (!_chainSelectedByTable &&
		    _pdbTableView != null)
		{
			_pdbTableView.resetFilters();
			_pdbTableView.selectChain(datum.pdbId, datum.chain.chainId);
			_pdbTableView.scrollToSelected();
		}

		// reset the flag
		_chainSelectedByTable = false;
	}

	function view3dReloadHandler()
	{
		var mutationData = mainMutationView.model.mutationData;

		// highlight mutations on the 3D view only if there are mutations to highlight
		if (!_.isEmpty(mutationData.getState().selected) ||
		    !_.isEmpty(mutationData.getState().highlighted))
		{
			highlightSelected();
		}
	}

	function tableChainSelectHandler(pdbId, chainId)
	{
		if (pdbId && chainId)
		{
			_pdbPanelView.selectChain(pdbId, chainId);
			_chainSelectedByTable = true;
		}
	}

	function tableMouseoutHandler()
	{
		_pdbPanelView.pdbPanel.minimizeToHighlighted();
	}

	function tableMouseoverHandler(pdbId, chainId)
	{
		if (pdbId && chainId)
		{
			_pdbPanelView.pdbPanel.minimizeToChain(
				_pdbPanelView.pdbPanel.getChainGroup(pdbId, chainId));
		}
	}

	function initPdbPanel(pdbColl)
	{
		// init pdb panel view if not initialized yet
		if (_pdbPanelView == null)
		{
			_pdbPanelView = mainMutationView.initPdbPanelView(renderOptions.pdbPanel,
				viewOptions.pdbPanel, viewOptions.pdbTable, pdbColl);

			if (_pdbPanelView.pdbPanel)
			{
				// add listeners to the custom event dispatcher of the pdb panel
				_pdbPanelView.pdbPanel.dispatcher.on(
					MutationDetailsEvents.PANEL_CHAIN_SELECTED,
					panelChainSelectHandler);

				_pdbPanelView.pdbPanel.dispatcher.on(
					MutationDetailsEvents.PDB_PANEL_RESIZE_STARTED,
					panelResizeStartHandler);

				_pdbPanelView.pdbPanel.dispatcher.on(
					MutationDetailsEvents.PDB_PANEL_RESIZE_ENDED,
					panelResizeEndHandler);
			}

			// add listeners for the mutation 3d view
			if (viewOptions.pdbTable) {
				_pdbPanelView.addInitCallback(function(event) {
					initPdbTable(pdbColl);
				});
			}
			else {
				// TODO not an ideal way of disabling a view component...
				_pdbPanelView.$el.find(".pdb-table-controls").remove();
			}
		}
	}

	function initPdbTable(pdbColl)
	{
		// init pdb table view if not initialized yet
		if (_pdbTableView == null &&
		    _pdbPanelView != null &&
		    pdbColl.length > 0)
		{
			_pdbTableView = _pdbPanelView.initPdbTableView(pdbColl, function(view, table) {
				// we need to register a callback to add this event listener
				table.dispatcher.on(
					MutationDetailsEvents.PDB_TABLE_READY,
					pdbTableReadyHandler);

				_pdbTableView = view;
			});

			// add listeners to the custom event dispatcher of the pdb table

			_pdbTableView.pdbTable.dispatcher.on(
				MutationDetailsEvents.TABLE_CHAIN_SELECTED,
				tableChainSelectHandler);

			_pdbTableView.pdbTable.dispatcher.on(
				MutationDetailsEvents.TABLE_CHAIN_MOUSEOUT,
				tableMouseoutHandler);

			_pdbTableView.pdbTable.dispatcher.on(
				MutationDetailsEvents.TABLE_CHAIN_MOUSEOVER,
				tableMouseoverHandler);
		}

		if (_pdbPanelView != null &&
		    _pdbTableView != null)
		{
			_pdbPanelView.toggleTableControls();
			_pdbTableView.toggleView();
		}
	}

	function pdbTableReadyHandler()
	{
		if (_pdbPanelView != null)
		{
			// find currently selected chain in the panel
			var gChain = _pdbPanelView.getSelectedChain();

			// select the corresponding row on the table
			if (gChain != null)
			{
				var datum = gChain.datum();
				_pdbTableView.selectChain(datum.pdbId, datum.chain.chainId);
				_pdbTableView.scrollToSelected();
			}
		}
	}

	function pdbLinkHandler(mutationId)
	{
		var mutationMap = mutationUtil.getMutationIdMap();
		var mutation = mutationMap[mutationId];

		if (mutation)
		{
			// reset the view with the selected chain
			reset3dView(mutation.get("pdbMatch").pdbId,
				mutation.get("pdbMatch").chainId);
		}
	}

	/**
	 * Retrieves the pileup data from the selected mutation diagram
	 * elements.
	 *
	 * @return {Array} an array of Pileup instances
	 * @deprecated
	 */
	function getSelectedPileups()
	{
		var pileups = [];

		if (_mutationDiagram)
		{
			// get mutations for all selected elements
			_.each(_mutationDiagram.getSelectedElements(), function (ele, i) {
				pileups = pileups.concat(ele.datum());
			});
		}

		return pileups;
	}

	/**
	 * Highlights 3D residues for the selected diagram elements.
	 */
	function highlightSelected()
	{
		mutationSelectHandler(null, {mutationData: mainMutationView.model.mutationData});
	}

	/**
	 * Highlight residues on the 3D diagram for the given pileup data.
	 *
	 *
	 * @param pileupData    pileups to be highlighted
	 * @param noWarning     if set true, warning messages are not be updated
	 */
	function highlight3dResidues(pileupData, noWarning)
	{
		// highlight 3D residues for the initially selected diagram elements
		var mappedCount = _mut3dVisView.highlightView(pileupData, true);

		var unmappedCount = pileupData.length - mappedCount;

		// no warning flag is provided, do not update the warning text
		if (noWarning)
		{
			return;
		}

		// show a warning message if there is at least one unmapped selection
		if (unmappedCount > 0)
		{
			_mut3dVisView.showResidueWarning(unmappedCount, pileupData.length);
		}
		else
		{
			_mut3dVisView.hideResidueWarning();
		}
	}

	/**
	 * Resets the 3D view to its initial state. This function also initializes
	 * the PDB panel view if it is not initialized yet.
	 *
	 * @param pdbId     initial pdb structure to select
	 * @param chainId   initial chain to select
	 */
	function reset3dView(pdbId, chainId)
	{
		var gene = geneSymbol;
		var uniprotId = mut3dView.model.uniprotId; // TODO get this from somewhere else

		// init (singleton) 3D panel if not initialized yet
		if (!mutationDetailsView.is3dPanelInitialized())
		{
			mutationDetailsView.init3dPanel();
		}

		var initView = function(pdbColl)
		{
			// init pdb panel view if not initialized yet
			if (_pdbPanelView == null)
			{
				initPdbPanel(pdbColl);
			}

			// reload the visualizer content with the given pdb and chain
			if (_mut3dVisView != null &&
			    _pdbPanelView != null &&
			    pdbColl.length > 0)
			{
				updateColorMapper();
				_pdbPanelView.showView();

				if (pdbId && chainId)
				{
					_pdbPanelView.selectChain(pdbId, chainId);
				}
				else
				{
					// select default chain if none provided
					_pdbPanelView.selectDefaultChain();
				}

				// initiate auto-collapse
				_pdbPanelView.autoCollapse();
			}
		};

		if (mut3dView != null &&
		    _mut3dVisView != null)
		{
			_mut3dVisView.showMainLoader();
			_mut3dVisView.showView();
		}

		// init view with the pdb data
		pdbProxy.getPdbData(uniprotId, initView);
	}

	/**
	 * Updates the color mapper of the 3D visualizer.
	 */
	function updateColorMapper()
	{
		// TODO this is not an ideal solution, but...
		// ...while we have multiple diagrams, the 3d visualizer is a singleton
		if (_mutationDiagram)
		{
			var colorMapper = function(mutationId, pdbId, chain) {
				return _mutationDiagram.mutationColorMap[mutationId];
			};

			_mut3dVis.updateOptions({mutationColorMapper: colorMapper});
		}
	}

	init();

	this.reset3dView = reset3dView;
	this.highlightSelected = highlightSelected;
}

module.exports = Mutation3dController;