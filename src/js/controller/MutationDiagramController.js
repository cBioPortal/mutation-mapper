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
 * Controller class for the Mutation Diagram.
 * Listens to the various events and make necessary changes
 * on the view wrt each event type.
 *
 * @author Selcuk Onur Sumer
 */
function MutationDiagramController(mutationDiagram, mutationTable, mutationUtil)
{
	function init()
	{
		// add listeners to the custom event dispatcher of the mutation table
		if (mutationTable)
		{
			mutationTable.dispatcher.on(
				MutationDetailsEvents.MUTATION_TABLE_FILTERED,
				tableFilterHandler);
		}

		// TODO make sure to call these event handlers before 3D controller's handler,
		// otherwise 3D update will not work properly.
		// (this requires event handler prioritization which is not trivial)

		// add listeners for the mutation table view

//		mutationTable.dispatcher.on(
//			MutationDetailsEvents.PROTEIN_CHANGE_LINK_CLICKED,
//			proteinChangeLinkHandler);

//		mutationTable.dispatcher.on(
//			MutationDetailsEvents.PDB_LINK_CLICKED,
//			proteinChangeLinkHandler);
	}

	function tableFilterHandler(tableSelector)
	{
		var currentMutations = [];

		// add current (filtered) mutations into an array
		var rowData = [];

		// TODO this try/catch block is for backward compatibility,
		// we will no longer need this once we completely migrate to DataTables 1.10
		try {
			// first, try new API.
			// this is not backward compatible, requires DataTables 1.10 or later.
			rowData = $(tableSelector).DataTable().rows({filter: "applied"}).data();
		} catch(err) {
			// if DataTables 1.10 is not available, try the old API function.
			// DataTables 1.9.4 compatible code (which doesn't work with deferRender):
			rowData = $(tableSelector).dataTable()._('tr', {filter: "applied"});
		}

		_.each(rowData, function(data, index) {
			// assuming only the first element contains the datum
			var mutation = data[0].mutation;

			if (mutation)
			{
				currentMutations.push(mutation);
			}
		});

		// update mutation diagram with the current mutations
		if (mutationDiagram !== null)
		{
			var mutationData = new MutationCollection(currentMutations);
			mutationDiagram.updatePlot(PileupUtil.convertToPileups(mutationData));
		}
	}

	function proteinChangeLinkHandler(mutationId)
	{
		var mutationMap = mutationUtil.getMutationIdMap();
		var mutation = mutationMap[mutationId];

		if (mutation)
		{
			// highlight the corresponding pileup (without filtering the table)
			mutationDiagram.clearHighlights();
			mutationDiagram.highlightMutation(mutation.get("mutationSid"));
		}
	}

	init();
}
