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

		var gene = self.model.geneSymbol;
		var keyword = self.model.keyword;
		var metaData = self.model.cancerStudyMetaData;
		var cancerStudy = self.model.cancerStudyName;

		var byKeywordData = self.model.pancanMutationFreq[keyword];
		var byHugoData = self.model.pancanMutationFreq[gene];

		// TODO parametrize or remove invisible_container
		var invisible_container = document.getElementById("pancan_mutations_histogram_container");

		var histogram = PancanMutationHistogram(byKeywordData,
		                                        byHugoData,
		                                        metaData,
		                                        invisible_container,
		                                        {this_cancer_study: cancerStudy});

		self.histogram = histogram;

		// TODO add a new template for this content
		var title = "<div><div><h3>"+gene+" mutations across all cancer studies</h3></div>" +
		            "<div style='float:right;'><button class='cross-cancer-download' file-type='pdf'>PDF</button>"+
		            "<button class='cross-cancer-download' file-type='svg'>SVG</button></div></div>"+
		            "<div><p>"+histogram.overallCountText()+"</p></div>";

		var content = title+invisible_container.innerHTML;

		self.model.qtipApi.set('content.text', content);


		this.format();
	},
	format: function()
	{
		var self = this;

		var gene = self.model.geneSymbol;

		// TODO parametrize or remove invisible_container
		var invisible_container = document.getElementById("pancan_mutations_histogram_container");

		// correct the qtip width
		var svg_width = $(invisible_container).find('svg').attr('width');
		//$(this).css('max-width', parseInt(svg_width));
		self.$el.css('max-width', parseInt(svg_width));

		//var this_svg = $(this).find('svg')[0];
		var this_svg = self.$el.find('svg')[0];
		self.histogram.qtip(this_svg);

		$(".cross-cancer-download").click(function() {
			var fileType = $(this).attr("file-type");

			var params = {
				filetype: fileType,
				filename: gene + "_mutations." + fileType,
				svgelement: (new XMLSerializer()).serializeToString(this_svg)
			};

			// TODO customize download server
			cbio.util.requestDownload("svgtopdf.do", params);
		});

		$(invisible_container).empty();     // N.B.
	}
});
