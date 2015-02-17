/**
 * Tooltip view for the mutation table's cosmic column.
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
