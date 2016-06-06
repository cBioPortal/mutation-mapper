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
 * Singleton utility class to format Mutation Details Table View content.
 *
 * @author Selcuk Onur Sumer
 */
var MutationDetailsTableFormatter = (function()
{
	var _visualStyleMaps = MutationViewsUtil.getVisualStyleMaps();

	var _mutationTypeMap = _visualStyleMaps.mutationType;
	var _validationStatusMap = _visualStyleMaps.validationStatus;
	var _mutationStatusMap = _visualStyleMaps.mutationStatus;
	var _omaScoreMap = _visualStyleMaps.omaScore;
	var _cnaMap = _visualStyleMaps.cna;

	// TODO identify similar get functions to avoid code duplication

	function getCNA(value)
	{
		return _getCNA(_cnaMap, value);
	}

	function _getCNA(map, value)
	{
		var style, label, tip;

		if (map[value] != null)
		{
			style = map[value].style;
			label = map[value].label;
			tip = map[value].tooltip;
		}
		else
		{
			style = map.unknown.style;
			label = map.unknown.label;
			tip = map.unknown.tooltip;
		}

		return {style: style, tip: tip, text: label};
	}

    /**
     * Returns the text content, the css class, and the tooltip
     * for the given case id value. If the length of the actual
     * case id string is too long, then creates a short form of
     * the case id ending with an ellipsis.
     *
     * @param caseId    actual case id string
     * @return {{style: string, text: string, tip: string}}
     * @private
     */
	function getCaseId(caseId)
	{
		// TODO customize this length?
		var maxLength = 16;

		var text = caseId;
		var style = ""; // no style for short case id strings
		var tip = caseId; // display full case id as a tip

		// no need to bother with clipping the text for 1 or 2 chars.
		if (caseId != null &&
		    caseId.length > maxLength + 2)
		{
			text = caseId.substring(0, maxLength) + "...";
			style = "simple-tip"; // enable tooltip for long strings
		}

		return {style: style, tip: tip, text: text};
	}

	function getMutationType(value)
	{
		return _getMutationType(_mutationTypeMap, value);
	}

    /**
     * Returns the text content and the css class for the given
     * mutation type value.
     *
     * @param map   map of <mutationType, {label, style}>
     * @param value actual string value of the mutation type
     * @return {{style: string, text: string}}
     * @private
     */
	function _getMutationType(map, value)
	{
		var style, text;

		if (value != null)
		{
			value = value.toLowerCase();
		}

		if (map[value] != null)
		{
			style = map[value].style;
			text = map[value].label;
		}
		else
		{
			style = map.other.style;
			text = value;
		}

		return {style: style, text: text};
	}

	function getMutationStatus(value)
	{
		return _getMutationStatus(_mutationStatusMap, value);
	}

	/**
     * Returns the text content, the css class, and the tooltip
	 * for the given mutation type value.
     *
     * @param map   map of <mutationStatus, {label, style, tooltip}>
     * @param value actual string value of the mutation status
     * @return {{style: string, text: string, tip: string}}
     * @private
     */
	function _getMutationStatus(map, value)
	{
		var style = "simple-tip";
		var text = value;
		var tip = "";

		if (value != null)
		{
			value = value.toLowerCase();
		}

		if (map[value] != null)
		{
			style = map[value].style;
			text = map[value].label;
			tip = map[value].tooltip;
		}

		return {style: style, tip: tip, text: text};
	}

	function getValidationStatus(value)
	{
		return _getValidationStatus(_validationStatusMap, value);
	}

	/**
	 * Returns the text content, the css class, and the tooltip
	 * for the given validation status value.
	 *
	 * @param map   map of <validationStatus, {label, style, tooltip}>
	 * @param value actual string value of the validation status
	 * @return {{style: string, text: string, tip: string}}
	 * @private
	 */
	function _getValidationStatus(map, value)
	{
		var style, label, tip;

		if (value != null)
		{
			value = value.toLowerCase();
		}

		if (map[value] != null)
		{
			style = map[value].style;
			label = map[value].label;
			tip = map[value].tooltip;
		}
		else
		{
			style = map.unknown.style;
			label = map.unknown.label;
			tip = map.unknown.tooltip;
		}

		return {style: style, tip: tip, text: label};
	}

	function getFis(fis, fisValue)
	{
		return _getFis(_omaScoreMap, fis, fisValue);
	}

	/**
	 * Returns the text content, the css classes, and the tooltip
	 * for the given string and numerical values of a
	 * functional impact score.
	 *
	 * @param map       map of <FIS, {label, style, tooltip}>
	 * @param fis       string value of the functional impact (h, l, m or n)
	 * @param fisValue  numerical value of the functional impact score
	 * @return {{fisClass: string, omaClass: string, value: string, text: string}}
	 * @private
	 */
	function _getFis(map, fis, fisValue)
	{
		var text = "";
		var fisClass = "";
		var omaClass = "";
		var value = "";

		if (fis != null)
		{
			fis = fis.toLowerCase();
		}

		if (map[fis] != null)
		{
			value = map[fis].tooltip;

			if (fisValue != null)
			{
				value = fisValue.toFixed(2);
			}

			text = map[fis].label;
			fisClass = map[fis].style;
			omaClass = "oma_link";
		}

		return {fisClass: fisClass, omaClass: omaClass, value: value, text: text};
	}

	/**
	 * Returns the text content, the css classes, and the total
	 * allele count for the given allele frequency.
	 *
	 * @param frequency allele frequency
	 * @param alt       alt allele count
	 * @param ref       ref allele count
	 * @param tipClass  css class for the tooltip
	 * @return {{text: string, total: number, style: string, tipClass: string}}
	 * @private
	 */
	function getAlleleFreq(frequency, alt, ref, tipClass)
	{
		var text = "NA";
		var total = alt + ref;
		var style = "";
		var tipStyle = "";

		if (frequency)
		{
			style = "mutation_table_allele_freq";
			text = frequency.toFixed(2);
			tipStyle = tipClass;
		}

		return {text: text, total: total, style: style, tipClass: tipStyle};
	}

	function getPdbMatchLink(mutation)
	{
		return getLink(mutation.get("pdbMatch"));
	}

	function getIgvLink(mutation)
	{
		return getLink(mutation.get("igvLink"));
	}

	function getLink(value)
	{
		if (value)
		{
			// this is not a real link,
			// actual action is performed by an event listener
			// "#" indicates that this is a valid link
			return "#";
		}
		else
		{
			// an empty string indicates that this is not a valid link
			// invalid links are removed by the view itself after rendering
			return "";
		}
	}

	function getProteinChange(mutation)
	{
		var style = "mutation-table-protein-change";
		var tip = "click to highlight the position on the diagram";
		var additionalTip = "";

		// TODO additional tooltips are enabled (hardcoded) only for msk-impact study for now
		// this is cBioPortal specific implementation, we may want to make it generic in the future
		if (mutation.get("aminoAcidChange") != null &&
		    mutation.get("aminoAcidChange").length > 0 &&
			mutation.get("aminoAcidChange") !== "NA" &&
			mutation.get("cancerStudyShort") != null &&
			mutation.get("cancerStudyShort").toLowerCase().indexOf("msk-impact") != -1 &&
		    isDifferentProteinChange(mutation.get("proteinChange"), mutation.get("aminoAcidChange")))
		{
			additionalTip = "The original annotation file indicates a different value: <b>" +
			                normalizeProteinChange(mutation.get("aminoAcidChange")) + "</b>";
		}

		// TODO disabled temporarily, enable when isoform support completely ready
//        if (!mutation.canonicalTranscript)
//        {
//            style = "best_effect_transcript " + style;
//            // TODO find a better way to display isoform information
//            tip = "Specified protein change is for the best effect transcript " +
//                "instead of the canonical transcript.<br>" +
//                "<br>RefSeq mRNA id: " + "<b>" + mutation.refseqMrnaId + "</b>" +
//                "<br>Codon change: " + "<b>" + mutation.codonChange + "</b>" +
//                "<br>Uniprot id: " + "<b>" + mutation.uniprotId + "</b>";
//        }

		return {text: normalizeProteinChange(mutation.get("proteinChange")),
			style : style,
			tip: tip,
			additionalTip: additionalTip};
	}

	/**
	 * Checks if given 2 protein changes are completely different from each other.
	 *
	 * @param proteinChange
	 * @param aminoAcidChange
	 * @returns {boolean}
	 */
	function isDifferentProteinChange(proteinChange, aminoAcidChange)
	{
		var different = false;

		proteinChange = normalizeProteinChange(proteinChange);
		aminoAcidChange = normalizeProteinChange(aminoAcidChange);

		// if the normalized strings are exact, no need to do anything further
		if (aminoAcidChange !== proteinChange)
		{
			// assuming each uppercase letter represents a single protein
			var proteinMatch1 = proteinChange.match(/[A-Z]/g);
			var proteinMatch2 = aminoAcidChange.match(/[A-Z]/g);

			// assuming the first numeric value is the location
			var locationMatch1 = proteinChange.match(/[0-9]+/);
			var locationMatch2 = aminoAcidChange.match(/[0-9]+/);

			// assuming first lowercase value is somehow related to
			var typeMatch1 = proteinChange.match(/([a-z]+)/);
			var typeMatch2 = aminoAcidChange.match(/([a-z]+)/);

			if (locationMatch1 && locationMatch2 &&
			    locationMatch1.length > 0 && locationMatch2.length > 0 &&
			    locationMatch1[0] != locationMatch2[0])
			{
				different = true;
			}
			else if (proteinMatch1 && proteinMatch2 &&
			         proteinMatch1.length > 0 && proteinMatch2.length > 0 &&
			         proteinMatch1[0] !== "X" && proteinMatch2[0] !== "X" &&
			         proteinMatch1[0] !== proteinMatch2[0])
			{
				different = true;
			}
			else if (proteinMatch1 && proteinMatch2 &&
			         proteinMatch1.length > 1 && proteinMatch2.length > 1 &&
			         proteinMatch1[1] !== proteinMatch2[1])
			{
				different = true;
			}
			else if (typeMatch1 && typeMatch2 &&
			         typeMatch1.length > 0 && typeMatch2.length > 0 &&
			         typeMatch1[0] !== typeMatch2[0])
			{
				different = true;
			}
		}

		return different;
	}

	function normalizeProteinChange(proteinChange)
	{
		var prefix = "p.";

		if (proteinChange.indexOf(prefix) != -1)
		{
			proteinChange = proteinChange.substr(proteinChange.indexOf(prefix) + prefix.length);
		}

		return proteinChange;
	}

	function getTumorType(mutation)
	{
		var style = "tumor_type";
		var tip = "";

		return {text: mutation.get("tumorType"),
			style : style,
			tip: tip};
	}

	/**
	 * Returns the css class and text for the given cosmic count.
	 *
	 * @param count number of occurrences
	 * @return {{style: string, count: string}}
	 * @private
	 */
	function getCosmic(count)
	{
		var style = "";
		var text = "";

		if (count > 0)
		{
			style = "mutation_table_cosmic";
			text = count;
		}

		return {style: style,
			count: text};
    }

	/**
	 * Returns the css class and text for the given cosmic count.
	 *
	 * @param frequency frequency value in cbio portal
	 * @return {{style: string, frequency: string}}
	 * @private
	 */
	function getCbioPortal(frequency)
	{
		var style = "";
		var text = "";

		if (frequency > 0)
		{
			style = "mutation_table_cbio_portal";
			text = frequency;
		}

		return {style: style,
			frequency: text};
	}

	/**
	 * Returns the text and css class values for the given integer value.
	 *
	 * @param value an integer value
	 * @return {{text: *, style: string}}
	 * @private
	 */
	function getIntValue(value)
	{
		var text = value;
		var style = "mutation_table_int_value";

		if (value == null)
		{
			text = "NA";
			style = "";
		}

		return {text: text, style: style};
	}

	/**
	 * Returns the text and css class values for the given allele count value.
	 *
	 * @param count an integer value
	 * @return {{text: *, style: string}}
	 * @private
	 */
	function getAlleleCount(count)
	{
		var text = count;
		var style = "mutation_table_allele_count";

		if (count == null)
		{
			text = "NA";
			style = "";
		}

		return {text: text, style: style};
    }


	/**
	 * Helper function for predicted impact score sorting.
	 */
	function assignValueToPredictedImpact(text, score)
	{
		// using score by itself may be sufficient,
		// but sometimes we have no numerical score value

		var value;

		if (text != null)
		{
			text = text.toLowerCase();
		}

		if (text == "low" || text == "l") {
			value = 2;
		} else if (text == "medium" || text == "m") {
			value = 3;
		} else if (text == "high" || text == "h") {
			value = 4;
		} else if (text == "neutral" || text == "n") {
			value = 1;
		} else {
			value = -1;
		}

		if (value > 0 && !isNaN(score))
		{
			//assuming FIS values cannot exceed 1000
			value += score / 1000;
		}

		return value;
	}

	function assignIntValue(value)
	{
		var val = parseInt(value);

		if (isNaN(val))
		{
			val = -Infinity;
		}

		return val;
	}

	function assignFloatValue(value)
	{
		var val = parseFloat(value);

		if (isNaN(val))
		{
			val = -Infinity;
		}

		return val;
	}

	return {
		getCaseId: getCaseId,
		getProteinChange: getProteinChange,
		getPdbMatchLink: getPdbMatchLink,
		getIgvLink: getIgvLink,
		getAlleleCount: getAlleleCount,
		getAlleleFreq: getAlleleFreq,
		getCNA: getCNA,
		getMutationType: getMutationType,
		getMutationStatus: getMutationStatus,
		getValidationStatus: getValidationStatus,
		getFis: getFis,
		getTumorType: getTumorType,
		getCosmic: getCosmic,
		getCbioPortal: getCbioPortal,
		getIntValue: getIntValue,
		assignValueToPredictedImpact: assignValueToPredictedImpact,
		assignIntValue: assignIntValue,
		assignFloatValue: assignFloatValue
	}
})();

