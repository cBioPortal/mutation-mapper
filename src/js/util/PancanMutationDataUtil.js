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

	return {
		getMutationFrequencies: getMutationFrequencies
	};
})();
