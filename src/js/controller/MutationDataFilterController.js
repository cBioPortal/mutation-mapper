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

		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.DIAGRAM_PLOT_UPDATED,
			diagramUpdateHandler);

		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.DIAGRAM_PLOT_RESET,
			diagramResetHandler);
	}

	function diagramResetHandler()
	{
		_mutationData.unHighlightMutations();
		_mutationData.unSelectMutations();
		_mutationData.unfilterMutations();
	}

	function diagramUpdateHandler()
	{
		// TODO we may consider to remove the updatePlot function of mutation diagram,
		// and perform updates only to the mutation data set itself, then handle the updates by events.
		// that would simplify the mutation diagram code...

		// TODO do we need to handle this event anymore?
		//diagramResetHandler();
	}

	function allDeselectHandler()
	{
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
		// TODO update currently filtered set of mutations
		// (filtered mutations <- new set)
	}

	init();
}
