var Backbone = require("backbone");
var PdbChainModel = require("../model/PdbChainModel");

/**
 * Collection of pdb data (PdbModel instances).
 */
var PdbChainCollection = Backbone.Collection.extend({
	model: PdbChainModel,
	initialize: function(options) {
		// TODO add & set attributes if required
	}
});

module.exports = PdbChainCollection;