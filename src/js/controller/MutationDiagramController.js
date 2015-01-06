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

		mutationTable.dispatcher.on(
			MutationDetailsEvents.MUTATION_TABLE_FILTERED,
			tableFilterHandler);

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
			mutationDiagram.highlightMutation(mutation.mutationSid);
		}
	}

	init();
}
