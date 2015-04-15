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
 * @param tableView         a MutationDetailsTableView instance
 * @param mutationDiagram   a MutationDiagram instance
 * @param mutationDetailsView   a MutationDetailsView instance
 *
 * @author Selcuk Onur Sumer
 */
function MutationDetailsTableController(tableView, mutationDiagram, mutationDetailsView)
{
	function init()
	{
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

		// add listeners for the mutation details view
		mutationDetailsView.dispatcher.on(
			MutationDetailsEvents.GENE_TAB_SELECTED,
			geneTabSelectHandler);
	}

	function diagramResetHandler()
	{
		if (tableView)
		{
			// reset all previous table filters
			tableView.resetFilters();
		}
	}

	function allDeselectHandler()
	{
		if (tableView)
		{
			// remove all table highlights
			tableView.clearHighlights();

			// roll back the table to its previous state
			// (to the last state when a manual filtering applied)
			tableView.rollBack();
		}
	}

	function deselectHandler(datum, index)
	{
		if (tableView)
		{
			// remove all table highlights
			tableView.clearHighlights();

			var mutations = [];

			// get mutations for all selected elements
			_.each(mutationDiagram.getSelectedElements(), function (ele, i) {
				mutations = mutations.concat(ele.datum().mutations);
			});

			// reselect with the reduced selection
			if (mutations.length > 0)
			{
				// filter table for the selected mutations
				tableView.filter(mutations);
			}
			// rollback only if none selected
			else
			{
				// roll back the table to its previous state
				// (to the last state when a manual filtering applied)
				tableView.rollBack();
			}
		}
	}

	function selectHandler(datum, index)
	{
		if (tableView)
		{
			// remove all table highlights
			tableView.clearHighlights();

			var mutations = [];

			// get mutations for all selected elements
			_.each(mutationDiagram.getSelectedElements(), function (ele, i) {
				mutations = mutations.concat(ele.datum().mutations);
			});

			// filter table for the selected mutations
			tableView.filter(mutations);
		}
	}

	function mouseoverHandler(datum, index)
	{
		if (tableView)
		{
			// highlight mutations for the provided mutations
			tableView.highlight(datum.mutations);
		}
	}

	function mouseoutHandler(datum, index)
	{
		if (tableView)
		{
			// remove all highlights
			tableView.clearHighlights();
		}
	}

	function geneTabSelectHandler(gene)
	{
		if (tableView)
		{
			var oTable = tableView.tableUtil.getDataTable();

			// alternatively we can check if selected gene is this view's gene
			if (oTable.is(":visible"))
			{
				oTable.fnAdjustColumnSizing();
			}
		}
	}

	init();
}
