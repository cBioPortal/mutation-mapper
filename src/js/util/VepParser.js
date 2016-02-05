/**
 * Parses JSON Retrieved from VEP web service.
 *
 * @author Selcuk Onur Sumer
 */
var VepParser = (function()
{
	var _aa3to1 = {
		"Ala": "A",
		"Arg": "R",
		"Asn": "N",
		"Asp": "D",
		"Asx": "B",
		"Cys": "C",
		"Glu": "E",
		"Gln": "Q",
		"Glx": "Z",
		"Gly": "G",
		"His": "H",
		"Ile": "I",
		"Leu": "L",
		"Lys": "K",
		"Met": "M",
		"Phe": "F",
		"Pro": "P",
		"Ser": "S",
		"Thr": "T",
		"Trp": "W",
		"Tyr": "Y",
		"Val": "V",
		"Xxx": "X",
		"Ter": "*"
	};

	var _variantMap = {
		"splice_acceptor_variant": "Splice_Site",
		"splice_donor_variant": "Splice_Site",
		"transcript_ablation": "Splice_Site",
		"stop_gained": "Nonsense_Mutation",
		"frameshift_variant": "Frame_Shift",
		"stop_lost": "Nonstop_Mutation",
		"initiator_codon_variant": "Translation_Start_Site",
		"start_lost": "Translation_Start_Site",
		"inframe_insertion": "In_Frame_Ins",
		"inframe_deletion": "In_Frame_Del",
		"missense_variant": "Missense_Mutation",
		"protein_altering_variant": "Missense_Mutation", // TODO Not sure if this is correct
		"coding_sequence_variant": "Missense_Mutation",
		"conservative_missense_variant": "Missense_Mutation",
		"rare_amino_acid_variant": "Missense_Mutation",
		"transcript_amplification": "Intron",
		"splice_region_variant": "Intron",
		"intron_variant": "Intron",
		"INTRAGENIC": "Intron",
		"intragenic_variant": "Intron",
		"incomplete_terminal_codon_variant": "Silent",
		"synonymous_variant": "Silent",
		"stop_retained_variant": "Silent",
		"NMD_transcript_variant": "Silent",
		"mature_miRNA_variant": "RNA",
		"non_coding_exon_variant": "RNA",
		"non_coding_transcript_exon_variant": "RNA",
		"non_coding_transcript_variant": "RNA",
		"nc_transcript_variant": "RNA",
		"5_prime_UTR_variant": "5'UTR",
		"5_prime_UTR_premature_start_codon_gain_variant": "5'UTR",
		"3_prime_UTR_variant": "3'UTR",
		"TF_binding_site_variant": "IGR",
		"regulatory_region_variant": "IGR",
		"regulatory_region": "IGR",
		"intergenic_variant": "IGR",
		"intergenic_region": "IGR",
		"upstream_gene_variant": "5'Flank",
		"downstream_gene_variant": "3'Flank",
		"TFBS_ablation": "Targeted_Region",
		"TFBS_amplification": "Targeted_Region",
		"regulatory_region_ablation": "Targeted_Region",
		"regulatory_region_amplification": "Targeted_Region",
		"feature_elongation": "Targeted_Region",
		"feature_truncation": "Targeted_Region"
	};

	/**
	 * Parses the raw annotation JSON object.
	 *
	 * @param annotation  JSON object returned by the web service
	 * @return {object}  parsed JSON, or null in case of an error
	 */
	function parseJSON(annotation)
	{
		var vepData = {};

		if (!annotation)
		{
			console.log("[warning] VEP parser error");
			return {};
		}
		else if (annotation.error)
		{
			console.log("[warning] VEP parser error: " + annotation.error);
			return {};
		}

		// proceed in case of no JSON error
		var alleleString = annotation["allele_string"];
		var alleles = alleleString.split("/", -1);

		if (alleles.length === 2)
		{
			vepData.referenceAllele = alleles[0];
			//vepData.put(AnnoMafProcessor.VEP_REFERENCE_ALLELE.toLowerCase(), alleles[0]);
			//vepData.put(AnnoMafProcessor.VEP_TUMOR_SEQ_ALLELE.toLowerCase(), alleles[1]);

			//vepData.put(AnnoMafProcessor.VEP_VARIANT_TYPE.toLowerCase(), variantType);
			vepData.variantType = getVariantType(alleles[0], alleles[1]);
		}

		vepData.ncbiBuildNo = annotation["assembly_name"];
		vepData.chr = annotation["seq_region_name"];
		vepData.startPos = annotation["start"];
		vepData.endPos = annotation["end"];
		vepData.strand = strandSign(annotation["strand"]);

		var transcripts = annotation["transcript_consequences"];
		var mostSevereConsequence = annotation["most_severe_consequence"];

		// parse all transcripts
		vepData.transcripts = [];
		_.each(transcripts, function(transcript, idx) {
			vepData.transcripts.push(
				parseTranscript(transcript, mostSevereConsequence, vepData.variantType));
		});

		// TODO what to do in case no canonical transcript can be determined?
		var canonicalTranscript = getCanonicalTranscript(transcripts, mostSevereConsequence);

		if (canonicalTranscript &&
		    vepData.transcripts[canonicalTranscript.index])
		{
			vepData.canonicalTranscript = vepData.transcripts[canonicalTranscript.index];
		}

		// also attach the original raw data
		vepData.rawData = annotation;

		return vepData;
	}

	function parseTranscript(transcript, mostSevereConsequence, variantType, vepData)
	{
		vepData = vepData || {};

		vepData.geneSymbol = transcript["gene_symbol"];

		// JsonNode variantAllele = transcript.path("variant_allele");
		// if (!variantAllele.isMissingNode()) {
		// vepData.put(AnnoMafProcessor.VEP_TUMOR_SEQ_ALLELE.toLowerCase(), variantAllele.asText());
		// }

		var consequenceTerms = transcript["consequence_terms"];

		if (consequenceTerms != null &&
		    consequenceTerms.length > 0)
		{
			// TODO what if more than one consequence term?
			var variantClass = variantClassification(consequenceTerms[0]);

			if(variantClass === "Frame_Shift") {
				if (variantType != null && variantType === "INS") {
					variantClass += "_Ins";
				}
				else if (variantType === "DEL") {
					variantClass += "_Del";
				}
			}

			vepData.variantClassification = variantClass;
		}

		var refseqIds = transcript["refseq_transcript_ids"];

		if (refseqIds != null &&
		    refseqIds.length > 0)
		{
			vepData.refseqIds = refseqIds;
		}

		var hgvsc = transcript["hgvsc"];
		if (hgvsc != null) {
			vepData.hgvsc = hgvsc.substr(hgvsc.indexOf(":")+1);
		}

		var hgvsp = transcript["hgvsp"];
		if (hgvsp != null)
		{
			// TODO (p.%3D) ?
			//if (hgvsp.indexOf("(p.%3D)") != -1) {
			//	vepData.put(AnnoMafProcessor.VEP_HGVSP.toLowerCase(), "p.=");
			//}

			vepData.hgvsp = hgvsp.substr(hgvsp.indexOf(":")+1);
		}

		vepData.transcriptId = transcript["transcript_id"];
		vepData.proteinPosStart = transcript["protein_start"];
		vepData.proteinPosEnd = transcript["protein_end"];
		vepData.codons = transcript["codons"];

		// create a shorter HGVS protein format
		var hgvspShort;

		if (hgvsp != null)
		{
			hgvspShort = hgvsp.substr(hgvsp.indexOf(":")+1);

			_.each(_.pairs(_aa3to1), function(pair, idx) {
				hgvspShort = hgvspShort.replace(new RegExp(pair[0], 'g'), pair[1]);
			});

			vepData.hgvspShort = hgvspShort;
		}

		if (mostSevereConsequence === "splice_acceptor_variant" ||
		    mostSevereConsequence === "splice_donor_variant")
		{
			//Pattern pattern = Pattern.compile("^c.([0-9]+)*");
			//Matcher matcher = pattern.matcher(hgvsc.asText().substring(iHgsvc+1));

			//if( matcher.find() ) {
			//	int cPos = Integer.parseInt(matcher.group(1));
			//	if( cPos < 1 ) {
			//		cPos = 1;
			//	}
			//
			//	var pPos = Integer.toString(( cPos + cPos % 3 ) / 3 );
			//
			//	vepData.hgvspShort = "p.X" + pPos + "_splice";
			//}

			if (vepData.hgvsc)
			{
				var match = /c\.([0-9]+)*/.exec(vepData.hgvsc);

				if (match && match.length == 2)
				{
					var cPos = parseInt(match[1]);

					if (cPos < 1) {
						cPos = 1;
					}

					var pPos = cPos + (cPos % 3) / 3;

					vepData.hgvspShort = "p.X" + pPos + "_splice";
				}
			}
		}

		if (mostSevereConsequence === "synonymous_variant")
		{
			hgvspShort = "p." +
				transcript["amino_acids"] +
				transcript["protein_start"] +
				transcript["amino_acids"];

			vepData.hgvspShort = hgvspShort;
		}

		// set aliases
		vepData.mutationType = vepData.variantClassification;
		vepData.proteinChange = vepData.hgvspShort;
		if (vepData.refseqIds && vepData.refseqIds.length > 0) {
			// TODO is it okay to pick the first one as the default refseq id?
			vepData.refseqMrnaId = vepData.refseqIds[0];
		}

		return vepData;
	}

	/**
	 * Finds and returns the canonical transcript within the given transcript list.
	 * Returns null in case no canonical transcript can be determined.
	 *
	 * @param transcripts list of transcript nodes
	 * @param  mostSevereConsequence
	 * @return {object} canonical transcript node
	 */
	function getCanonicalTranscript(transcripts, mostSevereConsequence)
	{
		var list = [];

		_.each(transcripts, function(transcript, idx) {
			if (transcript["canonical"] == 1)
			{
				list.push({index: idx, transcript:transcript});
			}
		});

		// trivial case: only one transcript marked as canonical
		if (list.length === 1)
		{
			return list[0];
		}
		// more than one transcript is marked as canonical,
		// use most severe consequence to decide which one to pick
		// among the ones marked as canonical
		else if (list.length > 1)
		{
			return transcriptWithMostSevereConsequence(list, mostSevereConsequence);
		}
		// no transcript is marked as canonical (list.size() == 0),
		// use most severe consequence to decide which one to pick
		// among all available transcripts
		else
		{
			_.each(transcripts, function(transcript, idx) {
				list.push({index: idx, transcript:transcript});
			});

			return transcriptWithMostSevereConsequence(list, mostSevereConsequence);
		}
	}

	/**
	 * Finds and returns the transcript node which has the given
	 * most severe consequence in its consequence terms. Returns
	 * null in case no match.
	 *
	 * @param transcripts           list of transcript nodes
	 * @param mostSevereConsequence most severe consequence
	 * @return transcript node containing most severe consequence
	 */
	function transcriptWithMostSevereConsequence(transcripts, mostSevereConsequence)
	{
		// default value is null in case of no match
		var transcriptWithMSC = null;

		_.each(transcripts, function(ele, idx) {
			var consequenceTerms = ele.transcript["consequence_terms"];

			if (transcriptWithMSC == null &&
			    consequenceTerms != null &&
			    mostSevereConsequence != null)
			{
				_.each(consequenceTerms, function(consequence, idx) {
					if (consequence.trim().toLowerCase() ===
					    mostSevereConsequence.trim().toLowerCase())
					{
						transcriptWithMSC = ele;
					}
				});
			}
		});

		return transcriptWithMSC;
	}

	function getVariantType(refAllele, varAllele)
	{
		var refLength = refAllele.length;
		var varLength = varAllele.length;
		refLength = refAllele === "-" ? 0 : refLength;
		varLength = varAllele === "-" ? 0 : varLength;

		if (refLength === varLength) {
			var npType = ["SNP", "DNP", "TNP"];
			return (refLength < 3 ? npType[refLength - 1] : "ONP");
		}
		else {
			if (refLength < varLength) {
				return "INS";
			}
			else {
				return "DEL";
			}
		}
	}

	function variantClassification(variant)
	{
		return _variantMap[variant.toLowerCase()];
	}

	function strandSign(strand)
	{
		var sign;

		if (strand == null ||
		    strand === "+" ||
		    strand === "-")
		{
			sign = strand;
		}
		else
		{
			if (strand < 0)
			{
				sign = "-";
			}
			else if (strand > 0)
			{
				sign = "+";
			}
			else
			{
				sign = strand;
			}
		}

		return sign;
	}

	return {
		parseJSON: parseJSON
	};
})();

