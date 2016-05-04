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
 * Singleton utility class for Mutation View related tasks.
 *
 * @author Selcuk Onur Sumer
 */
var MutationViewsUtil = (function()
{
	/**
	 * Mapping between the mutation type (data) values and
	 * view values.
	 */
	var _mutationTypeMap = {
		missense_mutation: {label: "Missense", style: "missense_mutation"},
		nonsense_mutation: {label: "Nonsense", style: "trunc_mutation"},
		nonstop_mutation: {label: "Nonstop", style: "trunc_mutation"},
		frame_shift_del: {label: "Frame Shift Deletion", style: "trunc_mutation"},
		frame_shift_ins: {label: "Frame Shift Insertion", style: "trunc_mutation"},
		in_frame_ins: {label: "In-frame Insertion", style: "inframe_mutation"},
		in_frame_del: {label: "In-frame Deletion", style: "inframe_mutation"},
		splice_site: {label: "Splice", style: "trunc_mutation"},
		other: {style: "other_mutation"}
	};

	/**
	 * Mapping between the validation status (data) values and
	 * view values.
	 */
	var _validationStatusMap = {
		valid: {label: "V", style: "valid", tooltip: "Valid"},
		validated: {label: "V", style: "valid", tooltip: "Valid"},
		wildtype: {label: "W", style: "wildtype", tooltip: "Wildtype"},
		unknown: {label: "U", style: "unknown", tooltip: "Unknown"},
		not_tested: {label: "U", style: "unknown", tooltip: "Unknown"},
		none: {label: "U", style: "unknown", tooltip: "Unknown"},
		na: {label: "U", style: "unknown", tooltip: "Unknown"}
	};

	/**
	 * Mapping between the mutation status (data) values and
	 * view values.
	 */
	var _mutationStatusMap = {
		somatic: {label: "S", style: "somatic", tooltip: "Somatic"},
		germline: {label: "G", style: "germline", tooltip: "Germline"},
		unknown: {label: "U", style: "unknown", tooltip: "Unknown"},
		none: {label: "U", style: "unknown", tooltip: "Unknown"},
		na: {label: "U", style: "unknown", tooltip: "Unknown"}
	};

	/**
	 * Mapping between the functional impact score (data) values and
	 * view values.
	 */
	var _omaScoreMap = {
		h: {label: "High", style: "oma_high", tooltip: "High"},
		m: {label: "Medium", style: "oma_medium", tooltip: "Medium"},
		l: {label: "Low", style: "oma_low", tooltip: "Low"},
		n: {label: "Neutral", style: "oma_neutral", tooltip: "Neutral"}
	};

	/**
	 * Mapping btw the copy number (data) values and view values.
	 */
	var _cnaMap = {
		"-2": {label: "DeepDel", style: "cna-homdel", tooltip: "Deep deletion"},
		"-1": {label: "ShallowDel", style: "cna-hetloss", tooltip: "Shallow deletion"},
		"0": {label: "Diploid", style: "cna-diploid", tooltip: "Diploid / normal"},
		"1": {label: "Gain", style: "cna-gain", tooltip: "Low-level gain"},
		"2": {label: "AMP", style: "cna-amp", tooltip: "High-level amplification"},
		"unknown" : {label: "NA", style: "cna-unknown", tooltip: "CNA data is not available for this gene"}
	};

	/**
	 * Initializes a MutationMapper instance. Postpones the actual rendering of
	 * the view contents until clicking on the corresponding mutations tab. Provided
	 * tabs assumed to be the main tabs instance containing the mutation tabs.
	 *
	 * @param el        {String} container selector
	 * @param options   {Object} view (mapper) options
	 * @param tabs      {String} tabs selector (main tabs containing mutations tab)
	 * @param tabName   {String} name of the target tab (actual mutations tab)
	 * @return {MutationMapper}    a MutationMapper instance
	 */
	function delayedInitMutationMapper(el, options, tabs, tabName)
	{
		var mutationMapper = new MutationMapper(options);
		var initialized = false;

		// init view without a delay if the target container is already visible
		if ($(el).is(":visible"))
		{
			mutationMapper.init();
			initialized = true;
		}

		// add a click listener for the "mutations" tab
		$(tabs).bind("tabsactivate", function(event, ui) {
			// init when clicked on the mutations tab, and init only once
			if (ui.newTab.text().trim().toLowerCase() == tabName.toLowerCase())
			{
				// init only if it is not initialized yet
				if (!initialized)
				{
					mutationMapper.init();
					initialized = true;
				}
				// if already init, then refresh genes tab
				// (a fix for ui.tabs.plugin resize problem)
				else
				{
					mutationMapper.getView().refreshGenesTab();
				}
			}
		});

		return mutationMapper;
	}

	/**
	 * Returns all visual style mappings in a single object.
	 *
	 * @return {Object} style maps in a single object
	 */
	function getVisualStyleMaps()
	{
		return {
			mutationType: _mutationTypeMap,
			validationStatus: _validationStatusMap,
			mutationStatus: _mutationStatusMap,
			omaScore: _omaScoreMap,
			cna: _cnaMap
		};
	}

	function defaultTableTooltipOpts()
	{
		return {
			content: {attr: 'alt'},
			show: {event: 'mouseover'},
			hide: {fixed: true, delay: 100, event: 'mouseout'},
			style: {classes: 'mutation-details-tooltip qtip-shadow qtip-light qtip-rounded'},
			position: {my:'top left', at:'bottom right', viewport: $(window)}
		};
	}

	/**
	 * Renders a placeholder image for data tables cell.
	 *
	 * @param imageLocation place holder image location (url)
	 * @returns {String} html string
	 */
	function renderTablePlaceholder(imageLocation)
	{
		imageLocation = imageLocation || "images/ajax-loader.gif";

		// TODO customize width & height?
		var vars = {loaderImage: imageLocation, width: 15, height: 15};
		var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_placeholder_template");
		return templateFn(vars);
	}

	/**
	 * Refreshes the entire column in the data table.
	 * This function does NOT update the actual value of the cells.
	 * The update is for re-rendering purposes only.
	 *
	 * @param dataTable
	 * @param indexMap
	 * @param columnName
	 */
	function refreshTableColumn(dataTable, indexMap, columnName)
	{
		var tableData = dataTable.fnGetData();

		_.each(tableData, function(ele, i) {
			dataTable.fnUpdate(null, i, indexMap[columnName], false, false);
		});

		if (tableData.length > 0)
		{
			// this update is required to re-render the entire column!
			dataTable.fnUpdate(null, 0, indexMap[columnName]);
		}
	}

	return {
		initMutationMapper: delayedInitMutationMapper,
		renderTablePlaceHolder: renderTablePlaceholder,
		refreshTableColumn: refreshTableColumn,
		defaultTableTooltipOpts: defaultTableTooltipOpts,
		getVisualStyleMaps: getVisualStyleMaps
	};
})();
