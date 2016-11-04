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

var PancanMutationHistogram = require("../component/PancanMutationHistogram");
var BackboneTemplateCache = require("../util/BackboneTemplateCache");

var Backbone = require("backbone");
var $ = require("jquery");

/**
 * Tooltip view for the mutation table's cBioPortal column.
 *
 * options: {el: [target container],
 *           model: {pancanMutationFreq: [pancan mutation frequency map]
 *                   cancerStudyMetaData: [cancer study meta data],
 *                   cancerStudyName: [cancer study name],
 *                   geneSymbol: [hugo gene symbol],
 *                   keyword: [mutation keyword],
 *                   qtipApi: [api reference for the rendered qtip]}
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var PancanMutationHistTipView = Backbone.View.extend({
	render: function()
	{
//		var gene = $thumbnail.attr('gene');
//		var keyword = $thumbnail.attr('keyword');
//		var metaData = window.cancer_study_meta_data;
//		var cancerStudy = window.cancerStudyName;
//		var byKeywordData = genomicEventObs.pancan_mutation_frequencies[keyword];
//		var byHugoData = genomicEventObs.pancan_mutation_frequencies[gene];

		var self = this;

		var variables = {
			gene: self.model.geneSymbol
		};

		// render view
		var templateFn = BackboneTemplateCache.getTemplateFn("pancan_mutation_hist_tip_template");
		var content = templateFn(variables);

		self.model.qtipApi.set('content.text', content);

		// format after rendering
		this.format();
	},
	format: function()
	{
		var self = this;

		var gene = self.model.geneSymbol;
		//var keyword = self.model.keyword;
		var proteinPosStart = self.model.proteinPosStart;
		var metaData = self.model.cancerStudyMetaData;
		var cancerStudy = self.model.cancerStudyName;

		//var byKeywordData = self.model.pancanMutationFreq[keyword];
		var byProteinPosData = self.model.pancanMutationFreq[proteinPosStart];
		var byHugoData = self.model.pancanMutationFreq[gene];

		var container = self.$el.find(".pancan-histogram-container");

		// init the histogram
		var histogram = PancanMutationHistogram(byProteinPosData,
		                                        byHugoData,
		                                        metaData,
		                                        container[0],
		                                        {this_cancer_study: cancerStudy});

		// update the overall count text
		self.$el.find(".overall-count").html(histogram.overallCountText());

		// correct the qtip width
		var svgWidth = $(container).find('svg').attr('width');
		self.$el.css('max-width', parseInt(svgWidth));

		// add histogram tooltips (inner tooltips)
		var svg = self.$el.find('svg')[0];
		histogram.qtip(svg);

		// add click functionality for the buttons
		$(".cross-cancer-download").click(function() {
			var fileType = $(this).attr("file-type");
			var filename = gene + "_mutations." + fileType;

			if (fileType == "pdf")
			{
				cbio.download.initDownload(svg, {
					filename: filename,
					contentType: "application/pdf",
					servletName: "svgtopdf.do"
				});
			}
			else // svg
			{
				cbio.download.initDownload(svg, {
					filename: filename
				});
			}
		});
	}
});

module.exports = PancanMutationHistTipView;