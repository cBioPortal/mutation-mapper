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
 * Controller class for the Mutation Table view.
 * Listens to the various events and make necessary changes
 * on the view wrt each event type.
 *
 * @param mainMutationView  a MainMutationView instance
 * @param mutationDetailsView   a MutationDetailsView instance
 *
 * @author Selcuk Onur Sumer
 */
function MutationDetailsTableController(mainMutationView, mutationDetailsView)
{
	var _mutationDiagram = null;

	function init()
	{
		//if (mainMutationView.diagramView)
		//{
		//	diagramInitHandler(mainMutationView.diagramView.mutationDiagram);
		//}
		//else
		//{
		//	mainMutationView.dispatcher.on(
		//		MutationDetailsEvents.DIAGRAM_INIT,
		//		diagramInitHandler);
		//}

		//if (mainMutationView.infoView)
		//{
		//	infoPanelInitHandler(mainMutationView.infoView);
		//}
		//else
		//{
		//	mainMutationView.dispatcher.on(
		//		MutationDetailsEvents.INFO_PANEL_INIT,
		//		infoPanelInitHandler);
		//}

		// add listeners for the mutation details view
		mutationDetailsView.dispatcher.on(
			MutationDetailsEvents.GENE_TAB_SELECTED,
			geneTabSelectHandler);

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

	function mutationSelectHandler(event, mutationData)
	{
		if (mainMutationView.tableView)
		{
			// remove all table highlights
			mainMutationView.tableView.clearHighlights();

			// get all selected elements
			var selected = mutationData.getState().selected;
			var filtered = mutationData.getState().filtered;

			// if there are selected mutations, then only show selected
			if (!_.isEmpty(selected))
			{
				// filter table for the selected mutations
				mainMutationView.tableView.filter(selected);
			}
			// if currently no selected mutations, then show only filtered ones
			else if (!_.isEmpty(filtered))
			{
				// filter table for the selected mutations
				mainMutationView.tableView.filter(filtered);
			}
			// nothing selected, nothing filtered, show all available data
			else
			{
				// reset all previous table filters
				mainMutationView.tableView.resetFilters();
			}
		}
	}

	function mutationHighlightHandler(event, mutationData)
	{
		if (mainMutationView.tableView)
		{
			// remove all table highlights
			mainMutationView.tableView.clearHighlights();

			var mutations = mutationData.getState().highlighted;

			// get all highlighted elements
			if (!_.isEmpty(mutations))
			{
				// highlight table for the highlighted mutations
				mainMutationView.tableView.highlight(mutations);
			}
		}
	}

	function mutationFilterHandler(event, mutationData)
	{
		//TODO same as select, but may not need to implement...
	}

	function diagramInitHandler(mutationDiagram)
	{
		// update class variable
		_mutationDiagram = mutationDiagram;

		// add listeners to the custom event dispatcher of the diagram
		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.ALL_LOLLIPOPS_DESELECTED,
			allDeselectHandler);

		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.LOLLIPOP_DESELECTED,
			deselectHandler);

		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.LOLLIPOP_SELECTED,
			selectHandler);

		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.LOLLIPOP_MOUSEOVER,
			mouseoverHandler);

		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.LOLLIPOP_MOUSEOUT,
			mouseoutHandler);

		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.DIAGRAM_PLOT_RESET,
			diagramResetHandler);
	}

	function infoPanelInitHandler(infoView)
	{
		// add listeners to the custom event dispatcher of the info panel view
		if (infoView)
		{
			infoView.dispatcher.on(
				MutationDetailsEvents.INFO_PANEL_MUTATION_TYPE_SELECTED,
				infoPanelFilterHandler);
		}
	}

	function diagramResetHandler()
	{
		if (mainMutationView.tableView)
		{
			// reset all previous table filters
			mainMutationView.tableView.resetFilters();
		}
	}

	function allDeselectHandler()
	{
		if (mainMutationView.tableView)
		{
			// remove all table highlights
			mainMutationView.tableView.clearHighlights();

			// filter with all visible diagram mutations
			mainMutationView.tableView.filter(PileupUtil.getPileupMutations(
				_mutationDiagram.pileups));
		}
	}

	function deselectHandler(datum, index)
	{
		if (mainMutationView.tableView)
		{
			// remove all table highlights
			mainMutationView.tableView.clearHighlights();

			var mutations = [];

			// get mutations for all selected elements
			if (_mutationDiagram)
			{
				_.each(_mutationDiagram.getSelectedElements(), function (ele, i) {
					mutations = mutations.concat(ele.datum().mutations);
				});
			}

			// reselect with the reduced selection
			if (mutations.length > 0)
			{
				// filter table for the selected mutations
				mainMutationView.tableView.filter(mutations);
			}
			// rollback only if none selected
			else
			{
				// filter with all visible diagram mutations
				mainMutationView.tableView.filter(PileupUtil.getPileupMutations(
					_mutationDiagram.pileups));
			}
		}
	}

	function selectHandler(datum, index)
	{
		if (mainMutationView.tableView)
		{
			// remove all table highlights
			mainMutationView.tableView.clearHighlights();

			var mutations = [];

			// get mutations for all selected elements
			if (_mutationDiagram)
			{
				_.each(_mutationDiagram.getSelectedElements(), function (ele, i)
				{
					mutations = mutations.concat(ele.datum().mutations);
				});
			}

			// filter table for the selected mutations
			mainMutationView.tableView.filter(mutations);
		}
	}

	function infoPanelFilterHandler(mutationType)
	{
		if (mainMutationView.tableView !== null)
		{
			// get currently filtered mutations
			var mutations = mainMutationView.infoView.currentMapByType[mutationType];

			if (_.size(mutations) > 0)
			{
				mainMutationView.tableView.filter(mutations);
			}
			// if all the mutations of this type are already filtered out,
			// then show all mutations of this type
			else
			{
				mutations = mainMutationView.infoView.initialMapByType[mutationType];
				mainMutationView.tableView.filter(mutations);
				// clear search box value since the filtering with that value is no longer valid
				mainMutationView.tableView.clearSearchBox();
			}
		}
	}

	function mouseoverHandler(datum, index)
	{
		if (mainMutationView.tableView)
		{
			// highlight mutations for the provided mutations
			mainMutationView.tableView.highlight(datum.mutations);
		}
	}

	function mouseoutHandler(datum, index)
	{
		if (mainMutationView.tableView)
		{
			// remove all highlights
			mainMutationView.tableView.clearHighlights();
		}
	}

	function geneTabSelectHandler(gene)
	{
		if (mainMutationView.tableView)
		{
			var oTable = mainMutationView.tableView.mutationTable.getDataTable();

			// alternatively we can check if selected gene is this view's gene
			if (oTable.is(":visible"))
			{
				oTable.fnAdjustColumnSizing();
			}
		}
	}

	init();
}
