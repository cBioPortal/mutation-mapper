// TODO this is manual: not a desired way to expose sub-modules
module.exports = {
	MutationMapper: require("./MutationMapper"),
	model: {
		MutationCollection: require("./model/MutationCollection")
	},
	data: {
		MutationDataProxy: require("./data/MutationDataProxy")
	},
	util: {
		MutationInputParser: require("./util/MutationInputParser"),
		MutationDetailsTableFormatter: require("./util/MutationDetailsTableFormatter"),
		MutationDetailsUtil: require("./util/MutationDetailsUtil"),
		MutationViewsUtil: require("./util/MutationViewsUtil"),
		BackboneTemplateCache: require("./util/BackboneTemplateCache"),
		VepParser: require("./util/VepParser")
	}
};