

var _mut3dVis = null;

// Set up Mutation View
$(document).ready(function() {
	function processInput(input)
	{
		//var sampleArray = PortalGlobals.getCases().trim().split(/\s+/);
		var parser = new MutationInputParser();

		// parse the provided input string
		var mutationData = parser.parseInput(input);

		var sampleArray = parser.getSampleArray();

		var geneList = parser.getGeneList();

		// No data to visualize...
		if (geneList.length == 0)
		{
			$("#mutation_details").html(
				"No data to visualize. Please make sure your input format is valid.");

			return;
		}

		// init mutation data proxy with full data
		var proxy = new MutationDataProxy(geneList.join(" "));
		proxy.initWithData(mutationData);

		// customized table options
		var tableOpts = {
			columnVisibility: {
				startPos: function (util, gene) {
					if (util.containsStartPos(gene)) {
						return "visible";
					}
					else {
						return "hidden";
					}
				},
				endPos: function (util, gene) {
					if (util.containsEndPos(gene)) {
						return "visible";
					}
					else {
						return "hidden";
					}
				},
				variantAllele: function (util, gene) {
					if (util.containsVarAllele(gene)) {
						return "visible";
					}
					else {
						return "hidden";
					}
				},
				referenceAllele: function (util, gene) {
					if (util.containsRefAllele(gene)) {
						return "visible";
					}
					else {
						return "hidden";
					}
				},
				chr: function (util, gene) {
					if (util.containsChr(gene)) {
						return "visible";
					}
					else {
						return "hidden";
					}
				}
			},
			columnRender: {
				caseId: function(datum) {
					var mutation = datum.mutation;
					var caseIdFormat = MutationDetailsTableFormatter.getCaseId(mutation.caseId);
					var vars = {};
					vars.linkToPatientView = mutation.linkToPatientView;
					vars.caseId = caseIdFormat.text;
					vars.caseIdClass = caseIdFormat.style;
					vars.caseIdTip = caseIdFormat.tip;

					if (mutation.linkToPatientView)
					{
						return _.template(
							$("#mutation_table_case_id_template").html(), vars);
					}
					else
					{
						return _.template(
							$("#standalone_mutation_case_id_template").html(), vars);
					}
				}
			}
		};

		var model = {mutationProxy: proxy,
			sampleArray: sampleArray,
			tableOpts: tableOpts};

		var options = {el: "#mutation_details",
			model: model,
			mut3dVis: _mut3dVis};

		var view = new MutationDetailsView(options);
		view.render();
	}

	processInput($("#mutation_file_example").val());
});
