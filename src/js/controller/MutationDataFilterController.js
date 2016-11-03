var MutationDetailsEvents = require("../controller/MutationDetailsEvents");

var $ = require("jquery");
var _ = require("underscore");

/**
 * Mutation Data Filter/Select/Highlight/Update controller.
 *
 * @author Selcuk Onur Sumer
 */
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
			MutationDetailsEvents.LOLLIPOP_SINGLE_SELECT,
			diagramSingleSelectHandler);

		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.LOLLIPOP_MULTI_SELECT,
			diagramMultiSelectHandler);

		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.LOLLIPOP_MOUSEOVER,
			diagramMouseoverHandler);

		mutationDiagram.dispatcher.on(
			MutationDetailsEvents.LOLLIPOP_MOUSEOUT,
			diagramMouseoutHandler);
	}

	function allDeselectHandler()
	{
		if (_.size(_mutationData.getState().selected) > 0) {
			_mutationData.unSelectMutations();
		}

		if (_.size(_mutationData.getState().highlighted) > 0) {
			_mutationData.unHighlightMutations();
		}
	}

	function diagramSingleSelectHandler(datum, index)
	{
		diagramSelectHandler(datum, index, false);
	}

	function diagramMultiSelectHandler(datum, index)
	{
		diagramSelectHandler(datum, index, true);
	}

	function diagramSelectHandler(datum, index, multi)
	{
		var selected = [];

		// TODO intersection function might be very expensive in case too many lollipops selected!
		// find a faster way to check if the given mutations are already selected!
		var alreadySelected =
			_.size(_.intersection(_mutationData.getState().selected, datum.mutations)) ===
			_.size(datum.mutations);

		// check if the mutations are already selected
		if (multi)
		{
			if (alreadySelected)
			{
				_mutationData.unSelectMutations(datum.mutations);
				_mutationData.unHighlightMutations(datum.mutations);
			}
			else
			{
				_mutationData.selectMutations(datum.mutations);
			}
		}
		else if (!alreadySelected)
		{
			selected = selected.concat(datum.mutations);
			_mutationData.updateSelectedMutations(selected);
		}
		else
		{
			// no multi selection and not already selected,
			// so nothing should be selected in this case
			allDeselectHandler();
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

		_mutationData.updateFilteredMutations(filtered, {view: mainMutationView.tableView});
	}

	function proteinChangeLinkHandler(mutationId)
	{
		var mutationMap = _mutationData.getDataUtil().getMutationIdMap();
		var mutation = mutationMap[mutationId];

		if (mutation)
		{
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

module.exports = MutationDataFilterController;