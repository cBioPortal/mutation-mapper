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
	function init()
	{
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
			// nothing selected, nothing filtered, show nothing
			else
			{
				// TODO hide everything!
				// (currently we don't need this because, table filter handles this internally)
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
		mutationSelectHandler(event, mutationData);
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
