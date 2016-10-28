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
 * Utility class to parse the custom mutation input data.
 *
 * @author Selcuk Onur Sumer
 */
function MutationInputParser ()
{
	var _data = null; // MutationCollection
	var _geneList = null;
	var _sampleList = null;
	var _idCounter = 0;

	// TODO add column name alternatives?
	// map of <mutation model field name, input header name> pairs
	var _headerMap = {
		"proteinPosEnd": "protein_position_end",
		"uniprotId": "uniprot_id",
		"cancerType": "cancer_type",
		"tumorType": "tumor_type",
		"cancerStudyLink": "cancer_study_link",
		"codonChange": "codon_change",
		"proteinPosStart": "protein_position_start",
		"linkToPatientView": "patient_view_link",
		"geneticProfileId": "genetic_profile_id",
		"mutationCount": "mutation_count",
		"mutationType": "mutation_type", // "variant_classification"
		"referenceAllele": "reference_allele",
		"uniprotAcc": "uniprot_accession",
		"fisValue": "fis_value",
		"functionalImpactScore": "fis",
		"cancerStudy": "cancer_study",
		"normalRefCount": "normal_ref_count",
		"ncbiBuildNo": "ncbi_build",
		"normalFreq": "normal_frequency",
		"cancerStudyShort": "cancer_study_short",
		"msaLink": "msa_link",
		"mutationStatus": "mutation_status",
		"cna": "copy_number",
		"proteinChange": "protein_change",
		"aminoAcidChange": "amino_acid_change",
		"endPos": "end_position",
		//"refseqMrnaId": "",
		"geneSymbol": "hugo_symbol",
		"tumorFreq": "tumor_frequency",
		"startPos": "start_position",
		"keyword": "keyword",
		"cosmic": "cosmic",
		"validationStatus": "validation_status",
		"mutationSid": "mutation_sid",
		//"canonicalTranscript": "",
		"normalAltCount": "normal_alt_count",
		"variantAllele": "variant_allele",
		//"mutationEventId": "",
		"mutationId": "mutation_id",
		"caseId": "sample_id", // "tumor_sample_barcode"
		"xVarLink": "xvar_link",
		"pdbLink": "pdb_link",
		"tumorAltCount": "tumor_alt_count",
		"tumorRefCount": "tumor_ref_count",
		"sequencingCenter": "center",
		"chr": "chromosome"
	};

	/**
	 * Initializes a default mutation object where all data fields are empty strings.
	 *
	 * @returns {Object}    a default "empty" mutation object
	 */
	function initMutation()
	{
		return {
			"proteinPosEnd": "",
			"uniprotId": "",
			"cancerType": "",
			"tumorType": "",
			"cancerStudyLink": "",
			"codonChange": "",
			"proteinPosStart": "",
			"linkToPatientView": "",
			"geneticProfileId": "",
			"mutationCount": "",
			"mutationType": "",
			"referenceAllele": "",
			"uniprotAcc": "",
			"fisValue": "",
			"functionalImpactScore": "",
			"cancerStudy": "",
			"normalRefCount": "",
			"ncbiBuildNo": "",
			"normalFreq": "",
			"cancerStudyShort": "",
			"msaLink": "",
			"mutationStatus": "",
			"cna": "",
			"proteinChange": "",
			"aminoAcidChange": "",
			"endPos": "",
			"refseqMrnaId": "",
			"geneSymbol": "",
			"tumorFreq": "",
			"startPos": "",
			"keyword": "",
			"cosmic": "",
			"validationStatus": "",
			"mutationSid": "",
			//"canonicalTranscript": "",
			"normalAltCount": "",
			"variantAllele": "",
			//"mutationEventId": "",
			"mutationId": "",
			"caseId": "",
			"xVarLink": "",
			"pdbLink": "",
			"tumorAltCount": "",
			"tumorRefCount": "",
			"sequencingCenter": "",
			"chr": ""
		};
	}

	/**
	 * Parses the entire input data and creates an array of mutation objects.
	 *
	 * @param input     input string/file.
	 * @returns {MutationCollection} an array of mutation objects.
	 */
	function parseInput(input)
	{
		var mutationData = new MutationCollection();

		var lines = input.split("\n");

		if (lines.length > 0)
		{
			// assuming first line is a header
			// TODO allow comments?
			var indexMap = buildIndexMap(lines[0]);

			// rest should be data
			for (var i=1; i < lines.length; i++)
			{
				// skip empty lines
				if (lines[i].length > 0)
				{
					mutationData.push(parseLine(lines[i], indexMap));
				}
			}
		}

		_data = mutationData;

		return mutationData;
	}

	/**
	 * Parses a single line of the input and returns a new mutation object.
	 *
	 * @param line      single line of the input data
	 * @param indexMap  map of <header name, index> pairs
	 * @returns {MutationModel}    a mutation model object
	 */
	function parseLine(line, indexMap)
	{
		//var mutation = initMutation();
		// init an empty mutation object
		var mutation = new MutationModel();

		// assuming values are separated by tabs
		var values = line.split("\t");
		var attributes = {};

		// find the corresponding column for each field, and set the value
		_.each(_.keys(_headerMap), function(key) {
			var value = parseValue(key, values, indexMap);

			if (value)
			{
				attributes[key] = value;
			}
		});

		attributes.mutationId = attributes.mutationId || nextId();

		// TODO mutationSid?
		attributes.mutationSid = attributes.mutationSid || attributes.mutationId;

		attributes.variantKey = VariantAnnotationUtil.generateVariantKey(attributes);

		mutation.set(attributes);
		return mutation;
	}

	/**
	 * Parses the value of a single input cell.
	 *
	 * @param field     name of the mutation model field
	 * @param values    array of values for a single input line
	 * @param indexMap  map of <header name, index> pairs
	 * @returns {string|undefined}    data value for the given field name.
	 */
	function parseValue(field, values, indexMap)
	{
		// get the column name for the given field name
		var column = _headerMap[field];
		var index = indexMap[column];
		var value = undefined;

		if (index != null &&
		    values[index] != null)
		{
			value = values[index].trim();
		}

		return value;
	}

	/**
	 * Builds a map of <header name, index> pairs, to use header names
	 * instead of index constants.
	 *
	 * @param header    header line (first line) of the input
	 * @returns {object} map of <header name, index> pairs
	 */
	function buildIndexMap(header)
	{
		var columns = header.split("\t");
		var map = {};

		_.each(columns, function(column, index) {
			map[column.trim().toLowerCase()] = index;
		});

		return map;
	}

	/**
	 * Processes the input data and creates a list of sample (case) ids.
	 *
	 * @returns {Array} an array of sample ids
	 */
	function getSampleArray()
	{
		if (_data == null)
		{
			return [];
		}

		if (_sampleList == null)
		{
			var sampleSet = {};

			_data.each(function(mutation, idx) {
				if (mutation.get("caseId") != null &&
				    mutation.get("caseId").length > 0)
				{
					sampleSet[mutation.get("caseId")] = mutation.get("caseId");
				}
			});

			_sampleList = _.values(sampleSet);
		}

		return _sampleList;
	}

	function getGeneList()
	{
		if (_data == null)
		{
			return [];
		}

		if (_geneList == null)
		{
			var geneSet = {};

			_data.each(function(mutation, idx) {
				if (mutation.get("geneSymbol") != null &&
				    mutation.get("geneSymbol").length > 0)
				{
					geneSet[mutation.get("geneSymbol").toUpperCase()] =
						mutation.get("geneSymbol").toUpperCase();
				}
			});

			_geneList = _.values(geneSet);
		}

		return _geneList;
	}

	function nextId()
	{
	    _idCounter++;

		return "stalone_mut_" + _idCounter;
	}

	return {
		parseInput: parseInput,
		getSampleArray: getSampleArray,
		getGeneList: getGeneList
	};
}
