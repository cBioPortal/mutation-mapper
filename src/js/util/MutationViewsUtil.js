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

	var _mutationStyleMap = {
		missense: {label: "Missense",
			longName: "Missense",
			style: "missense_mutation",
			mainType: "missense",
			priority: 1},
		inframe: {label: "IF",
			longName: "In-frame",
			style: "inframe_mutation",
			mainType: "inframe",
			priority: 2},
		truncating: {
			label: "Truncating",
			longName: "Truncating",
			style: "trunc_mutation",
			mainType: "truncating",
			priority: 4},
		nonsense: {label: "Nonsense",
			longName: "Nonsense",
			style: "trunc_mutation",
			mainType: "truncating",
			priority: 6},
		nonstop: {label: "Nonstop",
			longName: "Nonstop",
			style: "trunc_mutation",
			mainType: "truncating",
			priority: 7},
		nonstart: {label: "Nonstart",
			longName: "Nonstart",
			style: "trunc_mutation",
			mainType: "truncating",
			priority: 8},
		frameshift: {label: "FS",
			longName: "Frame Shift",
			style: "trunc_mutation",
			mainType: "truncating",
			priority: 4},
		frame_shift_del: {label: "FS del",
			longName: "Frame Shift Deletion",
			style: "trunc_mutation",
			mainType: "truncating",
			priority: 4},
		frame_shift_ins: {label: "FS ins",
			longName: "Frame Shift Insertion",
			style: "trunc_mutation",
			mainType: "truncating",
			priority: 5},
		in_frame_ins: {label: "IF ins",
			longName: "In-frame Insertion",
			style: "inframe_mutation",
			mainType: "inframe",
			priority: 3},
		in_frame_del: {label: "IF del",
			longName: "In-frame Deletion",
			style: "inframe_mutation",
			mainType: "inframe",
			priority: 2},
		splice_site: {label: "Splice",
			longName: "Splice site",
			style: "trunc_mutation",
			mainType: "truncating",
			priority: 9},
		fusion: {label: "Fusion",
			longName: "Fusion",
			style: "fusion",
			mainType: "other",
			priority: 10},
		silent: {label: "Silent",
			longName: "Silent",
			style: "other_mutation",
			mainType: "other",
			priority: 11},
		// this
		default: {label: "Other",
			longName: "Other",
			style: "other_mutation",
			mainType: "other",
			priority: 11},
		// mutations mapped to "other" will be labelled
		// with their original data value
		other: {style: "other_mutation",
			mainType: "other",
			priority: 11}
	};

	var _mutationTypeMap = {
		"missense_mutation": _mutationStyleMap.missense,
		"missense": _mutationStyleMap.missense,
		"missense_variant": _mutationStyleMap.missense,
		"frame_shift_ins": _mutationStyleMap.frame_shift_ins,
		"frame_shift_del": _mutationStyleMap.frame_shift_del,
		"frameshift": _mutationStyleMap.frameshift,
		"frameshift_deletion": _mutationStyleMap.frame_shift_del,
		"frameshift_insertion": _mutationStyleMap.frame_shift_ins,
		"de_novo_start_outofframe": _mutationStyleMap.frameshift,
		"frameshift_variant": _mutationStyleMap.frameshift,
		"nonsense_mutation": _mutationStyleMap.nonsense,
		"nonsense": _mutationStyleMap.nonsense,
		"stopgain_snv": _mutationStyleMap.nonsense,
		"stop_gained": _mutationStyleMap.nonsense,
		"splice_site": _mutationStyleMap.splice_site,
		"splice": _mutationStyleMap.splice_site,
		"splice site": _mutationStyleMap.splice_site,
		"splicing": _mutationStyleMap.splice_site,
		"splice_site_snp": _mutationStyleMap.splice_site,
		"splice_site_del": _mutationStyleMap.splice_site,
		"splice_site_indel": _mutationStyleMap.splice_site,
		"splice_region_variant": _mutationStyleMap.splice_site,
		"translation_start_site":  _mutationStyleMap.nonstart,
		"initiator_codon_variant": _mutationStyleMap.nonstart,
		"start_codon_snp": _mutationStyleMap.nonstart,
		"start_codon_del": _mutationStyleMap.nonstart,
		"nonstop_mutation": _mutationStyleMap.nonstop,
		"stop_lost": _mutationStyleMap.nonstop,
		"in_frame_del": _mutationStyleMap.in_frame_del,
		"in_frame_deletion": _mutationStyleMap.in_frame_del,
		"in_frame_ins": _mutationStyleMap.in_frame_ins,
		"in_frame_insertion": _mutationStyleMap.in_frame_ins,
		"indel": _mutationStyleMap.in_frame_del,
		"nonframeshift_deletion": _mutationStyleMap.inframe,
		"nonframeshift": _mutationStyleMap.inframe,
		"nonframeshift insertion": _mutationStyleMap.inframe,
		"nonframeshift_insertion": _mutationStyleMap.inframe,
		"targeted_region": _mutationStyleMap.inframe,
		"inframe": _mutationStyleMap.inframe,
		"truncating": _mutationStyleMap.truncating,
		"feature_truncation": _mutationStyleMap.truncating,
		"fusion": _mutationStyleMap.fusion,
		"silent": _mutationStyleMap.silent,
		"synonymous_variant": _mutationStyleMap.silent,
		"any": _mutationStyleMap.default,
		"other": _mutationStyleMap.default
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
