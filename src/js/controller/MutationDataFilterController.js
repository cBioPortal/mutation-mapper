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
		diagramResetHandler();
	}

	function allDeselectHandler()
	{
		_mutationData.unSelectMutations();
	}

	function diagramDeselectHandler(datum, index)
	{
		// TODO update currently selected set of mutations and trigger the corresponding event
		// (selected mutations <- new set)
	}

	function diagramSelectHandler(datum, index)
	{
		// TODO update currently selected set of mutations and trigger the corresponding event
		// (selected mutations <- new set)
	}

	function infoPanelFilterHandler(mutationType)
	{
		// TODO update currently filtered set of mutations and trigger the corresponding event
		// (filtered mutations <- new set)
	}

	function diagramMouseoverHandler(datum, index)
	{
		// TODO update currently highlighted set of mutations and trigger the corresponding event
		// (highlighted mutations <- new set)
	}

	function diagramMouseoutHandler(datum, index)
	{
		// TODO update currently highlighted set of mutations and trigger the corresponding event
		// (highlighted mutations <- new set)
	}

	function tableFilterHandler(tableSelector)
	{
		// TODO update currently filtered set of mutations and trigger the corresponding event
		// (filtered mutations <- new set)
	}

	init();
}
