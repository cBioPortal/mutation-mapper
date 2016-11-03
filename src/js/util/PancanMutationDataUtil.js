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

var d3 = require("d3");
var _ = require("underscore");

/**
 * Singleton utility function for Pancancer Mutation Data.
 *
 * @author Selcuk Onur Sumer
 */
var PancanMutationDataUtil = (function()
{
	function munge(response, key)
	{
		// munge data to get it into the format: keyword -> corresponding datum
		return d3.nest()
			.key(function(d) {
				return d[key];
			})
			.entries(response)
			.reduce(function(acc, next) {
				acc[next.key] = next.values;
				return acc;
			},
			{});
	}

	function getMutationFrequencies(data)
	{
		var frequencies = {};

		_.each(_.keys(data), function(key, i) {
			frequencies = _.extend(frequencies, munge(data[key], key));
		});

		return frequencies;
	}

	/**
	 * Counts number of total mutations for the given frequencies and key.
	 *
	 * @param frequencies   pancan mutation frequencies
	 * @param key           key (keyword, gene symbol or protein change)
	 * @returns {Object}    mutation count
	 */
	function countByKey(frequencies, key)
	{
		var data = frequencies[key];

		return _.reduce(data, function(acc, next) {
			return acc + next.count;
		}, 0);
	}

	return {
		getMutationFrequencies: getMutationFrequencies,
		countByKey: countByKey
	};
})();

module.exports = PancanMutationDataUtil;