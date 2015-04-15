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
 * Utility class to create segments from a merged alignment.
 * (See PdbChainModel.mergeAlignments function for details of merged alignments)
 *
 * @param mergedAlignment   merged alignment object (see PdbChainModel.mergedAlignment field)
 * @constructor
 *
 * @author Selcuk Onur Sumer
 */
function MergedAlignmentSegmentor(mergedAlignment)
{
	var _mergedAlignment = mergedAlignment;

	// start position (initially zero)
	var _start = 0;

	/**
	 * Checks if there are more segments in this merged alignment.
	 *
	 * @return {boolean}
	 */
	function hasNextSegment()
	{
		return (_start < _mergedAlignment.mergedString.length);
	}

	/**
	 * Extracts the next segment from the merged alignment string. Returns
	 * the segment as an object with the actual segment string,
	 * start (uniprot) position, and end (uniprot) position.
	 *
	 * @return {object} segment with string, start, and end info
	 */
	function getNextSegment()
	{
		var str = _mergedAlignment.mergedString;

		var segment = {};
		segment.start = _start + _mergedAlignment.uniprotFrom;
		var symbol = str[_start];
		var end = _start;

		// for each special symbol block, a new segment is created
		if (isSpecialSymbol(symbol))
		{
			segment.type = symbol;

			while (str[end] == symbol &&
			       end <= str.length)
			{
				end++;
			}
		}
		else
		{
			segment.type = "regular";

			while (!isSpecialSymbol(str[end]) &&
			       end <= str.length)
			{
				end++;
			}
		}

		segment.end = end + _mergedAlignment.uniprotFrom;
		segment.str = str.substring(_start, end);

		// update start for the next segment
		_start = end;

		return segment;
	}

	function isSpecialSymbol(symbol)
	{
		// considering symbols other than GAP as special
		// results in too many segments...
//		return (symbol == PdbDataUtil.ALIGNMENT_GAP) ||
//		       (symbol == PdbDataUtil.ALIGNMENT_MINUS) ||
//		       (symbol == PdbDataUtil.ALIGNMENT_PLUS) ||
//		       (symbol == PdbDataUtil.ALIGNMENT_SPACE);

		return (symbol == PdbDataUtil.ALIGNMENT_GAP);
	}

	return {
		hasNextSegment: hasNextSegment,
		getNextSegment: getNextSegment
	};
}
