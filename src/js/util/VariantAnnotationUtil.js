/*
 * Copyright (c) 2016 Memorial Sloan-Kettering Cancer Center.
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

var VepParser = require("../util/VepParser");

var cbio = {
	util: require("../util/cbio-util")
};

var _ = require("underscore");

/**
 * Singleton utility class for variant annotation related tasks.
 *
 * @author Selcuk Onur Sumer
 */
var VariantAnnotationUtil = (function()
{
	function addAnnotationData(mutations, annotationData, parseFn)
	{
		var indexedData = _.indexBy(annotationData, "variant");

		if (!_.isFunction(parseFn))
		{
			parseFn = defaultParseAnnotationData;
		}

		_.each(mutations, function(mutation, idx) {
			var annotation = indexedData[mutation.get("variantKey")];
			var parsed = null;

			// check if annotation has an id field
			if (annotation && annotation.id)
			{
				parsed = parseFn(annotation);
			}
			// if no id field, then try the annotationJSON field
			else if (annotation && annotation.annotationJSON)
			{
				parsed = parseFn(annotation.annotationJSON);
			}

			if (parsed)
			{
				// only update undefined fields!
				setUndefinedFields(mutation, parsed);
			}
		});
	}

	/**
	 * Updates only the undefined fields of the given mutation.
	 *
	 * @param mutation  a MutationModel instance
	 * @param annotation    annotation data for single variant
	 */
	function setUndefinedFields(mutation, annotation)
	{
		var update = {};

		_.each(_.keys(annotation), function(fieldName) {
			if (_.isUndefined(mutation.get(fieldName)))
			{
				update[fieldName] = annotation[fieldName];
			}
		});

		if (!_.isEmpty(update))
		{
			mutation.set(update);
		}
	}

	/**
	 * Default parse function that retrieves the partial data from
	 * the raw annotation data.
	 *
	 * @param annotation    raw annotation data (from VEP)
	 * @returns {object} parsed annotation data
	 */
	function defaultParseAnnotationData(annotation)
	{
		var vepData = VepParser.parseJSON(annotation);
		var canonical = vepData.canonicalTranscript;

		// in case of empty annotation data (possible error),
		// corresponding data fields will be empty string

		// TODO define a proper VariantAnnotation model instead?
		var empty = {
			startPos: "",
			endPos: "",
			chr: "",
			referenceAllele: "",
			variantAllele: "",
			proteinChange: ""
		};

		// remove unused fields
		delete(vepData.rawData);
		delete(vepData.transcripts);
		delete(vepData.refseqIds);
		delete(vepData.canonicalTranscript);

		// copy canonical data properties
		return _.extend(empty, vepData, canonical);
	}

	/**
	 * Generates variant key for annotation queries.
	 * This function assumes that basic mutation data (chromosome number,
	 * start position, reference allele, variant allele) is available
	 * for the provided mutation. If not, returns undefined.
	 *
	 * Example keys: 10:g.152595854G>A
	 *               17:g.36002278_36002277insA
	 *               1:g.206811015_206811016delAC
	 *
	 * @param mutation mutation attributes or a MutationModel instance
	 * @returns {string|undefined} variant key (to be used for annotation query)
	 */
	function generateVariantKey(mutation)
	{
		var key = undefined;

		var chr = mutation.chr;
		var startPos = mutation.startPos;
		var endPos = mutation.endPos;
		var referenceAllele = mutation.referenceAllele;
		var variantAllele = mutation.variantAllele;

		// if mutation has a get function, assume that it is a MutationModel instance
		if (_.isFunction(mutation.get))
		{
			chr = mutation.get("chr");
			startPos = mutation.get("startPos");
			endPos = mutation.get("endPos");
			referenceAllele = mutation.get("referenceAllele");
			variantAllele = mutation.get("variantAllele");
		}

		if (referenceAllele != null &&
		    referenceAllele === variantAllele)
		{
			console.log("[VariantAnnotationUtil.generateVariantKey] " +
			            "Warning: Reference allele (" + referenceAllele + ") for " +
			            chr + ":" + startPos + "-" + endPos + " is the same as variant allele");
		}

		function adjustPosition()
		{
			var start = parseInt(startPos);
			var end = parseInt(endPos);

			if (_.isNaN(start) && _.isNaN(end))
			{
				// start or end position is not a number,
				// cannot process further
				return;
			}

			// remove common prefix and adjust variant position accordingly

			var prefix = cbio.util.lcss(referenceAllele, variantAllele);

			if (prefix.length > 0)
			{
				referenceAllele = referenceAllele.substring(prefix.length);
				variantAllele = variantAllele.substring(prefix.length);

				start += prefix.length;
				// TODO end position may already be correct
				// (no need to update in that case)
				end += prefix.length;

				startPos = start.toString();
				endPos = end.toString();
			}
		}

		if (chr && startPos && referenceAllele && variantAllele)
		{
			adjustPosition();

			// this is what we will end up with if there is no endPos is provided
			// example SNP: 2 216809708 216809708 C T
			// example key: 2:g.216809708C>T
			key = chr + ":g." + startPos + referenceAllele + ">" + variantAllele;

			if (endPos)
			{
				// example insertion: 17 36002277 36002278 - A
				// example key:       17:g.36002278_36002277insA
				if (referenceAllele === "-" ||
				    referenceAllele.length === 0)
				{
					key = chr+ ":g." + endPos + "_" + startPos + "ins" + variantAllele;
				}
				// Example deletion: 1 206811015 206811016  AC -
				// Example key:      1:g.206811015_206811016delAC
				else if(variantAllele === "-" ||
				        variantAllele.length === 0)
				{
					key = chr + ":g." + startPos + "_" + endPos + "del" + referenceAllele;
				}
			}
		}

		return key;
	}

	return {
		generateVariantKey: generateVariantKey,
		addAnnotationData: addAnnotationData
	};
})();

module.exports = VariantAnnotationUtil;