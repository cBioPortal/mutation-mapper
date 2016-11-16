// TODO expose more classes?
module.exports = {
	MutationMapper: require("./MutationMapper"),
	data: {
		MutationDataProxy: require("./data/MutationDataProxy")
	},
	util: {
		MutationInputParser: require("./util/MutationInputParser"),
		MutationDetailsTableFormatter: require("./util/MutationDetailsTableFormatter"),
		MutationDetailsUtil: require("./util/MutationDetailsUtil"),
		BackboneTemplateCache: require("./util/BackboneTemplateCache"),
		VepParser: require("./util/VepParser")
	}
};