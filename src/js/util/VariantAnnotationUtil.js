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

/**
 * Singleton utility class for variant annotation related tasks.
 *
 * @author Selcuk Onur Sumer
 */
var VariantAnnotationUtil = (function()
{
	function addAnnotationData(mutations, annotationData)
	{
		var indexedData = _.indexBy(annotationData, "variant");

		_.each(mutations, function(mutation, idx) {
			var annotation = indexedData[mutation.get("variantKey")];
			annotation = parseAnnotationData(annotation);
			// only update undefined fields!
			setUndefinedFields(mutation, annotation);
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

	// TODO properly parse annotation json! field names do not match!
	function parseAnnotationData(annotation)
	{
		var parsedData = {};

		// in case of empty annotation data (possible error),
		// all fields will be empty string
		annotation = annotation || {};

		parsedData.startPos = annotation.startPos || "";
		parsedData.endPos = annotation.endPos || "";
		parsedData.chr = annotation.chr || "";
		parsedData.referenceAllele = annotation.referenceAllele || "";
		parsedData.variantAllele = annotation.variantAllele || "";
		parsedData.proteinChange = annotation.proteinChange || "";

		return parsedData;
	}

	/**
	 * Generates variant key for annotation queries.
	 * This function assumes that basic mutation data (chromosome number,
	 * start position, reference allele, variant allele) is available
	 * for the provided mutation. If not, returns undefined.
	 *
	 * Example key: 10:g.152595854G>A
	 *
	 * @param mutation mutation attributes or a MutationModel instance
	 * @returns {string|undefined} variant key (to be used for annotation query)
	 */
	function generateVariantKey(mutation)
	{
		var key = undefined;

		var chr = mutation.chr;
		var startPos = mutation.startPos;
		var referenceAllele = mutation.referenceAllele;
		var variantAllele = mutation.variantAllele;

		// if mutation has a get function, assume that it is a MutationModel instance
		if (_.isFunction(mutation.get))
		{
			chr = mutation.get("chr");
			startPos = mutation.get("startPos");
			referenceAllele = mutation.get("referenceAllele");
			variantAllele = mutation.get("variantAllele");
		}

		if (chr &&
		    startPos &&
		    referenceAllele &&
		    variantAllele)
		{
			key = chr + ":g." +
			      startPos +
			      referenceAllele + ">" +
			      variantAllele
		}

		return key;
	}

	return {
		generateVariantKey: generateVariantKey,
		addAnnotationData: addAnnotationData,
		parseAnnotationData: parseAnnotationData
	};
})();
