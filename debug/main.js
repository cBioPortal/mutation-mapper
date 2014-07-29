// TODO init 3d view...
var _mut3dVis = null;

// Set up Mutation View
$(document).ready(function() {
	$("body").append(window["backbone-template"]["mutationViews"]);

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
							$("#custom_mutation_case_id_template").html(), vars);
					}
				}
			}
		};

		// customized main mapper options
		var options = {
			el: "#mutation_details",
			data: {
				geneList: geneList,
				sampleList: sampleArray
			},
			proxy: {
				mutation: {
					lazy: false,
					data: mutationData
				},
				pfam: {
					lazy: false,
					data: {
						"AR": [{"markups":[],"length":"919","regions":[{"modelLength":"423","colour":"#2dcf00","text":"Androgen_recep","startStyle":"curved","endStyle":"jagged","start":6,"aliStart":"6","modelStart":"1","aliEnd":"73","display":true,"modelEnd":"65","type":"pfama","href":"\/family\/PF02166","end":75,"metadata":{"start":"6","aliStart":"6","description":"Androgen receptor","accession":"PF02166","score":"1.4e-27","aliEnd":"73","type":"Family","identifier":"Androgen_recep","database":"pfam","end":"75","scoreName":"e-value"}},{"modelLength":"423","colour":"#2dcf00","text":"Androgen_recep","startStyle":"jagged","endStyle":"curved","start":72,"aliStart":"74","modelStart":"49","aliEnd":"447","display":true,"modelEnd":"423","type":"pfama","href":"\/family\/PF02166","end":"447","metadata":{"start":"72","aliStart":"74","description":"Androgen receptor","accession":"PF02166","score":"1.1e-240","aliEnd":"447","type":"Family","identifier":"Androgen_recep","database":"pfam","end":"447","scoreName":"e-value"}},{"modelLength":"70","colour":"#ff5353","text":"zf-C4","startStyle":"curved","endStyle":"jagged","start":"557","aliStart":"557","modelStart":"1","aliEnd":"625","display":true,"modelEnd":"69","type":"pfama","href":"\/family\/PF00105","end":"626","metadata":{"start":"557","aliStart":"557","description":"Zinc finger, C4 type (two domains)","accession":"PF00105","score":"1.2e-23","aliEnd":"625","type":"Domain","identifier":"zf-C4","database":"pfam","end":"626","scoreName":"e-value"}},{"modelLength":"203","colour":"#5b5bff","text":"Hormone_recep","startStyle":"jagged","endStyle":"jagged","start":"687","aliStart":"691","modelStart":"9","aliEnd":"876","display":true,"modelEnd":"196","type":"pfama","href":"\/family\/PF00104","end":"895","metadata":{"start":"687","aliStart":"691","description":"Ligand-binding domain of nuclear hormone receptor","accession":"PF00104","score":"4.9e-28","aliEnd":"876","type":"Domain","identifier":"Hormone_recep","database":"pfam","end":"895","scoreName":"e-value"}}],"motifs":[{"colour":"#00ffff","start":76,"display":false,"type":"disorder","end":"170","metadata":{"start":"2","type":"disorder","end":"170","database":"IUPred"}},{"colour":"#00ffff","start":"175","display":false,"type":"disorder","end":"177","metadata":{"start":"175","type":"disorder","end":"177","database":"IUPred"}},{"colour":"#00ffff","start":"179","display":false,"type":"disorder","end":"180","metadata":{"start":"179","type":"disorder","end":"180","database":"IUPred"}},{"colour":"#00ffff","start":"184","display":false,"type":"disorder","end":"226","metadata":{"start":"184","type":"disorder","end":"226","database":"IUPred"}},{"colour":"#00ffff","start":"252","display":false,"type":"disorder","end":"253","metadata":{"start":"252","type":"disorder","end":"253","database":"IUPred"}},{"colour":"#00ffff","start":"293","display":false,"type":"disorder","end":"306","metadata":{"start":"293","type":"disorder","end":"306","database":"IUPred"}},{"colour":"#00ffff","start":"308","display":false,"type":"disorder","end":"312","metadata":{"start":"308","type":"disorder","end":"312","database":"IUPred"}},{"colour":"#00ffff","start":"366","display":false,"type":"disorder","end":"388","metadata":{"start":"366","type":"disorder","end":"388","database":"IUPred"}},{"colour":"#00ffff","start":"415","display":false,"type":"disorder","end":"433","metadata":{"start":"415","type":"disorder","end":"433","database":"IUPred"}},{"colour":"#cccccc","start":473,"display":true,"type":"disorder","end":"484","metadata":{"start":"444","type":"disorder","end":"484","database":"IUPred"}},{"colour":"#cccccc","start":"488","display":true,"type":"disorder","end":"491","metadata":{"start":"488","type":"disorder","end":"491","database":"IUPred"}},{"colour":"#cccccc","start":"493","display":true,"type":"disorder","end":"495","metadata":{"start":"493","type":"disorder","end":"495","database":"IUPred"}},{"colour":"#00ffff","start":"642","display":false,"type":"disorder","end":"655","metadata":{"start":"642","type":"disorder","end":"655","database":"IUPred"}},{"colour":"#00ffff","start":"736","display":false,"type":"transmembrane","end":"754","metadata":{"start":"736","type":"transmembrane","end":"754","database":"Phobius"}},{"colour":"#00ffff","start":76,"display":false,"type":"coiled_coil","end":80,"metadata":{"start":"54","type":"coiled_coil","end":"80","database":"ncoils"}},{"colour":"#00ffff","start":44,"display":false,"type":"low_complexity","end":57,"metadata":{"start":"44","score":"2.1200","type":"low_complexity","end":"57","database":"seg"}},{"colour":"#00ffff","start":76,"display":false,"type":"low_complexity","end":89,"metadata":{"start":"58","score":"0.9900","type":"low_complexity","end":"89","database":"seg"}},{"colour":"#00ffff","start":"148","display":false,"type":"low_complexity","end":"160","metadata":{"start":"148","score":"2.2000","type":"low_complexity","end":"160","database":"seg"}},{"colour":"#00ffff","start":"190","display":false,"type":"low_complexity","end":"197","metadata":{"start":"190","score":"0.8100","type":"low_complexity","end":"197","database":"seg"}},{"colour":"#00ffff","start":"201","display":false,"type":"low_complexity","end":"215","metadata":{"start":"201","score":"2.2300","type":"low_complexity","end":"215","database":"seg"}},{"colour":"#00ffff","start":"317","display":false,"type":"low_complexity","end":"339","metadata":{"start":"317","score":"2.5800","type":"low_complexity","end":"339","database":"seg"}},{"colour":"#00ffff","start":"372","display":false,"type":"low_complexity","end":"382","metadata":{"start":"372","score":"0.6800","type":"low_complexity","end":"382","database":"seg"}},{"colour":"#00ffff","start":"414","display":false,"type":"low_complexity","end":"432","metadata":{"start":"414","score":"1.9000","type":"low_complexity","end":"432","database":"seg"}},{"colour":"#86bcff","start":"449","display":true,"type":"low_complexity","end":"472","metadata":{"start":"449","type":"low_complexity","end":"472","database":"seg"}},{"colour":"#86bcff","start":"641","display":true,"type":"low_complexity","end":"656","metadata":{"start":"641","score":"2.2500","type":"low_complexity","end":"656","database":"seg"}},{"colour":"#cccccc","start":2,"display":true,"type":"disorder","end":5,"metadata":{"start":"2","type":"disorder","end":"170","database":"IUPred"}},{"colour":"#00ffff","start":448,"display":false,"type":"disorder","end":448,"metadata":{"start":"444","type":"disorder","end":"484","database":"IUPred"}}],"metadata":{"description":"Androgen receptor","accession":"P10275","identifier":"ANDR_HUMAN","organism":"Homo sapiens (Human)","database":"uniprot","taxid":"9606"}}],
						"BRCA1": [{"markups":[],"length":"1863","regions":[{"modelLength":"41","colour":"#2dcf00","text":"zf-C3HC4","startStyle":"straight","endStyle":"straight","start":24,"aliStart":"24","modelStart":"1","aliEnd":"64","display":true,"modelEnd":"41","type":"pfama","href":"\/family\/PF00097","end":64,"metadata":{"start":"24","aliStart":"24","description":"Zinc finger, C3HC4 type (RING finger)","accession":"PF00097","score":"6.6e-06","aliEnd":"64","type":"Domain","identifier":"zf-C3HC4","database":"pfam","end":"64","scoreName":"e-value"}},{"modelLength":"165","colour":"#ff5353","text":"BRCT_assoc","startStyle":"curved","endStyle":"jagged","start":"344","aliStart":"344","modelStart":"1","aliEnd":"507","display":true,"modelEnd":"164","type":"pfama","href":"\/family\/PF12820","end":"508","metadata":{"start":"344","aliStart":"344","description":"Serine-rich domain associated with BRCT","accession":"PF12820","score":"6.4e-83","aliEnd":"507","type":"Domain","identifier":"BRCT_assoc","database":"pfam","end":"508","scoreName":"e-value"}},{"modelLength":"354","colour":"#5b5bff","text":"EIN3","startStyle":"curved","endStyle":"curved","start":"648","aliStart":"648","modelStart":"1","aliEnd":"978","display":true,"modelEnd":"354","type":"pfama","href":"\/family\/PF04873","end":"978","metadata":{"start":"648","aliStart":"648","description":"Ethylene insensitive 3","accession":"PF04873","score":"1.2e-89","aliEnd":"978","type":"Family","identifier":"EIN3","database":"pfam","end":"978","scoreName":"e-value"}},{"modelLength":"78","colour":"#ebd61d","text":"BRCT","startStyle":"jagged","endStyle":"curved","start":"1648","aliStart":"1662","modelStart":"24","aliEnd":"1723","display":true,"modelEnd":"78","type":"pfama","href":"\/family\/PF00533","end":"1723","metadata":{"start":"1648","aliStart":"1662","description":"BRCA1 C Terminus (BRCT) domain","accession":"PF00533","score":"0.00016","aliEnd":"1723","type":"Family","identifier":"BRCT","database":"pfam","end":"1723","scoreName":"e-value"}},{"modelLength":"78","colour":"#ebd61d","text":"BRCT","startStyle":"jagged","endStyle":"curved","start":"1756","aliStart":"1757","modelStart":"2","aliEnd":"1842","display":true,"modelEnd":"78","type":"pfama","href":"\/family\/PF00533","end":"1842","metadata":{"start":"1756","aliStart":"1757","description":"BRCA1 C Terminus (BRCT) domain","accession":"PF00533","score":"3.3e-05","aliEnd":"1842","type":"Family","identifier":"BRCT","database":"pfam","end":"1842","scoreName":"e-value"}}],"motifs":[{"colour":"#cccccc","start":"135","display":true,"type":"disorder","end":"153","metadata":{"start":"135","type":"disorder","end":"153","database":"IUPred"}},{"colour":"#cccccc","start":"163","display":true,"type":"disorder","end":"168","metadata":{"start":"163","type":"disorder","end":"168","database":"IUPred"}},{"colour":"#cccccc","start":"176","display":true,"type":"disorder","end":"184","metadata":{"start":"176","type":"disorder","end":"184","database":"IUPred"}},{"colour":"#cccccc","start":"191","display":true,"type":"disorder","end":"195","metadata":{"start":"191","type":"disorder","end":"195","database":"IUPred"}},{"colour":"#cccccc","start":"202","display":true,"type":"disorder","end":"204","metadata":{"start":"202","type":"disorder","end":"204","database":"IUPred"}},{"colour":"#cccccc","start":"207","display":true,"type":"disorder","end":"216","metadata":{"start":"207","type":"disorder","end":"216","database":"IUPred"}},{"colour":"#cccccc","start":"218","display":true,"type":"disorder","end":"221","metadata":{"start":"218","type":"disorder","end":"221","database":"IUPred"}},{"colour":"#cccccc","start":"227","display":true,"type":"disorder","end":"293","metadata":{"start":"227","type":"disorder","end":"293","database":"IUPred"}},{"colour":"#cccccc","start":"301","display":true,"type":"disorder","end":343,"metadata":{"start":"301","type":"disorder","end":"346","database":"IUPred"}},{"colour":"#00ffff","start":"353","display":false,"type":"disorder","end":"367","metadata":{"start":"353","type":"disorder","end":"367","database":"IUPred"}},{"colour":"#00ffff","start":"371","display":false,"type":"disorder","end":"373","metadata":{"start":"371","type":"disorder","end":"373","database":"IUPred"}},{"colour":"#00ffff","start":"390","display":false,"type":"disorder","end":"410","metadata":{"start":"390","type":"disorder","end":"410","database":"IUPred"}},{"colour":"#00ffff","start":"426","display":false,"type":"disorder","end":"428","metadata":{"start":"426","type":"disorder","end":"428","database":"IUPred"}},{"colour":"#00ffff","start":"443","display":false,"type":"disorder","end":"444","metadata":{"start":"443","type":"disorder","end":"444","database":"IUPred"}},{"colour":"#cccccc","start":545,"display":true,"type":"disorder","end":"629","metadata":{"start":"494","type":"disorder","end":"629","database":"IUPred"}},{"colour":"#cccccc","start":"631","display":true,"type":"disorder","end":"632","metadata":{"start":"631","type":"disorder","end":"632","database":"IUPred"}},{"colour":"#cccccc","start":"636","display":true,"type":"disorder","end":642,"metadata":{"start":"636","type":"disorder","end":"643","database":"IUPred"}},{"colour":"#00ffff","start":"647","display":false,"type":"disorder","end":647,"metadata":{"start":"647","type":"disorder","end":"706","database":"IUPred"}},{"colour":"#00ffff","start":"708","display":false,"type":"disorder","end":"709","metadata":{"start":"708","type":"disorder","end":"709","database":"IUPred"}},{"colour":"#00ffff","start":"713","display":false,"type":"disorder","end":"714","metadata":{"start":"713","type":"disorder","end":"714","database":"IUPred"}},{"colour":"#00ffff","start":"718","display":false,"type":"disorder","end":"776","metadata":{"start":"718","type":"disorder","end":"776","database":"IUPred"}},{"colour":"#00ffff","start":"782","display":false,"type":"disorder","end":"783","metadata":{"start":"782","type":"disorder","end":"783","database":"IUPred"}},{"colour":"#00ffff","start":"786","display":false,"type":"disorder","end":"789","metadata":{"start":"786","type":"disorder","end":"789","database":"IUPred"}},{"colour":"#00ffff","start":"816","display":false,"type":"disorder","end":"821","metadata":{"start":"816","type":"disorder","end":"821","database":"IUPred"}},{"colour":"#00ffff","start":"825","display":false,"type":"disorder","end":"851","metadata":{"start":"825","type":"disorder","end":"851","database":"IUPred"}},{"colour":"#00ffff","start":"856","display":false,"type":"disorder","end":"857","metadata":{"start":"856","type":"disorder","end":"857","database":"IUPred"}},{"colour":"#00ffff","start":"868","display":false,"type":"disorder","end":"870","metadata":{"start":"868","type":"disorder","end":"870","database":"IUPred"}},{"colour":"#00ffff","start":"872","display":false,"type":"disorder","end":"873","metadata":{"start":"872","type":"disorder","end":"873","database":"IUPred"}},{"colour":"#00ffff","start":"880","display":false,"type":"disorder","end":"881","metadata":{"start":"880","type":"disorder","end":"881","database":"IUPred"}},{"colour":"#00ffff","start":"883","display":false,"type":"disorder","end":"887","metadata":{"start":"883","type":"disorder","end":"887","database":"IUPred"}},{"colour":"#00ffff","start":"896","display":false,"type":"disorder","end":"920","metadata":{"start":"896","type":"disorder","end":"920","database":"IUPred"}},{"colour":"#00ffff","start":"927","display":false,"type":"disorder","end":"932","metadata":{"start":"927","type":"disorder","end":"932","database":"IUPred"}},{"colour":"#00ffff","start":"964","display":false,"type":"disorder","end":"972","metadata":{"start":"964","type":"disorder","end":"972","database":"IUPred"}},{"colour":"#cccccc","start":"1000","display":true,"type":"disorder","end":"1027","metadata":{"start":"1000","type":"disorder","end":"1027","database":"IUPred"}},{"colour":"#cccccc","start":"1030","display":true,"type":"disorder","end":"1032","metadata":{"start":"1030","type":"disorder","end":"1032","database":"IUPred"}},{"colour":"#cccccc","start":"1034","display":true,"type":"disorder","end":"1035","metadata":{"start":"1034","type":"disorder","end":"1035","database":"IUPred"}},{"colour":"#cccccc","start":"1037","display":true,"type":"disorder","end":"1076","metadata":{"start":"1037","type":"disorder","end":"1076","database":"IUPred"}},{"colour":"#cccccc","start":"1080","display":true,"type":"disorder","end":"1081","metadata":{"start":"1080","type":"disorder","end":"1081","database":"IUPred"}},{"colour":"#cccccc","start":"1095","display":true,"type":"disorder","end":"1116","metadata":{"start":"1095","type":"disorder","end":"1116","database":"IUPred"}},{"colour":"#cccccc","start":"1127","display":true,"type":"disorder","end":"1165","metadata":{"start":"1127","type":"disorder","end":"1165","database":"IUPred"}},{"colour":"#cccccc","start":"1185","display":true,"type":"disorder","end":1208,"metadata":{"start":"1185","type":"disorder","end":"1218","database":"IUPred"}},{"colour":"#cccccc","start":"1242","display":true,"type":"disorder","end":"1251","metadata":{"start":"1242","type":"disorder","end":"1251","database":"IUPred"}},{"colour":"#cccccc","start":"1277","display":true,"type":"disorder","end":"1279","metadata":{"start":"1277","type":"disorder","end":"1279","database":"IUPred"}},{"colour":"#cccccc","start":"1281","display":true,"type":"disorder","end":"1282","metadata":{"start":"1281","type":"disorder","end":"1282","database":"IUPred"}},{"colour":"#cccccc","start":"1308","display":true,"type":"disorder","end":"1309","metadata":{"start":"1308","type":"disorder","end":"1309","database":"IUPred"}},{"colour":"#cccccc","start":1494,"display":true,"type":"disorder","end":"1505","metadata":{"start":"1311","type":"disorder","end":"1505","database":"IUPred"}},{"colour":"#cccccc","start":"1507","display":true,"type":"disorder","end":"1508","metadata":{"start":"1507","type":"disorder","end":"1508","database":"IUPred"}},{"colour":"#cccccc","start":"1512","display":true,"type":"disorder","end":"1517","metadata":{"start":"1512","type":"disorder","end":"1517","database":"IUPred"}},{"colour":"#cccccc","start":"1519","display":true,"type":"disorder","end":"1559","metadata":{"start":"1519","type":"disorder","end":"1559","database":"IUPred"}},{"colour":"#cccccc","start":1588,"display":true,"type":"disorder","end":"1596","metadata":{"start":"1563","type":"disorder","end":"1596","database":"IUPred"}},{"colour":"#cccccc","start":"1601","display":true,"type":"disorder","end":"1645","metadata":{"start":"1601","type":"disorder","end":"1645","database":"IUPred"}},{"colour":"#00ffff","start":"1647","display":false,"type":"disorder","end":1647,"metadata":{"start":"1647","type":"disorder","end":"1648","database":"IUPred"}},{"colour":"#cccccc","start":"1740","display":true,"type":"disorder","end":"1741","metadata":{"start":"1740","type":"disorder","end":"1741","database":"IUPred"}},{"colour":"#cccccc","start":"1745","display":true,"type":"disorder","end":"1749","metadata":{"start":"1745","type":"disorder","end":"1749","database":"IUPred"}},{"colour":"#cccccc","start":"1751","display":true,"type":"disorder","end":"1752","metadata":{"start":"1751","type":"disorder","end":"1752","database":"IUPred"}},{"colour":"#00ffff","start":"1701","display":false,"type":"transmembrane","end":"1719","metadata":{"start":"1701","type":"transmembrane","end":"1719","database":"Phobius"}},{"colour":"#32cd32","start":"1253","display":true,"type":"coiled_coil","end":"1273","metadata":{"start":"1253","type":"coiled_coil","end":"1273","database":"ncoils"}},{"colour":"#32cd32","start":"1397","display":true,"type":"coiled_coil","end":1403,"metadata":{"start":"1397","type":"coiled_coil","end":"1424","database":"ncoils"}},{"colour":"#00ffff","start":"394","display":false,"type":"low_complexity","end":"405","metadata":{"start":"394","score":"2.1900","type":"low_complexity","end":"405","database":"seg"}},{"colour":"#86bcff","start":"533","display":true,"type":"low_complexity","end":"544","metadata":{"start":"533","score":"2.1900","type":"low_complexity","end":"544","database":"seg"}},{"colour":"#86bcff","start":"643","display":true,"type":"low_complexity","end":647,"metadata":{"start":"643","score":"2.0800","type":"low_complexity","end":"654","database":"seg"}},{"colour":"#00ffff","start":"729","display":false,"type":"low_complexity","end":"736","metadata":{"start":"729","score":"1.3000","type":"low_complexity","end":"736","database":"seg"}},{"colour":"#86bcff","start":"1209","display":true,"type":"low_complexity","end":"1223","metadata":{"start":"1209","score":"2.0200","type":"low_complexity","end":"1223","database":"seg"}},{"colour":"#00ffff","start":"1254","display":false,"type":"low_complexity","end":"1268","metadata":{"start":"1254","score":"2.4400","type":"low_complexity","end":"1268","database":"seg"}},{"colour":"#00ffff","start":"1425","display":false,"type":"low_complexity","end":"1437","metadata":{"start":"1425","score":"2.2000","type":"low_complexity","end":"1437","database":"seg"}},{"colour":"#86bcff","start":"1572","display":true,"type":"low_complexity","end":"1587","metadata":{"start":"1572","score":"2.4100","type":"low_complexity","end":"1587","database":"seg"}},{"colour":"#00ffff","start":"1673","display":false,"type":"low_complexity","end":"1686","metadata":{"start":"1673","score":"2.4100","type":"low_complexity","end":"1686","database":"seg"}},{"colour":["#7fffb8","#b67fff","#ffb67f"],"start":"1404","display":true,"type":"pfamb","href":"\/pfamb\/PB017893","end":"1493","metadata":{"start":"1404","accession":"PB017893","type":"Pfam-B","identifier":"Pfam-B_17893","end":"1493","database":"pfam"}},{"colour":"#00ffff","start":1404,"display":false,"type":"disorder","end":1403,"metadata":{"start":"1311","type":"disorder","end":"1505","database":"IUPred"}},{"colour":"#cccccc","start":"1311","display":true,"type":"disorder","end":1396,"metadata":{"start":"1311","type":"disorder","end":"1505","database":"IUPred"}},{"colour":"#cccccc","start":509,"display":true,"type":"disorder","end":532,"metadata":{"start":"494","type":"disorder","end":"629","database":"IUPred"}},{"colour":"#cccccc","start":"1563","display":true,"type":"disorder","end":1571,"metadata":{"start":"1563","type":"disorder","end":"1596","database":"IUPred"}}],"metadata":{"description":"Breast cancer type 1 susceptibility protein EC=6.3.2.-","accession":"P38398","identifier":"BRCA1_HUMAN","organism":"Homo sapiens (Human)","database":"uniprot","taxid":"9606"}}]
					}
				}
			},
			view: {
				mutationTable: tableOpts
			}
		};

		// init mutation mapper
		var mutationMapper = new MutationMapper(options);
		mutationMapper.init(_mut3dVis);
	}

	processInput($("#mutation_file_example").val());
});
