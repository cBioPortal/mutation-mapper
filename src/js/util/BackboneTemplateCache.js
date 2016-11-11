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

var $ = require("jquery");
var _ = require("underscore");

/**
 * Singleton utility class to precompile & cache backbone templates.
 * Using precompiled templates increases rendering speed dramatically.
 *
 * @author Selcuk Onur Sumer
 */
var BackboneTemplateCache = (function () {
	var _cache = {};

	var _legacyIdMapping =
	{
		"3Dmol_basic_interaction": "3d/3Dmol_basic_interaction",
		"jsmol_basic_interaction": "3d/jsmol_basic_interaction",
		"mutation_3d_view_template": "3d/mutation_3d_view",
		"mutation_3d_vis_template": "3d/mutation_3d_vis",
		"mutation_3d_vis_info_template": "3d/mutation_3d_vis_info",
		"mutation_3d_non_protein_tip_template": "3d/non_protein_tip",
		"mutation_3d_side_chain_tip_template": "3d/side_chain_tip",
		"mutation_3d_structure_color_tip_template": "3d/structure_color_tip",
		"mutation_3d_type_color_tip_template": "3d/type_color_tip",
		"mutation_info_panel_template": "info_panel/info_panel",
		"mutation_info_panel_type_template": "info_panel/info_panel_type",
		"default_mutation_details_gene_info_template": "mutation_details/gene_info",
		"default_mutation_details_info_template": "mutation_details/info",
		"default_mutation_details_list_content_template": "mutation_details/list_content",
		"default_mutation_details_main_content_template": "mutation_details/main_content",
		"default_mutation_details_template": "mutation_details/mutation_details",
		"mutation_summary_view_template": "mutation_details/mutation_summary_view",
		"mutation_view_template": "mutation_details/mutation_view",
		"mutation_details_lollipop_tip_template": "mutation_diagram/lollipop_tip",
		"mutation_details_lollipop_tip_stats_template": "mutation_diagram/lollipop_tip_stats",
		"mutation_aligner_info_template": "mutation_diagram/mutation_aligner_info",
		"mutation_customize_panel_template": "mutation_diagram/mutation_customize_panel",
		"mutation_diagram_view_template": "mutation_diagram/mutation_diagram_view",
		"mutation_help_panel_template": "mutation_diagram/mutation_help_panel",
		"mutation_details_region_tip_template": "mutation_diagram/region_tip",
		"mutation_table_cancer_study_template": "mutation_table/cancer_study",
		"mutation_table_case_id_template": "mutation_table/case_id",
		"mutation_table_cbio_portal_template": "mutation_table/cbio_portal",
		"mutation_table_cna_template": "mutation_table/cna",
		"mutation_table_cosmic_template": "mutation_table/cosmic",
		"mutation_details_cosmic_tip_template": "mutation_table/cosmic_tip",
		"mutation_table_end_pos_template": "mutation_table/end_position",
		"mutation_details_fis_tip_template": "mutation_table/fis_tip",
		"mutation_table_igv_link_template": "mutation_table/igv_link",
		"mutation_table_mutation_assessor_template": "mutation_table/mutation_assessor",
		"mutation_table_mutation_count_template": "mutation_table/mutation_count",
		"mutation_table_mutation_status_template": "mutation_table/mutation_status",
		"mutation_details_table_template": "mutation_table/mutation_table",
		"mutation_table_placeholder_template": "mutation_table/mutation_table_placeholder",
		"mutation_table_mutation_type_template": "mutation_table/mutation_type",
		"mutation_table_normal_alt_count_template": "mutation_table/normal_alt_count",
		"mutation_table_normal_freq_template": "mutation_table/normal_freq",
		"mutation_table_normal_ref_count_template": "mutation_table/normal_ref_count",
		"pancan_mutation_hist_tip_template": "mutation_table/pancan_mutation_hist_tip",
		"mutation_table_protein_change_template": "mutation_table/protein_change",
		"mutation_table_start_pos_template": "mutation_table/start_position",
		"mutation_table_tumor_alt_count_template": "mutation_table/tumor_alt_count",
		"mutation_table_tumor_freq_template": "mutation_table/tumor_freq",
		"mutation_table_tumor_ref_count_template": "mutation_table/tumor_ref_count",
		"mutation_table_tumor_type_template": "mutation_table/tumor_type",
		"mutation_table_validation_status_template": "mutation_table/validation_status",
		"mutation_details_pdb_chain_tip_template": "pdb_panel/pdb_chain_tip",
		"mutation_details_pdb_help_tip_template": "pdb_panel/pdb_help_tip",
		"pdb_panel_view_template": "pdb_panel/pdb_panel_view",
		"mutation_pdb_table_chain_cell_template": "pdb_table/chain_cell",
		"mutation_pdb_table_pdb_cell_template": "pdb_table/pdb_cell",
		"pdb_table_view_template": "pdb_table/pdb_table_view",
		"mutation_pdb_table_summary_cell_template": "pdb_table/summary_cell"
	};

	// TODO not a good practice, templates should be required when needed
	// pre-compile existing templates
	_.each(_.keys(_legacyIdMapping), function(id) {
		_cache[id] = require("../../template/" + _legacyIdMapping[id] + ".html");
	});

	/**
	 * Compiles the template for the given template id
	 * by using underscore template function.
	 *
	 * @param templateId    html id of the template content
	 * @returns function    compiled template function
	 */
	function compileTemplate(templateId)
	{
		// this is for the moustache-like templates
		_.templateSettings = {
			interpolate : /\{\{(.+?)\}\}/g
		};

		return _.template($("#" + templateId).html());
	}

	/**
	 * Gets the template function corresponding to the given template id.
	 *
	 * @param templateId    html id of the template content
	 * @returns function    template function
	 */
	function getTemplateFn(templateId)
	{
		// try to use the cached value first
		var templateFn = _cache[templateId];

		// compile if not compiled yet
		if (templateFn == null)
		{
			templateFn = compileTemplate(templateId);
			_cache[templateId] = templateFn;
		}

		return templateFn;
	}

	return {
		getTemplateFn: getTemplateFn
	};
})();

module.exports = BackboneTemplateCache;
