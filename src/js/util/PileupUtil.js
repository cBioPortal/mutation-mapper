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
 * Singleton utility class for pileup related tasks.
 *
 * @author Selcuk Onur Sumer
 */
var PileupUtil = (function()
{
	var _idCounter = 0;

	/**
	 * Processes a Pileup instance, and creates a map of
	 * <mutation type, mutation array> pairs.
	 *
	 * @param pileup    a pileup instance
	 * @return {object} map of mutations (keyed on mutation type)
	 * @private
	 */
	function generateTypeMap(pileup)
	{
		var mutations = pileup.mutations;
		var mutationMap = {};

		// process raw data to group mutations by types
		_.each(mutations, function(mutation) {
			var type = mutation.get("mutationType").toLowerCase();

			if (mutationMap[type] == undefined)
			{
				mutationMap[type] = [];
			}

			mutationMap[type].push(mutation);
		});

		return mutationMap;
	}

	/**
	 * Processes a Pileup instance, and creates an array of
	 * <mutation type, count> pairs. The final array is sorted
	 * by mutation count.
	 *
	 * @param pileup    a pileup instance
	 * @return {Array}  array of mutation type and count pairs
	 */
	function generateTypeArray(pileup)
	{
		var map = generateTypeMap(pileup);
		var typeArray = [];

		// convert to array and sort by length (count)
		_.each(_.keys(map), function(key) {
			typeArray.push({type: key, count: map[key].length});
		});

		typeArray.sort(function(a, b) {
			// descending sort
			return b.count - a.count;
		});

		return typeArray;
	}

	/**
	 * Processes a Pileup instance, and creates an array of
	 * <mutation type group, count> pairs. The final array
	 * is sorted by mutation count.
	 *
	 * @param pileup    a pileup instance
	 * @return {Array}  array of mutation type group and count pairs
	 */
	function generateTypeGroupArray(pileup)
	{
		var mutationTypeMap = MutationViewsUtil.getVisualStyleMaps().mutationType;

		var typeMap = generateTypeMap(pileup);
		var groupArray = [];
		var groupCountMap = {};

		// group mutation types by using the type map
		// and count number of mutations in a group

		_.each(_.keys(typeMap), function(type) {
			// grouping mutations by the style (not by the type)
			var group = undefined;

			if (mutationTypeMap[type] != null)
			{
				group = mutationTypeMap[type].style;
			}

			if (group == undefined)
			{
				group = mutationTypeMap.other.style;
			}

			if (groupCountMap[group] == undefined)
			{
				// init count
				groupCountMap[group] = 0;
			}

			groupCountMap[group]++;
		});

		// convert to array and sort by length (count)

		_.each(_.keys(groupCountMap), function(group) {
			groupArray.push({group: group, count: groupCountMap[group]});
		});

		groupArray.sort(function(a, b) {
			// descending sort
			return b.count - a.count;
		});

		return groupArray;
	}

	function nextId()
	{
		_idCounter++;

		return "pileup_" + _idCounter;
	}

	/**
	 * Creates a map of <mutation sid>, <pileup id> pairs.
	 *
	 * @param pileups   list of pileups
	 * @return {Object} <mutation sid> to <pileup id> map
	 */
	function mapToMutations(pileups)
	{
		var map = {};

		// map each mutation sid to its corresponding pileup
		_.each(pileups, function(pileup) {
			_.each(pileup.mutations, function(mutation) {
				map[mutation.get("mutationSid")] = pileup.pileupId;
			})
		});

		return map;
	}

	/**
	 * Converts the provided mutation data into a list of Pileup instances.
	 *
	 * @param mutationColl  collection of Mutation models (MutationCollection)
	 * @return {Array}      a list of pileup mutations
	 */
	function convertToPileups(mutationColl)
	{
		// remove redundant mutations by sid
		mutationColl = removeRedundantMutations(mutationColl);

		// create a map of mutations (key is the mutation location)
		var mutations = {};

		for (var i=0; i < mutationColl.length; i++)
		{
			var mutation = mutationColl.at(i);

			var location = mutation.getProteinStartPos();
			var type = mutation.get("mutationType").trim().toLowerCase();

			if (location != null && type != "fusion")
			{
				if (mutations[location] == null)
				{
					mutations[location] = [];
				}

				mutations[location].push(mutation);
			}
		}

		// convert map into an array of piled mutation objects
		var pileupList = [];

		_.each(_.keys(mutations), function(key) {
			var pileup = {};

			pileup.pileupId = PileupUtil.nextId();
			pileup.mutations = mutations[key];
			pileup.count = mutations[key].length;
			pileup.location = parseInt(key);
			pileup.label = generateLabel(mutations[key]);
	        // The following calculates dist of mutations by cancer type
	        pileup.stats = _.chain(mutations[key])
	            .groupBy(function(mut) { return mut.get("cancerType"); })
	            .sortBy(function(stat) { return -stat.length; })
	            .reduce(function(seed, o) {
	                seed.push({ cancerType: o[0].get("cancerType"), count: o.length });
	                return seed;
	            }, []).value();

			pileupList.push(new Pileup(pileup));
		});

		// sort (descending) the list wrt mutation count
		pileupList.sort(function(a, b) {
			var diff = b.count - a.count;

			// if equal, then compare wrt position (for consistency)
			if (diff == 0)
			{
				diff = b.location - a.location;
			}

			return diff;
		});

		return pileupList;
	}

	// TODO first remove by mutationSid, and then remove by patientId
	function removeRedundantMutations(mutationData)
	{
		// remove redundant mutations by sid
		var redMap = {};
		var removeItems = [];

		for (var i=0; i < mutationData.length; i++)
		{
			var aMutation = mutationData.at(i);
			var exists = redMap[aMutation.get("mutationSid")];
			if(exists == null) {
				redMap[aMutation.get("mutationSid")] = true;
			} else {
				removeItems.push(aMutation);
			}
		}

		mutationData.remove(removeItems);

		return mutationData;
	}

	/**
	 * Generates a pileup label by joining all unique protein change
	 * information in the given array of mutations.
	 *
 	 * @param mutations     a list of mutations
	 * @returns {string}    pileup label
	 */
	function generateLabel(mutations)
	{
		var mutationSet = {};

		// create a set of protein change labels
		// (this is to eliminate duplicates)
		_.each(mutations, function(mutation) {
			if (mutation.get("proteinChange") != null &&
			    mutation.get("proteinChange").length > 0)
			{
				mutationSet[mutation.get("proteinChange")] = mutation.get("proteinChange");
			}
		});

		// convert to array & sort
		var mutationArray = _.keys(mutationSet).sort();

		// find longest common starting substring
		// (this is to truncate redundant starting substring)

		var startStr = "";

		if (mutationArray.length > 1)
		{
			startStr = cbio.util.lcss(mutationArray[0],
			                          mutationArray[mutationArray.length - 1]);

//			console.log(mutationArray[0] + " n " +
//			            mutationArray[mutationArray.length - 1] + " = " +
//			            startStr);
		}

		// generate the string
		var label = startStr;

		_.each(mutationArray, function(mutation) {
			label += mutation.substring(startStr.length) + "/";
		});

		// remove the last slash
		return label.substring(0, label.length - 1);
	}

	/**
	 * Counts the number of total mutations for the given
	 * Pileup array.
	 *
	 * @param pileups   an array of Pileup instances
	 */
	function countMutations(pileups)
	{
		var total = 0;

		_.each(pileups, function(pileup) {
			total += pileup.count;
		});

		return total;
	}

	return {
		nextId: nextId,
		mapToMutations: mapToMutations,
		convertToPileups: convertToPileups,
		countMutations: countMutations,
		getMutationTypeMap: generateTypeMap,
		getMutationTypeArray: generateTypeArray,
		getMutationTypeGroups: generateTypeGroupArray
	};
})();