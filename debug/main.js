
// Set up Mutation View
$(document).ready(function() {
	$("#mutationMapperTemplates").html(window["backbone-template"]["mutationViews"]);

	function basicMapperOptions()
	{
		// customized main mapper options
		return {
			el: "#mutation_details",
			proxy: {
				mutationProxy: {
					options: {
						initMode: "full"
					}
				},
				pfamProxy: {
					options: {
						initMode: "full",
						data: TestData.getPfamData()
					}
				},
				pdbProxy: {
					options: {
						initMode: "full",
						data: TestData.getPdbData()
					}
				},
				variantAnnotationProxy: {
					options: {
						initMode: "full",
						data: TestData.getAnnotationData()
					}
				},
				mutationAlignerProxy: {
					options: {
						initMode: "full",
						data: TestData.getMutationAlignerData()
					}
				}
				// TODO implement full init for pancan & portal
				//pancanProxy: {
				//	options: {
				//		initMode: "full",
				//		data: TestData.getPancanData()
				//	}
				//},
				//portalProxy: {
				//	options: {
				//		initMode: "full",
				//		data: TestData.getPortalData()
				//	}
				//}
			}
		};
	}

	function lazyInitOpts()
	{
		// TODO servlet names are for testing purposes and subject to change!
		return {
			proxy: {
				pfamProxy: {
					options: {
						servletName: $(".url-pfam-service").val() ||
						             "http://www.cbioportal.org/getPfamSequence.json",
						initMode: "lazy"
					}
				},
				pdbProxy: {
					options: {
						servletName: $(".url-pdb-service").val() ||
						             "https://cbioportal.mskcc.org/pdb-annotation/pdb_annotation",
						initMode: "lazy"
					}
				},
				mutationAlignerProxy: {
					options: {
						servletName: $(".url-mutation-aligner-service").val() ||
						             "http://www.cbioportal.org/getMutationAligner.json",
						initMode: "lazy"
					}
				},
				pancanProxy: {
					options: {
						servletName: $(".url-pancancer-mutation-service").val() ||
						             "http://www.cbioportal.org/pancancerMutations.json",
						initMode: "lazy"
					}
				},
				portalProxy: {
					options: {
						servletName: $(".url-portal-metadata-service").val() ||
						             "http://www.cbioportal.org/portalMetadata.json",
						initMode: "lazy"
					}
				},
				variantAnnotationProxy: {
					options: {
						servletName: $(".url-variant-annotation-service").val() ||
						             "http://localhost:38080/variant_annotation/hgvs",
						initMode: "lazy"
					}
				}
			}
		}
	}

	function processInput(input, remoteService)
	{
		//var sampleArray = PortalGlobals.getCases().trim().split(/\s+/);
		var parser = new window.mutationMapper.MutationInputParser();

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
					var caseIdFormat = window.mutationMapper.MutationDetailsTableFormatter.getCaseId(mutation.get("caseId"));
					var vars = {};
					vars.linkToPatientView = mutation.get("linkToPatientView");
					vars.caseId = caseIdFormat.text;
					vars.caseIdClass = caseIdFormat.style;
					vars.caseIdTip = caseIdFormat.tip;

					var templateFn;

					if (mutation.get("linkToPatientView"))
					{
						templateFn = window.mutationMapper.BackboneTemplateCache.getTemplateFn("mutation_table_case_id_template");
					}
					else
					{
						templateFn = window.mutationMapper.BackboneTemplateCache.getTemplateFn("custom_mutation_case_id_template");
					}

					return templateFn(vars);
				}
			}
		};

		// customized main mapper options
		var options = {
			data: {
				geneList: geneList,
				sampleList: sampleArray
			},
			proxy: {
				mutationProxy: {
					options: {
						data: mutationData
					}
				}
			},
			view: {
				mutationTable: tableOpts
			}
		};

		if (remoteService) {
			options = jQuery.extend(true, {}, basicMapperOptions(), lazyInitOpts(), options);
		}
		else {
			options = jQuery.extend(true, {}, basicMapperOptions(), options);
		}

		// init mutation mapper
		var mutationMapper = new window.mutationMapper.MutationMapper(options);
		mutationMapper.init();
	}

	$(".visualize-local").click(function(evt){
		processInput($("#mutation_file_example").val(), false);
	});

	$(".visualize-remote").click(function(evt){
		processInput($("#mutation_file_example").val(), true);
	});

	// initially visualize with local (static) data
	processInput($("#mutation_file_example").val(), false);
});
