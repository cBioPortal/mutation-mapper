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

	function getMutationFrequencies(byKeywordResponse, byHugoResponse)
	{
		return _.extend(munge(byKeywordResponse, "keyword"), munge(byHugoResponse, "hugo"));
	}

	/**
	 * Counts number of total mutations for the given frequencies and key.
	 *
	 * @param frequencies   pancan mutation frequencies
	 * @param key           key (keyword or gene symbol)
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
