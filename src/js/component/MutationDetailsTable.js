/**
 * MutationDetailsTable class (extends AdvancedDataTable)
 *
 * Highly customizable table view built on DataTables plugin.
 * See default options object (_defaultOpts) for details.
 *
 * With its default configuration, following events are dispatched by this class:
 * - MutationDetailsEvents.PDB_LINK_CLICKED:
 *   dispatched when clicked on a 3D link (in the protein change column)
 * - MutationDetailsEvents.PROTEIN_CHANGE_LINK_CLICKED:
 *   dispatched when clicked on the protein change link (in the protein change column)
 * - MutationDetailsEvents.MUTATION_TABLE_FILTERED:
 *   dispatched when the table is filter by a user input (via the search box)
 *
 * @param options       visual options object
 * @param gene          hugo gene symbol
 * @param mutationUtil  mutation details util
 * @param pancanProxy   proxy for pancancer mutation data
 * @param portalProxy   proxy for portal data
 * @constructor
 *
 * @author Selcuk Onur Sumer
 */
function MutationDetailsTable(options, gene, mutationUtil, pancanProxy, portalProxy)
{
	var self = this;

	// default options object
	var _defaultOpts = {
		el: "#mutation_details_table_d3",
		//elWidth: 740, // width of the container
		// default column options
		//
		// sTitle: display value
		// tip: tooltip value of the column header
		//
		// [data table options]: sType, sClass, sWidth, asSorting, ...
		columns: {
			datum: {sTitle: "datum",
				tip: ""},
			mutationId: {sTitle: "Mutation ID",
				tip: "Mutation ID",
				sType: "string"},
			mutationSid: {sTitle: "Mutation SID",
				tip: "",
				sType: "string"},
			caseId: {sTitle: "Sample ID",
				tip: "Sample ID",
				sType: "string"},
			cancerStudy: {sTitle: "Cancer Study",
				tip: "Cancer Study",
				sType: "string"},
			tumorType: {sTitle: "Cancer Type",
				tip: "Cancer Type",
				sType: "string"},
			proteinChange: {sTitle: "AA change",
				tip: "Protein Change",
				sType: "numeric"},
			mutationType: {sTitle: "Type",
				tip: "Mutation Type",
				sType: "string",
				sClass: "center-align-td"},
			cna: {sTitle: "Copy #",
				tip: "Copy-number status of the mutated gene",
				sType: "numeric",
				sClass: "center-align-td"},
			cosmic: {sTitle: "COSMIC",
				tip: "Overlapping mutations in COSMIC",
				sType: "numeric",
				sClass: "right-align-td",
				asSorting: ["desc", "asc"]},
			mutationStatus: {sTitle: "MS",
				tip: "Mutation Status",
				sType: "string",
				sClass: "center-align-td"},
			validationStatus: {sTitle: "VS",
				tip: "Validation Status",
				sType: "string",
				sClass: "center-align-td"},
			mutationAssessor: {sTitle: "Mutation Assessor",
				tip: "Predicted Functional Impact Score (via Mutation Assessor) for missense mutations",
				sType: "numeric",
				sClass: "center-align-td",
				asSorting: ["desc", "asc"],
				sWidth: "2%"},
			sequencingCenter: {sTitle: "Center",
				tip: "Sequencing Center",
				sType: "string",
				sClass: "center-align-td"},
			chr: {sTitle: "Chr",
				tip: "Chromosome",
				sType: "string"},
			startPos: {sTitle: "Start Pos",
				tip: "Start Position",
				sType: "numeric",
				sClass: "right-align-td"},
			endPos: {sTitle: "End Pos",
				tip: "End Position",
				sType: "numeric",
				sClass: "right-align-td"},
			referenceAllele: {sTitle: "Ref",
				tip: "Reference Allele",
				sType: "string"},
			variantAllele: {sTitle: "Var",
				tip: "Variant Allele",
				sType: "string"},
			tumorFreq: {sTitle: "Allele Freq (T)",
				tip: "Variant allele frequency<br> in the tumor sample",
				sType: "numeric",
				sClass: "right-align-td",
				asSorting: ["desc", "asc"]},
			normalFreq: {sTitle: "Allele Freq (N)",
				tip: "Variant allele frequency<br> in the normal sample",
				sType: "numeric",
				sClass: "right-align-td",
				asSorting: ["desc", "asc"]},
			tumorRefCount: {sTitle: "Var Ref",
				tip: "Variant Ref Count",
				sType: "numeric",
				sClass: "right-align-td",
				asSorting: ["desc", "asc"]},
			tumorAltCount: {sTitle: "Var Alt",
				tip: "Variant Alt Count",
				sType: "numeric",
				sClass: "right-align-td",
				asSorting: ["desc", "asc"]},
			normalRefCount: {sTitle: "Norm Ref",
				tip: "Normal Ref Count",
				sType: "numeric",
				sClass: "right-align-td",
				asSorting: ["desc", "asc"]},
			normalAltCount: {sTitle: "Norm Alt",
				tip: "Normal Alt Count",
				sType: "numeric",
				sClass: "right-align-td",
				asSorting: ["desc", "asc"]},
			igvLink: {sTitle: "BAM",
				tip: "Link to BAM file",
				sType: "string",
				sClass: "center-align-td"},
			mutationCount: {sTitle: "#Mut in Sample",
				tip: "Total number of<br> nonsynonymous mutations<br> in the sample",
				sType: "numeric",
				sClass: "right-align-td",
				asSorting: ["desc", "asc"],
				sWidth: "2%"},
			cBioPortal: {sTitle: "cBioPortal",
				tip: "Mutation frequency in cBioPortal",
				sType: "numeric",
				sClass: "right-align-td",
				asSorting: ["desc", "asc"]}
		},
		// display order of column headers
		columnOrder: [
			"datum", "mutationId", "mutationSid", "caseId", "cancerStudy", "tumorType",
			"proteinChange", "mutationType", "cna", "cBioPortal", "cosmic", "mutationStatus",
			"validationStatus", "mutationAssessor", "sequencingCenter", "chr",
			"startPos", "endPos", "referenceAllele", "variantAllele", "tumorFreq",
			"normalFreq", "tumorRefCount", "tumorAltCount", "normalRefCount",
			"normalAltCount", "igvLink", "mutationCount"
		],
		// Indicates the visibility of columns
		//
		// - Valid string constants:
		// "visible": column will be visible initially
		// "hidden":  column will be hidden initially,
		// but user can unhide the column via show/hide option
		// "excluded": column will be hidden initially,
		// and the user cannot unhide the column via show/hide option
		//
		// - Custom function: It is also possible to set a custom function
		// to determine the visibility of a column. A custom function
		// should return one of the valid string constants defined above.
		// For any unknown visibility value, column will be hidden by default.
		//
		// All other columns will be initially hidden by default.
		columnVisibility: {
			"datum": "excluded",
			"proteinChange": "visible",
			"caseId": function (util, gene) {
				if (util.containsCaseId(gene)) {
					return "visible";
				}
				else {
					return "hidden";
				}
			},
			"mutationType": function (util, gene) {
				if (util.containsMutationType(gene)) {
					return "visible";
				}
				else {
					return "hidden";
				}
			},
			"mutationAssessor": function (util, gene) {
				if (util.containsFis(gene)) {
					return "visible";
				}
				else {
					return "hidden";
				}
			},
//			"cosmic": function (util, gene) {
//				if (util.containsCosmic(gene)) {
//					return "visible";
//				}
//				else {
//					return "hidden";
//				}
//			},
			"cosmic": "visible",
			"mutationCount": function (util, gene) {
				if (util.containsMutationCount(gene)) {
					return "visible";
				}
				else {
					return "hidden";
				}
			},
			"mutationId": "excluded",
			"mutationSid": "excluded",
			"cancerStudy": "excluded",
			// TODO we may need more parameters than these two (util, gene)
			"cna" : function (util, gene) {
				if (util.containsCnaData(gene)) {
					return "visible";
				}
				else {
					return "hidden";
				}
			},
			"tumorFreq": function (util, gene) {
				if (util.containsAlleleFreqT(gene)) {
					return "visible";
				}
				else {
					return "hidden";
				}
			},
			"igvLink": function (util, gene) {
				if (util.containsIgvLink(gene)) {
					return "visible";
				}
				else {
					return "excluded";
				}
			},
			"mutationStatus": function (util, gene) {
				if (util.containsGermline(gene)) {
					return "visible";
				}
				else {
					return "hidden";
				}
			},
			"validationStatus": function (util, gene) {
				if (util.containsValidStatus(gene)) {
					return "visible";
				}
				else {
					return "hidden";
				}
			},
			"tumorType": function (util, gene) {
				var count = util.distinctTumorTypeCount(gene);

				if (count > 1) {
					return "visible";
				}
				else if (count > 0) {
					return "hidden";
				}
				else { // if (count <= 0)
					return "excluded";
				}
			},
			"cBioPortal": function (util, gene) {
				if (util.containsKeyword(gene) ||
				    util.containsMutationEventId(gene))
				{
					return "visible";
				}
				else {
					return "excluded";
				}
			}
		},
		// Indicates whether a column is searchable or not.
		// Should be a boolean value or a function.
		//
		// All other columns will be initially non-searchable by default.
		columnSearch: {
			"caseId": true,
			"mutationId": true,
			"mutationSid": true,
			"cancerStudy": true,
			"proteinChange": true,
			"tumorType": true,
			"mutationType": true
		},
		// renderer functions:
		// returns the display value for a column (may contain html elements)
		// if no render function is defined for a column,
		// then we rely on a custom "mData" function.
		columnRender: {
			"mutationId": function(datum) {
				var mutation = datum.mutation;
				return mutation.mutationId;
				//return (mutation.mutationId + "-" + mutation.mutationSid);
			},
			"mutationSid": function(datum) {
				var mutation = datum.mutation;
				return mutation.mutationSid;
			},
			"caseId": function(datum) {
				var mutation = datum.mutation;
				var caseIdFormat = MutationDetailsTableFormatter.getCaseId(mutation.caseId);
				var vars = {};
				vars.linkToPatientView = mutation.linkToPatientView;
				vars.caseId = caseIdFormat.text;
				vars.caseIdClass = caseIdFormat.style;
				vars.caseIdTip = caseIdFormat.tip;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_case_id_template");
				return templateFn(vars);
			},
			"proteinChange": function(datum) {
				var mutation = datum.mutation;
				var proteinChange = MutationDetailsTableFormatter.getProteinChange(mutation);
				var vars = {};
				vars.proteinChange = proteinChange.text;
				vars.proteinChangeClass = proteinChange.style;
				vars.proteinChangeTip = proteinChange.tip;
				vars.pdbMatchLink = MutationDetailsTableFormatter.getPdbMatchLink(mutation);

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_protein_change_template");
				return templateFn(vars);
			},
			"cancerStudy": function(datum) {
				var mutation = datum.mutation;
				var vars = {};
				//vars.cancerType = mutation.cancerType;
				vars.cancerStudy = mutation.cancerStudy;
				vars.cancerStudyShort = mutation.cancerStudyShort;
				vars.cancerStudyLink = mutation.cancerStudyLink;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_cancer_study_template");
				return templateFn(vars);
			},
			"tumorType": function(datum) {
				var mutation = datum.mutation;
				var tumorType = MutationDetailsTableFormatter.getTumorType(mutation);
				var vars = {};
				vars.tumorType = tumorType.text;
				vars.tumorTypeClass = tumorType.style;
				vars.tumorTypeTip = tumorType.tip;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_tumor_type_template");
				return templateFn(vars);
			},
			"mutationType": function(datum) {
				var mutation = datum.mutation;
				var mutationType = MutationDetailsTableFormatter.getMutationType(mutation.mutationType);
				var vars = {};
				vars.mutationTypeClass = mutationType.style;
				vars.mutationTypeText = mutationType.text;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_mutation_type_template");
				return templateFn(vars);
			},
			"cosmic": function(datum) {
				var mutation = datum.mutation;
				var cosmic = MutationDetailsTableFormatter.getCosmic(mutation.cosmicCount);
				var vars = {};
				vars.cosmicClass = cosmic.style;
				vars.cosmicCount = cosmic.count;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_cosmic_template");
				return templateFn(vars);
			},
			"cna": function(datum) {
				var mutation = datum.mutation;
				var cna = MutationDetailsTableFormatter.getCNA(mutation.cna);
				var vars = {};
				vars.cna = cna.text;
				vars.cnaClass = cna.style;
				vars.cnaTip = cna.tip;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_cna_template");
				return templateFn(vars);
			},
			"mutationCount": function(datum) {
				var mutation = datum.mutation;
				var mutationCount = MutationDetailsTableFormatter.getIntValue(mutation.mutationCount);
				var vars = {};
				vars.mutationCount = mutationCount.text;
				vars.mutationCountClass = mutationCount.style;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_mutation_count_template");
				return templateFn(vars);
			},
			"normalFreq": function(datum) {
				var mutation = datum.mutation;
				var alleleCount = MutationDetailsTableFormatter.getAlleleCount(mutation.normalAltCount);
				var normalFreq = MutationDetailsTableFormatter.getAlleleFreq(mutation.normalFreq,
					mutation.normalAltCount,
					mutation.normalRefCount,
					"simple-tip");
				var vars = {};
				vars.normalFreq = normalFreq.text;
				vars.normalFreqClass = normalFreq.style;
				vars.normalFreqTipClass = normalFreq.tipClass;
				vars.normalTotalCount = normalFreq.total;
				vars.normalAltCount = alleleCount.text;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_normal_freq_template");
				return templateFn(vars);
			},
			"tumorFreq": function(datum) {
				var mutation = datum.mutation;
				var alleleCount = MutationDetailsTableFormatter.getAlleleCount(mutation.tumorAltCount);
				var tumorFreq = MutationDetailsTableFormatter.getAlleleFreq(mutation.tumorFreq,
					mutation.tumorAltCount,
					mutation.tumorRefCount,
					"simple-tip");
				var vars = {};
				vars.tumorFreq = tumorFreq.text;
				vars.tumorFreqClass = tumorFreq.style;
				vars.tumorFreqTipClass = tumorFreq.tipClass;
				vars.tumorTotalCount = tumorFreq.total;
				vars.tumorAltCount = alleleCount.text;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_tumor_freq_template");
				return templateFn(vars);
			},
			"mutationAssessor": function(datum) {
				var mutation = datum.mutation;
				var fis = MutationDetailsTableFormatter.getFis(
					mutation.functionalImpactScore, mutation.fisValue);
				var vars = {};
				vars.fisClass = fis.fisClass;
				vars.omaClass = fis.omaClass;
				vars.fisText = fis.text;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_mutation_assessor_template");
				return templateFn(vars);
			},
			"mutationStatus": function(datum) {
				var mutation = datum.mutation;
				var mutationStatus = MutationDetailsTableFormatter.getMutationStatus(mutation.mutationStatus);
				var vars = {};
				vars.mutationStatusTip = mutationStatus.tip;
				vars.mutationStatusClass = mutationStatus.style;
				vars.mutationStatusText = mutationStatus.text;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_mutation_status_template");
				return templateFn(vars);
			},
			"validationStatus": function(datum) {
				var mutation = datum.mutation;
				var validationStatus = MutationDetailsTableFormatter.getValidationStatus(mutation.validationStatus);
				var vars = {};
				vars.validationStatusTip = validationStatus.tip;
				vars.validationStatusClass = validationStatus.style;
				vars.validationStatusText = validationStatus.text;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_validation_status_template");
				return templateFn(vars);
			},
			"normalRefCount": function(datum) {
				var mutation = datum.mutation;
				var alleleCount = MutationDetailsTableFormatter.getAlleleCount(mutation.normalRefCount);
				var vars = {};
				vars.normalRefCount = alleleCount.text;
				vars.normalRefCountClass = alleleCount.style;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_normal_ref_count_template");
				return templateFn(vars);
			},
			"normalAltCount": function(datum) {
				var mutation = datum.mutation;
				var alleleCount = MutationDetailsTableFormatter.getAlleleCount(mutation.normalAltCount);
				var vars = {};
				vars.normalAltCount = alleleCount.text;
				vars.normalAltCountClass = alleleCount.style;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_normal_alt_count_template");
				return templateFn(vars);
			},
			"tumorRefCount": function(datum) {
				var mutation = datum.mutation;
				var alleleCount = MutationDetailsTableFormatter.getAlleleCount(mutation.tumorRefCount);
				var vars = {};
				vars.tumorRefCount = alleleCount.text;
				vars.tumorRefCountClass = alleleCount.style;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_tumor_ref_count_template");
				return templateFn(vars);
			},
			"tumorAltCount": function(datum) {
				var mutation = datum.mutation;
				var alleleCount = MutationDetailsTableFormatter.getAlleleCount(mutation.tumorAltCount);
				var vars = {};
				vars.tumorAltCount = alleleCount.text;
				vars.tumorAltCountClass = alleleCount.style;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_tumor_alt_count_template");
				return templateFn(vars);
			},
			"startPos": function(datum) {
				var mutation = datum.mutation;
				var startPos = MutationDetailsTableFormatter.getIntValue(mutation.startPos);
				var vars = {};
				vars.startPos = startPos.text;
				vars.startPosClass = startPos.style;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_start_pos_template");
				return templateFn(vars);
			},
			"endPos": function(datum) {
				var mutation = datum.mutation;
				var endPos = MutationDetailsTableFormatter.getIntValue(mutation.endPos);
				var vars = {};
				vars.endPos = endPos.text;
				vars.endPosClass = endPos.style;

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_end_pos_template");
				return templateFn(vars);
			},
			"sequencingCenter": function(datum) {
				var mutation = datum.mutation;
				return mutation.sequencingCenter;
			},
			"chr": function(datum) {
				var mutation = datum.mutation;
				return mutation.chr;
			},
			"referenceAllele": function(datum) {
				var mutation = datum.mutation;
				return mutation.referenceAllele;
			},
			"variantAllele": function(datum) {
				var mutation = datum.mutation;
				return mutation.variantAllele;
			},
			"igvLink": function(datum) {
				//vars.xVarLink = mutation.xVarLink;
				//vars.msaLink = mutation.msaLink;
				//vars.igvLink = mutation.igvLink;
				var mutation = datum.mutation;
				var vars = {};
				vars.igvLink = MutationDetailsTableFormatter.getIgvLink(mutation);

				var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_igv_link_template");
				return templateFn(vars);
			},
			"cBioPortal": function(datum) {
				var mutation = datum.mutation;

				// portal value may be null,
				// because we are retrieving the data through another ajax call...
				if (datum.cBioPortal == null)
				{
					// TODO make the image customizable?
					var vars = {loaderImage: "images/ajax-loader.gif", width: 15, height: 15};
					var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_placeholder_template");
					return templateFn(vars);
				}
				else
				{
					var portal = MutationDetailsTableFormatter.getCbioPortal(datum.cBioPortal);

					var vars = {};
					vars.portalFrequency = portal.frequency;
					vars.portalClass = portal.style;

					var templateFn = BackboneTemplateCache.getTemplateFn("mutation_table_cbio_portal_template");
					return templateFn(vars);
				}
			}
		},
		// default tooltip functions
		columnTooltips: {
			"simple": function(selector, helper) {
				var qTipOptions = MutationViewsUtil.defaultTableTooltipOpts();
				$(selector).find('.simple-tip').qtip(qTipOptions);
				//tableSelector.find('.best_effect_transcript').qtip(qTipOptions);
				//tableSelector.find('.cc-short-study-name').qtip(qTipOptions);
				//$('#mutation_details .mutation_details_table td').qtip(qTipOptions);
			},
			"cosmic": function(selector, helper) {
				var gene = helper.gene;
				var mutationUtil = helper.mutationUtil;
				var qTipOptions = MutationViewsUtil.defaultTableTooltipOpts();

				// add tooltip for COSMIC value
				$(selector).find('.mutation_table_cosmic').each(function() {
					var label = this;
					var mutationId = $(label).closest("tr.mutation-table-data-row").attr("id");
					var mutation = mutationUtil.getMutationIdMap()[mutationId];

					// copy default qTip options and modify "content" to customize for cosmic
					var qTipOptsCosmic = {};
					jQuery.extend(true, qTipOptsCosmic, qTipOptions);

					qTipOptsCosmic.content = {text: "NA"}; // content is overwritten on render
					qTipOptsCosmic.events = {render: function(event, api) {
						var model = {cosmic: mutation.cosmic,
							keyword: mutation.keyword,
							geneSymbol: gene,
							total: $(label).text()};

						var container = $(this).find('.qtip-content');

						// create & render cosmic tip view
						var cosmicView = new CosmicTipView({el: container, model: model});
						cosmicView.render();
					}};

					$(label).qtip(qTipOptsCosmic);
				});
			},
			"mutationAssessor": function(selector, helper) {
				var gene = helper.gene;
				var mutationUtil = helper.mutationUtil;
				var qTipOptions = MutationViewsUtil.defaultTableTooltipOpts();

				// add tooltip for Predicted Impact Score (FIS)
				$(selector).find('.oma_link').each(function() {
					var mutationId = $(this).closest("tr.mutation-table-data-row").attr("id");
					var mutation = mutationUtil.getMutationIdMap()[mutationId];
					var fis = MutationDetailsTableFormatter.getFis(
						mutation.functionalImpactScore, mutation.fisValue);

					// copy default qTip options and modify "content"
					// to customize for predicted impact score
					var qTipOptsOma = {};
					jQuery.extend(true, qTipOptsOma, qTipOptions);

					qTipOptsOma.content = {text: "NA"}; // content is overwritten on render
					qTipOptsOma.events = {render: function(event, api) {
						var model = {impact: fis.value,
							xvia: mutation.xVarLink,
							msaLink: mutation.msaLink,
							pdbLink: mutation.pdbLink};

						var container = $(this).find('.qtip-content');

						// create & render FIS tip view
						var fisTipView = new PredictedImpactTipView({el:container, model: model});
						fisTipView.render();
					}};

					$(this).qtip(qTipOptsOma);
				});
			},
			"cBioPortal": function(selector, helper) {
				var gene = helper.gene;
				var mutationUtil = helper.mutationUtil;
				var portalProxy = helper.portalProxy;
				var additionalData= helper.additionalData;

				var addTooltip = function (frequencies, cancerStudyMetaData, cancerStudyName)
				{
					$(selector).find('.mutation_table_cbio_portal').each(function(idx, ele) {
						var mutationId = $(this).closest("tr.mutation-table-data-row").attr("id");
						var mutation = mutationUtil.getMutationIdMap()[mutationId];
						var cancerStudy = cancerStudyName || mutation.cancerStudy;

						$(ele).qtip({
							content: {text: 'pancancer mutation bar chart is broken'},
							events: {
								render: function(event, api) {
									var model = {pancanMutationFreq: frequencies,
										cancerStudyMetaData: cancerStudyMetaData,
										cancerStudyName: cancerStudy,
										geneSymbol: gene,
										keyword: mutation.keyword,
										qtipApi: api};

									//var container = $(this).find('.qtip-content');
									var container = $(this);

									// create & render the view
									var pancanTipView = new PancanMutationHistTipView({el:container, model: model});
									pancanTipView.render();
								}
							},
							hide: {fixed: true, delay: 100 },
							style: {classes: 'qtip-light qtip-rounded qtip-shadow', tip: true},
							position: {my:'center right',at:'center left',viewport: $(window)}
						});
					});
				};

				if (additionalData.pancanFrequencies != null)
				{
					// TODO always get the cancerStudyName from the mutation data?
					portalProxy.getPortalData(
						{cancerStudyMetaData: true, cancerStudyName: true}, function(portalData) {
							addTooltip(additionalData.pancanFrequencies,
							           portalData.cancerStudyMetaData,
							           portalData.cancerStudyName);
					});
				}
			}
		},
		// default event listener config
		// TODO add more params if necessary
		eventListeners: {
			"windowResize": function(dataTable, dispatcher, mutationUtil, gene) {
				// add resize listener to the window to adjust column sizing
				$(window).one('resize', function () {
					if (dataTable.is(":visible"))
					{
						dataTable.fnAdjustColumnSizing();
					}
				});
			},
			"igvLink": function(dataTable, dispatcher, mutationUtil, gene) {
				// add click listener for each igv link to get the actual parameters
				// from another servlet
				$(dataTable).find('.igv-link').off("click").on("click", function(evt) {
					evt.preventDefault();

					var mutationId = $(this).closest("tr.mutation-table-data-row").attr("id");
					var mutation = mutationUtil.getMutationIdMap()[mutationId];
					var url = mutation.igvLink;

					// get parameters from the server and call related igv function
					$.getJSON(url, function(data) {
						prepIGVLaunch(data.bamFileUrl,
						              data.encodedLocus,
						              data.referenceGenome,
						              data.trackName);
					});
				});
			},
			"proteinChange3d": function(dataTable, dispatcher, mutationUtil, gene) {
				// add click listener for each 3D link
				$(dataTable).find('.mutation-table-3d-link').off("click").on("click", function(evt) {
					evt.preventDefault();

					var mutationId = $(this).closest("tr.mutation-table-data-row").attr("id");

					dispatcher.trigger(
						MutationDetailsEvents.PDB_LINK_CLICKED,
						mutationId);
				});
			},
			"proteinChange": function(dataTable, dispatcher, mutationUtil, gene) {
				// add click listener for each protein change link
				$(dataTable).find('.mutation-table-protein-change a').off("click").on("click", function(evt) {
					evt.preventDefault();

					var mutationId = $(this).closest("tr.mutation-table-data-row").attr("id");

					dispatcher.trigger(
						MutationDetailsEvents.PROTEIN_CHANGE_LINK_CLICKED,
						mutationId);
				});
			}
		},
		// column sort functions:
		// returns the value to be used for column sorting purposes.
		// if no sort function is defined for a column,
		// then uses the render function for sorting purposes.
		columnSort: {
			"mutationId": function(datum) {
				var mutation = datum.mutation;
				return mutation.mutationId;
			},
			"mutationSid": function(datum) {
				var mutation = datum.mutation;
				return mutation.mutationSid;
			},
			"caseId": function(datum) {
				var mutation = datum.mutation;
				return mutation.caseId;
			},
			"proteinChange": function(datum) {
				var proteinChange = datum.mutation.proteinChange;
				var matched = proteinChange.match(/.*[A-Z]([0-9]+)[^0-9]+/);

				if (matched && matched.length > 1)
				{
					return parseInt(matched[1]);
				}
				else
				{
					return -Infinity;
				}
			},
			"cancerStudy": function(datum) {
				var mutation = datum.mutation;
				return mutation.cancerStudy;
			},
			"tumorType": function(datum) {
				var mutation = datum.mutation;
				return mutation.tumorType;
			},
			"mutationType": function(datum) {
				var mutation = datum.mutation;
				return mutation.mutationType;
			},
			"cosmic": function(datum) {
				var mutation = datum.mutation;
				return MutationDetailsTableFormatter.assignIntValue(mutation.cosmicCount);
			},
			"cna": function(datum) {
				var mutation = datum.mutation;
				return MutationDetailsTableFormatter.assignIntValue(mutation.cna);
			},
			"mutationCount": function(datum) {
				var mutation = datum.mutation;
				return MutationDetailsTableFormatter.assignIntValue(mutation.mutationCount);
			},
			"normalFreq": function(datum) {
				var mutation = datum.mutation;
				return MutationDetailsTableFormatter.assignFloatValue(mutation.normalFreq);
			},
			"tumorFreq": function(datum) {
				var mutation = datum.mutation;
				return MutationDetailsTableFormatter.assignFloatValue(mutation.tumorFreq);
			},
			"mutationAssessor": function(datum) {
				var mutation = datum.mutation;

				return MutationDetailsTableFormatter.assignValueToPredictedImpact(
					mutation.functionalImpactScore,
					mutation.fisValue);
			},
			"mutationStatus": function(datum) {
				var mutation = datum.mutation;
				return mutation.mutationStatus;
			},
			"validationStatus": function(datum) {
				var mutation = datum.mutation;
				return mutation.validationStatus;
			},
			"normalRefCount": function(datum) {
				var mutation = datum.mutation;
				return MutationDetailsTableFormatter.assignIntValue(mutation.normalRefCount);
			},
			"normalAltCount": function(datum) {
				var mutation = datum.mutation;
				return MutationDetailsTableFormatter.assignIntValue(mutation.normalAltCount);
			},
			"tumorRefCount": function(datum) {
				var mutation = datum.mutation;
				return MutationDetailsTableFormatter.assignIntValue(mutation.tumorRefCount);
			},
			"tumorAltCount": function(datum) {
				var mutation = datum.mutation;
				return MutationDetailsTableFormatter.assignIntValue(mutation.tumorAltCount);
			},
			"startPos": function(datum) {
				var mutation = datum.mutation;
				return MutationDetailsTableFormatter.assignIntValue(mutation.startPos);
			},
			"endPos": function(datum) {
				var mutation = datum.mutation;
				return MutationDetailsTableFormatter.assignIntValue(mutation.endPos);
			},
			"sequencingCenter": function(datum) {
				var mutation = datum.mutation;
				return mutation.sequencingCenter;
			},
			"chr": function(datum) {
				var mutation = datum.mutation;
				return mutation.chr;
			},
			"referenceAllele": function(datum) {
				var mutation = datum.mutation;
				return mutation.referenceAllele;
			},
			"variantAllele": function(datum) {
				var mutation = datum.mutation;
				return mutation.variantAllele;
			},
			"igvLink": function(datum) {
				var mutation = datum.mutation;
				return mutation.igvLink;
			},
			"cBioPortal": function(datum) {
				var portal = datum.cBioPortal;

				// portal value may be null,
				// because we are retrieving it through another ajax call...
				return portal || 0;
			}
		},
		// column filter functions:
		// returns the value to be used for column sorting purposes.
		// if no filter function is defined for a column,
		// then uses the sort function value for filtering purposes.
		// if no sort function is defined either, then uses
		// the value returned by the render function.
		columnFilter: {
			"proteinChange": function(datum) {
				return datum.mutation.proteinChange;
			},
			"cosmic": function(datum) {
				return datum.mutation.cosmicCount;
			},
			"cna": function(datum) {
				return datum.mutation.cna;
			},
			"mutationCount": function(datum) {
				return datum.mutation.mutationCount;
			},
			"normalFreq": function(datum) {
				return datum.mutation.normalFreq;
			},
			"tumorFreq": function(datum) {
				return datum.mutation.tumorFreq;
			},
			"mutationAssessor": function(datum) {
				return datum.mutation.functionalImpactScore;
			},
			"normalRefCount": function(datum) {
				return datum.mutation.normalRefCount;
			},
			"normalAltCount": function(datum) {
				return datum.mutation.normalAltCount;
			},
			"tumorRefCount": function(datum) {
				return datum.mutation.tumorRefCount;
			},
			"tumorAltCount": function(datum) {
				return datum.mutation.tumorAltCount;
			},
			"startPos": function(datum) {
				return datum.mutation.startPos;
			},
			"endPos": function(datum) {
				return datum.mutation.endPos;
			}
		},
		// native "mData" function for DataTables plugin. if this is implemented,
		// functions defined in columnRender and columnSort will be ignored.
		// in addition to default source, type, and val parameters,
		// another parameter "indexMap" will also be passed to the function.
		columnData: {
			// not implemented by default:
			// default config relies on columnRender,
			// columnSort, and columnFilter functions
		},
		// optional data retrieval functions for the additional data.
		// these functions can be used to retrieve more data via ajax calls,
		// to update the table on demand.
		additionalData: {
			"cBioPortal": function(helper) {
				var pancanProxy = helper.pancanProxy;
				var indexMap = helper.indexMap;
				var dataTable = helper.dataTable;
				var additionalData = helper.additionalData;

				// get the pancan data and update the data & display values
				pancanProxy.getPancanData({cmd: "byKeywords"}, mutationUtil, function(dataByKeyword) {
					pancanProxy.getPancanData({cmd: "byHugos"}, mutationUtil, function(dataByGeneSymbol) {
						var frequencies = PancanMutationDataUtil.getMutationFrequencies(
							dataByKeyword, dataByGeneSymbol);

						additionalData.pancanFrequencies = frequencies;

						var tableData = dataTable.fnGetData();

						// update mutation counts (cBioPortal data field) for each datum
						_.each(tableData, function(ele, i) {
							// update the value of the datum
							ele[indexMap["datum"]].cBioPortal = PancanMutationDataUtil.countByKey(
								frequencies, ele[indexMap["datum"]].mutation.keyword);

							// update but do not redraw, it is too slow
							dataTable.fnUpdate(null, i, indexMap["cBioPortal"], false, false);
						});

						if (tableData.length > 0)
						{
							// this update is required to re-render the entire column!
							dataTable.fnUpdate(null, 0, indexMap["cBioPortal"]);
						}
					});
				});
			}
		},
		// delay amount before applying the user entered filter query
		filteringDelay: 600,
		// WARNING: overwriting advanced DataTables options such as
		// aoColumnDefs, oColVis, and fnDrawCallback may break column
		// visibility, sorting, and filtering. Proceed wisely ;)
		dataTableOpts: {
			"sDom": '<"H"<"mutation_datatables_filter"f>C<"mutation_datatables_info"i>>t<"F">',
			"bJQueryUI": true,
			"bPaginate": false,
			//"sPaginationType": "two_button",
			"bFilter": true,
			"sScrollY": "600px",
			"bScrollCollapse": true,
			"oLanguage": {
				"sInfo": "Showing _TOTAL_ mutation(s)",
				"sInfoFiltered": "(out of _MAX_ total mutations)",
				"sInfoEmpty": "No mutations to show"
			}
		}
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	// call super constructor to init options and other params
	AdvancedDataTable.call(this, _options);
	_options = self._options;

	// custom event dispatcher
	var _dispatcher = self._dispatcher;

	// flag used to switch events on/off
	var _eventActive = true;

	// this is used to check if search string is changed after each redraw
	var _prevSearch = "";

	// last search string manually entered by the user
	var _manualSearch = "";

	var _rowMap = {};

	var _selectedRow = null;

	var _additionalData = {};

	/**
	 * Generates the data table options for the given parameters.
	 *
	 * @param tableSelector jQuery selector for the target table
	 * @param rows          data rows
	 * @param columnOpts    column options
	 * @param nameMap       map of <column display name, column name>
	 * @param indexMap      map of <column name, column index>
	 * @param hiddenCols    indices of the hidden columns
	 * @param excludedCols  indices of the excluded columns
	 * @param nonSearchableCols    indices of the columns excluded from search
	 * @return {object}     DataTable options
	 * @private
	 */
	function initDataTableOpts(tableSelector, rows, columnOpts, nameMap,
		indexMap, hiddenCols, excludedCols, nonSearchableCols)
	{
		// generate column options for the data table
		var columns = DataTableUtil.getColumnOptions(columnOpts,
			indexMap);

		// these are the parametric data tables options
		var tableOpts = {
			"aaData" : rows,
			"aoColumns" : columns,
			"aoColumnDefs":[
				{"bVisible": false,
					"aTargets": hiddenCols},
				{"bSearchable": false,
					"aTargets": nonSearchableCols}
			],
			"oColVis": {"aiExclude": excludedCols}, // columns to always hide
			"fnDrawCallback": function(oSettings) {
				self._addColumnTooltips({gene: gene,
					mutationUtil: mutationUtil,
					pancanProxy: pancanProxy,
					portalProxy: portalProxy,
					additionalData: _additionalData});
				self._addEventListeners(indexMap);

				var currSearch = oSettings.oPreviousSearch.sSearch;

				// trigger the event only if the corresponding flag is set
				// and there is a change in the search term
				if (_eventActive &&
				    _prevSearch != currSearch)
				{
					// trigger corresponding event
					_dispatcher.trigger(
						MutationDetailsEvents.MUTATION_TABLE_FILTERED,
						tableSelector);

					// assuming events are active for only manual filtering
					// so update manual search string only after triggering the event
					_manualSearch = currSearch;
				}

				// update prev search string reference for future use
				_prevSearch = currSearch;
			},
			"fnRowCallback": function(nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
				var mutation = aData[indexMap["datum"]].mutation;
				// TODO mapping on mutationId and mutationSid...
				//var key = mutation.mutationId;
				//_rowMap[key] = nRow;
				$(nRow).attr("id", mutation.mutationId);
				$(nRow).addClass(mutation.mutationSid);
				$(nRow).addClass("mutation-table-data-row");
			},
			"fnInitComplete": function(oSettings, json) {
				// TODO this may not be safe
				// remove invalid links
				$(tableSelector).find('a[href=""]').remove();
				//$(tableSelector).find('a[alt=""]').remove();
				//$(tableSelector).find('a.igv-link[alt=""]').remove();

				// TODO append the footer
				// (there is no API to init the footer, we need a custom function)
				//$(tableSelector).append('<tfoot></tfoot>');
				//$(tableSelector).find('thead tr').clone().appendTo($(tableSelector).find('tfoot'));

//				// trigger corresponding event
//				_dispatcher.trigger(
//					MutationDetailsEvents.MUTATION_TABLE_READY);

				self._loadAdditionalData({
					pancanProxy: pancanProxy,
					portalProxy: portalProxy,
					indexMap: self.getIndexMap(),
					additionalData: _additionalData,
					dataTable: this
				});
			},
			"fnHeaderCallback": function(nHead, aData, iStart, iEnd, aiDisplay) {
			    $(nHead).find('th').addClass("mutation-details-table-header");
				self._addHeaderTooltips(nHead, nameMap);
		    }
//		    "fnFooterCallback": function(nFoot, aData, iStart, iEnd, aiDisplay) {
//			    addFooterTooltips(nFoot, nameMap);
//		    }
		};

		return tableOpts;
	}

	/**
	 * Determines the visibility value for the given column name
	 *
	 * @param columnName    name of the column (header)
	 * @return {String}     visibility value for the given column
	 */
	function visibilityValue(columnName)
	{
		var vis = _options.columnVisibility[columnName];
		var value = vis;

		// if not in the list, hidden by default
		if (!vis)
		{
			value = "hidden";
		}
		// if function, then evaluate the value
		else if (_.isFunction(vis))
		{
			value = vis(mutationUtil, gene);
		}

		return value;
	}

	/**
	 * Determines the search value for the given column name
	 *
	 * @param columnName    name of the column (header)
	 * @return {Boolean}    whether searchable or not
	 */
	function searchValue(columnName)
	{
		var searchVal = _options.columnSearch[columnName];
		var value = searchVal;

		// if not in the list, hidden by default
		if (searchVal == null)
		{
			value = false;
		}
		// if function, then evaluate the value
		else if (_.isFunction(searchVal))
		{
			// TODO determine function params (if needed)
			value = searchVal();
		}

		return value;
	}

	/**
	 * Adds default event listeners for the table.
	 *
	 * @param indexMap  column index map
	 */
	function addEventListeners(indexMap)
	{
		// add listeners only if the data table is initialized
		if (self.getDataTable() != null)
		{
			_.each(_options.eventListeners, function(listenerFn) {
				listenerFn(self.getDataTable(), _dispatcher, mutationUtil, gene);
			});
		}
	}

	function selectRow(mutationId)
	{
		// remove previous highlights
		removeAllSelection();

		// highlight selected
		var nRow = _rowMap[mutationId];
		$(nRow).addClass("row_selected");

		_selectedRow = nRow;
	}

	function removeAllSelection()
	{
		$(_options.el).find("tr").removeClass("row_selected");
	}

	function getSelectedRow()
	{
		return _selectedRow;
	}

	/**
	 * Enables/disables event triggering.
	 *
	 * @param active    boolean value
	 */
	function setEventActive(active)
	{
		_eventActive = active;
	}

	/**
	 * Resets filtering related variables to their initial state.
	 * Does not remove actual table filters.
	 */
	function cleanFilters()
	{
		_prevSearch = "";
		_manualSearch = "";
	}

	function getManualSearch()
	{
		return _manualSearch;
	}

	/**
	 * Adds tooltips for the table header cells.
	 *
	 * @param nHead     table header
	 * @param nameMap   map of <column display name, column name>
	 * @private
	 */
	function addHeaderTooltips(nHead, nameMap)
	{
		var qTipOptions = MutationViewsUtil.defaultTableTooltipOpts();

		var qTipOptionsHeader = {};
		jQuery.extend(true, qTipOptionsHeader, qTipOptions);
		qTipOptionsHeader.position = {my:'bottom center', at:'top center', viewport: $(window)};

		//tableSelector.find('thead th').qtip(qTipOptionsHeader);
		$(nHead).find("th").each(function(){
			var displayName = $(this).text();
			var colName = nameMap[displayName];

			if (colName != null)
			{
				var tip = _options.columns[colName].tip;

				//$(this).attr("alt", tip);
				qTipOptionsHeader.content = {text: tip};
				$(this).qtip(qTipOptionsHeader);
			}
		});
	}

	/**
	 * Adds tooltips for the table footer cells.
	 *
	 * @param nFoot table footer
	 * @private
	 */
	function addFooterTooltips(nFoot)
	{
		var qTipOptions = MutationViewsUtil.defaultTableTooltipOpts();

		var qTipOptionsFooter = {};
		jQuery.extend(true, qTipOptionsFooter, qTipOptions);
		qTipOptionsFooter.position = {my:'top center', at:'bottom center', viewport: $(window)};

		//tableSelector.find('tfoot th').qtip(qTipOptionsFooter);
		$(nFoot).find("th").qtip(qTipOptionsFooter);
	}

	// override required functions
	this._initDataTableOpts = initDataTableOpts;
	this._visibilityValue = visibilityValue;
	this._searchValue = searchValue;
	this._addEventListeners = addEventListeners;
	this._addHeaderTooltips = addHeaderTooltips;

	// additional public functions
	this.setEventActive = setEventActive;
	this.getManualSearch = getManualSearch;
	this.cleanFilters = cleanFilters;
	//this.selectRow = selectRow;
	//this.getSelectedRow = getSelectedRow;
	this.dispatcher = this._dispatcher;
}

// MutationDetailsTable extends AdvancedDataTable...
MutationDetailsTable.prototype = new AdvancedDataTable();
MutationDetailsTable.prototype.constructor = MutationDetailsTable;

