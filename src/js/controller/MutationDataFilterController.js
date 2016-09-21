/**
 * Mutation Data Filter/Select/Highlight/Update controller.
 *
 * @author Selcuk Onur Sumer
 */
// TODO all other component controllers (Diagram, Table, Info Panel, etc.) should only listen
// to the events trigger by the mutation data filter manager, and update accordingly
function MutationDataFilterController(mainMutationView)
{
	var _mutationDiagram = null;
	var _mutationTable = null;
	var _mutationData = mainMutationView.model.mutationData;

	function init()
	{
		if (mainMutationView.diagramView)
		{
			diagramInitHandler(mainMutationView.diagramView.mutationDiagram);
		}
		else
		{
			mainMutationView.dispatcher.on(
				MutationDetailsEvents.DIAGRAM_INIT,
				diagramInitHandler);
		}

		if (mainMutationView.tableView)
		{
			tableInitHandler(mainMutationView.tableView.mutationTable);
		}
		else
		{
			mainMutationView.dispatcher.on(
				MutationDetailsEvents.MUTATION_TABLE_INITIALIZED,
				tableInitHandler);
		}

		if (mainMutationView.infoView)
		{
			infoPanelInitHandler(mainMutationView.infoView);
		}
		else
		{
			mainMutationView.dispatcher.on(
				MutationDetailsEvents.INFO_PANEL_INIT,
				infoPanelInitHandler);
		}
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

	function tableInitHandler(mutationTable)
	{
		// update class variable
		_mutationTable = mutationTable;

		mutationTable.dispatcher.on(
			MutationDetailsEvents.MUTATION_TABLE_FILTERED,
			tableFilterHandler);

		mutationTable.dispatcher.on(
			MutationDetailsEvents.PDB_LINK_CLICKED,
			pdbLinkHandler);

		mutationTable.dispatcher.on(
			MutationDetailsEvents.PROTEIN_CHANGE_LINK_CLICKED,
			proteinChangeLinkHandler);
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
			diagramDeselectHandler);

		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.LOLLIPOP_SELECTED,
			diagramSelectHandler);

		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.LOLLIPOP_MOUSEOVER,
			diagramMouseoverHandler);

		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.LOLLIPOP_MOUSEOUT,
			diagramMouseoutHandler);
	}

	function allDeselectHandler()
	{
		_mutationData.unHighlightMutations();
		_mutationData.unSelectMutations();
	}

	function diagramDeselectHandler(datum, index)
	{
		diagramSelectHandler(datum, index);
	}

	function diagramSelectHandler(datum, index)
	{
		var selected = [];

		// get mutations for all selected elements
		if (_mutationDiagram)
		{
			_.each(_mutationDiagram.getSelectedElements(), function (ele, i) {
				selected = selected.concat(ele.datum().mutations);
			});
		}

		// all deselected
		if (_.isEmpty(selected))
		{
			allDeselectHandler();
		}
		else
		{
			// update currently selected set of mutations
			_mutationData.updateSelectedMutations(selected);
		}
	}

	function infoPanelFilterHandler(mutationType)
	{
		// get currently filtered mutations
		var filtered = mainMutationView.infoView.currentMapByType[mutationType];

		// if all the mutations of this type are already filtered out,
		// then show all mutations of this type
		if (_.size(filtered) === 0)
		{
			filtered = mainMutationView.infoView.initialMapByType[mutationType];
		}

		// update currently filtered set of mutations
		_mutationData.updateFilteredMutations(filtered);
	}

	function diagramMouseoverHandler(datum, index)
	{
		// update currently highlighted set of mutations
		_mutationData.updateHighlightedMutations(datum.mutations);
	}

	function diagramMouseoutHandler(datum, index)
	{
		// reset currently highlighted set of mutations
		_mutationData.unHighlightMutations();
	}

	function tableFilterHandler(tableSelector)
	{
		var filtered = [];

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
				filtered.push(mutation);
			}
		});

		_mutationData.updateFilteredMutations(filtered);
	}

	function proteinChangeLinkHandler(mutationId)
	{
		var mutationMap = _mutationData.getDataUtil().getMutationIdMap();
		var mutation = mutationMap[mutationId];

		if (mutation)
		{
			// TODO ideally diagram should be highlighted by MutationDiagramController
			// by using the mutation data state (both current state and prev state)

			// highlight the corresponding pileup (without filtering the table)
			_mutationDiagram.clearHighlights();
			_mutationDiagram.highlightMutation(mutation.get("mutationSid"));

			_mutationData.updateHighlightedMutations([mutation]);
		}
		else
		{
			_mutationData.unHighlightMutations();
		}
	}

	function pdbLinkHandler(mutationId)
	{
		proteinChangeLinkHandler(mutationId);
	}

	init();
}
