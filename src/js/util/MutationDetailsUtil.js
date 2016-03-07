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
 * Utility class for processing collection of mutations.
 *
 * @param mutations     [optional] a MutationCollection instance
 * @constructor
 *
 * @author Selcuk Onur Sumer
 */
var MutationDetailsUtil = function(mutations)
{
	var GERMLINE = "germline"; // germline mutation constant
	var VALID = "valid";

	// init class variables
	var _mutationGeneMap = {};
	var _mutationCaseMap = {};
	var _mutationIdMap = {};
	var _mutationKeywordMap = {};
	var _mutationProteinChangeMap = {};
	var _mutationProteinPosStartMap = {};
	var _mutations = [];

	this.getMutationGeneMap = function()
	{
		return _mutationGeneMap;
	};

	this.getMutationCaseMap = function()
	{
		return _mutationCaseMap;
	};

	this.getMutationIdMap = function()
	{
		return _mutationIdMap;
	};

	this.getMutations = function()
	{
		return _mutations;
	};

	/**
	 * Updates existing maps and collections by processing the given mutations.
	 * This method appends given mutations to the existing ones, it does not
	 * reset previous mutations.
	 *
	 * @param mutations a MutationCollection instance (list of mutations)
	 */
	this.processMutationData = function(mutations)
	{
		// update collections, arrays, maps, etc.
		_mutationGeneMap = this._updateGeneMap(mutations);
		_mutationCaseMap = this._updateCaseMap(mutations);
		_mutationIdMap = this._updateIdMap(mutations);
		_mutationKeywordMap = this._updateKeywordMap(mutations);
		_mutationProteinChangeMap = this._updateProteinChangeMap(mutations);
		_mutationProteinPosStartMap = this._updateProteinPosStartMap(mutations);
		_mutations = _mutations.concat(mutations.models);
	};

	/**
	 * Retrieves protein positions corresponding to the mutations
	 * for the given gene symbol.
	 *
	 * @param gene      hugo gene symbol
	 * @return {Array}  array of protein positions
	 */
	this.getProteinPositions = function(gene)
	{
		var mutations = _mutationGeneMap[gene];

		var positions = [];

		if (mutations != null)
		{
			for(var i=0; i < mutations.length; i++)
			{
				var position = {id: mutations[i].get("mutationId"),
					start: mutations[i].getProteinStartPos(),
					end: mutations[i].get("proteinPosEnd")};

				positions.push(position);
			}
		}

		return positions;
	};

	this.getAllKeywords = function()
	{
		return _.keys(_mutationKeywordMap);
	};

	this.getAllProteinChanges = function()
	{
		return _.keys(_mutationProteinChangeMap);
	};

	this.getAllProteinPosStarts = function()
	{
		return _.keys(_mutationProteinPosStartMap);
	};

	this.getAllGenes = function()
	{
		return _.keys(_mutationGeneMap);
	};

	/**
	 * Processes the collection of mutations, and creates a map of
	 * <geneSymbol, mutation array> pairs.
	 *
	 * @param mutations collection of mutations
	 * @return {object} map of mutations (keyed on gene symbol)
	 * @private
	 */
	this._updateGeneMap = function(mutations)
	{
		var mutationMap = _mutationGeneMap;

		// process raw data to group mutations by genes
		for (var i=0; i < mutations.length; i++)
		{
			var gene = mutations.at(i).get("geneSymbol");

			if (gene != null)
			{
				gene = gene.toUpperCase();

				if (mutationMap[gene] == undefined)
				{
					mutationMap[gene] = [];
				}

				mutationMap[gene].push(mutations.at(i));
			}
		}

		return mutationMap;
	};

	/**
	 * Processes the collection of mutations, and creates a map of
	 * <case id, mutation array> pairs.
	 *
	 * @param mutations collection of mutations
	 * @return {object} map of mutations (keyed on case id)
	 * @private
	 */
	this._updateCaseMap = function(mutations)
	{
		var mutationMap = _mutationCaseMap;

		// process raw data to group mutations by genes
		for (var i=0; i < mutations.length; i++)
		{
			var caseId = mutations.at(i).get("caseId");

			if (caseId != null)
			{
				caseId = caseId.toLowerCase();

				if (mutationMap[caseId] == undefined)
				{
					mutationMap[caseId] = [];
				}

				mutationMap[caseId].push(mutations.at(i));
			}
		}

		return mutationMap;
	};

	/**
	 * Processes the collection of mutations, and creates a map of
	 * <mutation id, mutation> pairs.
	 *
	 * @param mutations collection of mutations
	 * @return {object} map of mutations (keyed on mutation id)
	 * @private
	 */
	this._updateIdMap = function(mutations)
	{
		var mutationMap = _mutationIdMap;

		// process raw data to group mutations by genes
		for (var i=0; i < mutations.length; i++)
		{
			var mutationId = mutations.at(i).get("mutationId");
			mutationMap[mutationId] = mutations.at(i);
		}

		return mutationMap;
	};

	/**
	 * Processes the collection of mutations, and creates a map of
	 * <mutation keyword, mutation array> pairs.
	 *
	 * @param mutations collection of mutations
	 * @return {object} map of mutations (keyed on mutation keyword)
	 * @private
	 */
	this._updateKeywordMap = function(mutations)
	{
		var mutationMap = _mutationKeywordMap;

		// process raw data to group mutations by genes
		for (var i=0; i < mutations.length; i++)
		{
			var keyword = mutations.at(i).get("keyword");

			if (keyword != null)
			{
				if (mutationMap[keyword] == undefined)
				{
					mutationMap[keyword] = [];
				}

				mutationMap[keyword].push(mutations.at(i));
			}
		}

		return mutationMap;
	};

	/**
	 * Processes the collection of mutations, and creates a map of
	 * <protein change, mutation array> pairs.
	 *
	 * @param mutations collection of mutations
	 * @returns {object} map of mutations (keyed on protein change)
	 * @private
	 */
	this._updateProteinChangeMap = function(mutations)
	{
		var mutationMap = _mutationProteinChangeMap;

		// process raw data to group mutations by genes
		for (var i=0; i < mutations.length; i++)
		{
			var proteinChange = mutations.at(i).get("proteinChange");

			if (proteinChange != null)
			{
				if (mutationMap[proteinChange] == undefined)
				{
					mutationMap[proteinChange] = [];
				}

				mutationMap[proteinChange].push(mutations.at(i));
			}
		}

		return mutationMap;
	};

	/**
	 * Processes the collection of mutations, and creates a map of
	 * <protein position start, mutation array> pairs.
	 *
	 * @param mutations collection of mutations
	 * @returns {object} map of mutations (keyed on protein position start)
	 * @private
	 */
	this._updateProteinPosStartMap = function(mutations)
	{
		var mutationMap = _mutationProteinPosStartMap;

		// process raw data to group mutations by genes
		for (var i=0; i < mutations.length; i++)
		{
			// using only protein position start is ambiguous,
			// so we also need gene symbol for the key...
			var gene = mutations.at(i).get("geneSymbol");
			var proteinPosStart = mutations.at(i).get("proteinPosStart");

			if (proteinPosStart != null && gene != null)
			{
				var key = gene + "_" + proteinPosStart;

				if (mutationMap[key] == undefined)
				{
					mutationMap[key] = [];
				}

				mutationMap[key].push(mutations.at(i));
			}
		}

		return mutationMap;
	};

	/**
	 * Generates a single line summary with mutation rate.
	 *
	 * @param mutationCount mutation count values as an object
	 *                      {numCases, numMutated, numSomatic, numGermline}
	 * @return {string}     single line summary string
	 */
	this.generateSummary = function(mutationCount)
	{
		var summary = "[";
		var rate;

		if (mutationCount.numGermline > 0)
		{
			rate = (mutationCount.numGermline / mutationCount.numCases) * 100;
			summary += "Germline Mutation Rate: " + rate.toFixed(1) + "%, ";
		}

		rate = (mutationCount.numSomatic / mutationCount.numCases) * 100;
		summary += "Somatic Mutation Rate: " + rate.toFixed(1) + "%]";

		return summary;
	};

	/**
	 * Counts the number of total cases, number of mutated cases, number of cases
	 * with somatic mutation, and number of cases with germline mutation.
	 *
	 * Returns an object with these values.
	 *
	 * @param gene  hugo gene symbol
	 * @param cases array of cases (strings)
	 * @return {{numCases: number,
	 *          numMutated: number,
	 *          numSomatic: number,
	 *          numGermline: number}}
	 */
	this.countMutations = function(gene, cases)
	{
		var numCases = cases.length;
		var numMutated = 0;
		var numSomatic = 0;
		var numGermline = 0;

		// count mutated cases (also count somatic and germline mutations)
		for (var i=0; i < cases.length; i++)
		{
			// get the mutations for the current case
			var mutations = _mutationCaseMap[cases[i].toLowerCase()];

			// check if case has a mutation
			if (mutations != null)
			{
				var somatic = 0;
				var germline = 0;

				for (var j=0; j < mutations.length; j++)
				{
					// skip mutations with different genes
					if (mutations[j].get("geneSymbol").toLowerCase() != gene.toLowerCase())
					{
						continue;
					}

					if (mutations[j].get("mutationStatus") &&
						mutations[j].get("mutationStatus").toLowerCase() === GERMLINE)
					{
						// case has at least one germline mutation
						germline = 1;
					}
					else
					{
						// case has at least one somatic mutation
						somatic = 1;
					}
				}

				// update counts
				numSomatic += somatic;
				numGermline += germline;
				numMutated++;
			}
		}

		// return an array of calculated values
		return {numCases: numCases,
			numMutated: numMutated,
			numSomatic: numSomatic,
			numGermline: numGermline};
	};

    /**
     * Checks if there all mutations come from a single cancer study
     *
     * @param gene  hugo gene symbol
     */
    this.cancerStudyAllTheSame = function(gene)
    {
        var self = this;
        gene = gene.toUpperCase();
	    var mutations = _mutationGeneMap[gene];

        if (mutations != null)
        {
            var prevStudy = null;

            for (var i=0; i < mutations.length; i++)
            {
                var cancerStudy = mutations[i].get("cancerStudy");
                if(prevStudy == null) {
                    prevStudy = cancerStudy;
                } else if(prevStudy != cancerStudy) {
                    return false;
                }
            }
        }

        return true;
    };

	this._contains = function(gene, matchFn)
	{
		var contains = false;

		gene = gene.toUpperCase();

		var mutations = _mutationGeneMap[gene];

		if (mutations != null)
		{
			for (var i=0; i < mutations.length; i++)
			{
				contains = matchFn(mutations[i]);

				if (contains)
				{
					break;
				}
			}
		}

		return contains;
	};

    /**
	 * Checks if there is a germline mutation for the given gene.
	 *
	 * @param gene  hugo gene symbol
	 */
	this.containsGermline = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("mutationStatus") &&
			        mutation.get("mutationStatus").toLowerCase() == GERMLINE);
		});
	};

	/**
	 * Checks if there is a "valid" validation status for the given gene.
	 *
	 * @param gene  hugo gene symbol
	 */
	this.containsValidStatus = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("validationStatus") &&
			        mutation.get("validationStatus").toLowerCase() == VALID);
		});
	};

	/**
	 * Checks if there is a link to IGV BAM file for the given gene.
	 *
	 * @param gene  hugo gene symbol
	 */
	this.containsIgvLink = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("igvLink") &&
			        mutation.get("igvLink") != "NA");
		});
	};

	/**
	 * Checks if there is valid allele frequency data for the given gene.
	 *
	 * @param gene  hugo gene symbol
	 */
	this.containsAlleleFreqT = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("tumorFreq") &&
			        mutation.get("tumorFreq") != "NA");
		});
	};

	/**
	 * Checks if there is valid copy number data for the given gene.
	 *
	 * @param gene  hugo gene symbol
	 */
	this.containsCnaData = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("cna") &&
			        mutation.get("cna") != "NA" &&
			        mutation.get("cna") != "unknown");
		});
	};

	this.containsProteinChange = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("proteinChange") &&
			        mutation.get("proteinChange") != "NA" &&
			        mutation.get("proteinChange") != "unknown");
		});
	};

	this.containsCaseId = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("caseId") &&
			        mutation.get("caseId") != "NA");
		});
	};

	this.containsChr = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("chr") &&
			        mutation.get("chr") != "NA");
		});
	};

	this.containsStartPos = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("startPos") &&
			        mutation.get("startPos") > 0);
		});
	};

	this.containsRefAllele = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("referenceAllele") &&
			        mutation.get("referenceAllele") != "NA");
		});
	};

	this.containsVarAllele = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("variantAllele") &&
			        mutation.get("variantAllele") != "NA");
		});
	};

	this.containsEndPos = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("endPos") &&
			        mutation.get("endPos") > 0);
		});
	};

	this.containsFis = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("functionalImpactScore") &&
			        mutation.get("functionalImpactScore") != "NA");
		});
	};

	this.containsCosmic = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("cosmic") &&
			        mutation.get("cosmicCount") &&
					mutation.get("cosmicCount") > 0);
		});
	};

	this.containsMutationType = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("mutationType") &&
			        mutation.get("mutationType") != "NA");
		});
	};

	this.containsMutationCount = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("mutationCount") &&
			        mutation.get("mutationCount") > 0);
		});
	};

	this.containsKeyword = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("keyword") &&
			        mutation.get("keyword") != "NA");
		});
	};

	this.containsMutationEventId = function(gene)
	{
		return this._contains(gene, function(mutation) {
			return (mutation.get("mutationEventId") &&
			        mutation.get("mutationEventId") != "NA");
		});
	};

	/**
	 * Returns the number of distinct cancer type values for
	 * the given gene
	 *
	 * @param gene  hugo gene symbol
	 * @returns {Number}    number of distinct cancer type values
	 */
	this.distinctTumorTypeCount = function(gene)
	{
		gene = gene.toUpperCase();
		var mutations = _mutationGeneMap[gene];
		var tumorTypeMap = {};

		if (mutations != null)
		{
			for (var i=0; i < mutations.length; i++)
			{
				if (mutations[i].get("tumorType"))
				{
					tumorTypeMap[mutations[i].get("tumorType")] = true;
				}
			}
		}

		return _.keys(tumorTypeMap).length;
	};

	/**
	 * Returns a sorted array of data field counts for the given gene.
	 * Does not include counts for the values provided within
	 * the exclude list.
	 *
	 * @param gene          hugo gene symbol
	 * @param dataField     data field name
	 * @param excludeList   data values to exclude while counting
	 * @return {Array}  array of data value count info
	 */
	this.dataFieldCount = function(gene, dataField, excludeList)
	{
		gene = gene.toUpperCase();
		var mutations = _mutationGeneMap[gene];
		var valueCountMap = {};

		if (mutations != null)
		{
			for (var i=0; i < mutations.length; i++)
			{
				var value = mutations[i][dataField];

				if (value &&
				    !_.contains(excludeList, value))
				{
					if (valueCountMap[value] === undefined)
					{
						valueCountMap[value] = 0;
					}

					valueCountMap[value]++;
				}
			}
		}

		var pairs = _.pairs(valueCountMap);

		pairs.sort(function(a, b) {
			return (b[1] - a[1]);
		});

		var result = [];

		_.each(pairs, function(pair, i) {
			var obj = {count: pair[1]};
			obj[dataField] = pair[0];
			result.push(obj);
		});

		return result;
	};

	// init maps by processing the initial mutations
	if (mutations != null)
	{
		this.processMutationData(mutations);
	}
};