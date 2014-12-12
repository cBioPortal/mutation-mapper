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
		for (var i=0; i < mutations.length; i++)
		{
			var type = mutations[i].mutationType.toLowerCase();

			if (mutationMap[type] == undefined)
			{
				mutationMap[type] = [];
			}

			mutationMap[type].push(mutations[i]);
		}

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
		for (var key in map)
		{
			typeArray.push({type: key, count: map[key].length});
		}

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

		for (var type in typeMap)
		{
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
		}

		// convert to array and sort by length (count)

		for (var group in groupCountMap)
		{
			groupArray.push({group: group, count: groupCountMap[group]});
		}

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
				map[mutation.mutationSid] = pileup.pileupId;
			})
		});

		return map;
	}

	/**
	 * Converts the provided mutation data into a list of Pileup instances.
	 *
	 * @param mutationData  list (MutationCollection) of mutations
	 * @return {Array}      a list of pileup mutations
	 */
	function convertToPileups(mutationData)
	{
		// remove redundant mutations by sid
		mutationData = removeRedundantMutations(mutationData);

		// create a map of mutations (key is the mutation location)
		var mutations = {};

		for (var i=0; i < mutationData.length; i++)
		{
			var mutation = mutationData.at(i);

			var location = mutation.getProteinStartPos();
			var type = mutation.mutationType.trim().toLowerCase();

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

		for (var key in mutations)
		{
			var pileup = {};

			pileup.pileupId = PileupUtil.nextId();
			pileup.mutations = mutations[key];
			pileup.count = mutations[key].length;
			pileup.location = parseInt(key);
			pileup.label = generateLabel(mutations[key]);
	        // The following calculates dist of mutations by cancer type
	        pileup.stats = _.chain(mutations[key])
	            .groupBy(function(mut) { return mut.cancerType; })
	            .sortBy(function(stat) { return -stat.length; })
	            .reduce(function(seed, o) {
	                seed.push({ cancerType: o[0].cancerType, count: o.length });
	                return seed;
	            }, []).value();

			pileupList.push(new Pileup(pileup));
		}

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
			var exists = redMap[aMutation.mutationSid];
			if(exists == null) {
				redMap[aMutation.mutationSid] = true;
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
		for (var i = 0; i < mutations.length; i++)
		{
			if (mutations[i].proteinChange != null &&
			    mutations[i].proteinChange.length > 0)
			{
				mutationSet[mutations[i].proteinChange] = mutations[i].proteinChange;
			}
		}

		// convert to array & sort
		var mutationArray = [];

		for (var key in mutationSet)
		{
			mutationArray.push(key);
		}

		mutationArray.sort();

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

		for (var i = 0; i < mutationArray.length; i++)
		{
			label += mutationArray[i].substring(startStr.length) + "/";
		}

		// remove the last slash
		return label.substring(0, label.length - 1);
	}

	return {
		nextId: nextId,
		mapToMutations: mapToMutations,
		convertToPileups: convertToPileups,
		getMutationTypeMap: generateTypeMap,
		getMutationTypeArray: generateTypeArray,
		getMutationTypeGroups: generateTypeGroupArray
	};
})();