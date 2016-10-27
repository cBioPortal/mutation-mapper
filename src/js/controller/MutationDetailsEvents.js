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
 * Singleton utility class to define custom events triggered by
 * Mutation Details components.
 *
 * @author Selcuk Onur Sumer
 */
var MutationDetailsEvents = (function()
{
	var _mutationSelected = "mutationDataSelected";
	var _mutationHighlighted = "mutationDataHighlighted";
	var _mutationFiltered = "mutationDataFiltered";

	var _lollipopSingleSelect = "mutationDiagramLollipopSingleSelect";
	var _lollipopMultiSelect = "mutationDiagramLollipopMultiSelect";
	var _lollipopSelected = "mutationDiagramLollipopSelected";
	var _lollipopDeselected = "mutationDiagramLollipopDeselected";
	var _allLollipopsDeselected = "mutationDiagramAllDeselected";
	var _lollipopMouseover = "mutationDiagramLollipopMouseover";
	var _lollipopMouseout = "mutationDiagramLollipopMouseout";
	var _mainViewInit = "mainMutationViewInit";
	var _diagramInit = "mutationDiagramInitialized";
	var _diagramPlotUpdated = "mutationDiagramPlotUpdated";
	var _diagramPlotReset = "mutationDiagramPlotReset";
	var _mutationTableFiltered = "mutationTableFiltered";
	var _mutationTableInitialized = "mutationTableInitialized";
	var _mutationTableRedrawn = "mutationTableRedrawn";
	var _mutationTableHeaderCreated = "mutationTableHeaderCreated";
	var _proteinChangeLinkClicked = "mutationTableProteinChangeLinkClicked";
	var _mutationTypeSelected = "infoPanelMutationTypeSelected";
	var _infoPanelInit = "infoPanelInit";
	var _pdbLinkClicked = "mutationTablePdbLinkClicked";
	var _pdbPanelResizeStarted = "mutationPdbPanelResizeStarted";
	var _pdbPanelResizeEnded = "mutationPdbPanelResizeEnded";
	var _panelChainSelected = "mutationPdbPanelChainSelected";
	var _tableChainSelected = "mutationPdbTableChainSelected";
	var _tableChainMouseout = "mutationPdbTableChainMouseout";
	var _tableChainMouseover = "mutationPdbTableChainMouseover";
	var _pdbTableReady = "mutationPdbTableReady";
	var _geneTabSelected = "mutationDetailsGeneTabSelected";
	var _geneTabsCreated = "mutationDetailsGeneTabsCreated";
	var _3dVisInit = "mutation3dPanelInit";
	var _3dVisCreated = "mutation3dPanelCreated";
	var _3dPanelClosed = "mutation3dPanelClosed";
	var _3dStructureReloaded = "mutation3dStructureReloaded";

	return {
		MUTATION_HIGHLIGHT: _mutationHighlighted,
		MUTATION_SELECT: _mutationSelected,
		MUTATION_FILTER: _mutationFiltered,
		LOLLIPOP_SINGLE_SELECT: _lollipopSingleSelect,
		LOLLIPOP_MULTI_SELECT: _lollipopMultiSelect,
		LOLLIPOP_SELECTED: _lollipopSelected,
		LOLLIPOP_DESELECTED: _lollipopDeselected,
		LOLLIPOP_MOUSEOVER: _lollipopMouseover,
		LOLLIPOP_MOUSEOUT: _lollipopMouseout,
		ALL_LOLLIPOPS_DESELECTED: _allLollipopsDeselected,
		MAIN_VIEW_INIT: _mainViewInit,
		DIAGRAM_INIT: _diagramInit,
		DIAGRAM_PLOT_UPDATED: _diagramPlotUpdated,
		DIAGRAM_PLOT_RESET: _diagramPlotReset,
		MUTATION_TABLE_INITIALIZED: _mutationTableInitialized,
		MUTATION_TABLE_FILTERED: _mutationTableFiltered,
		MUTATION_TABLE_REDRAWN: _mutationTableRedrawn,
		MUTATION_TABLE_HEADER_CREATED: _mutationTableHeaderCreated,
		PROTEIN_CHANGE_LINK_CLICKED: _proteinChangeLinkClicked,
		INFO_PANEL_MUTATION_TYPE_SELECTED: _mutationTypeSelected,
		INFO_PANEL_INIT: _infoPanelInit,
		PDB_LINK_CLICKED: _pdbLinkClicked,
		PDB_PANEL_RESIZE_STARTED: _pdbPanelResizeStarted,
		PDB_PANEL_RESIZE_ENDED: _pdbPanelResizeEnded,
		PANEL_CHAIN_SELECTED: _panelChainSelected,
		TABLE_CHAIN_SELECTED: _tableChainSelected,
		TABLE_CHAIN_MOUSEOUT: _tableChainMouseout,
		TABLE_CHAIN_MOUSEOVER: _tableChainMouseover,
		PDB_TABLE_READY: _pdbTableReady,
		GENE_TAB_SELECTED: _geneTabSelected,
		GENE_TABS_CREATED: _geneTabsCreated,
		VIS_3D_PANEL_INIT: _3dVisInit,
		VIS_3D_PANEL_CREATED: _3dVisCreated,
		VIEW_3D_STRUCTURE_RELOADED: _3dStructureReloaded,
		VIEW_3D_PANEL_CLOSED: _3dPanelClosed
	};
})();
