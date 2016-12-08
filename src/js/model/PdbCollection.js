var Backbone = require("backbone");
var PdbModel = require("../model/PdbModel");

/**
 * Collection of pdb data (PdbModel instances).
 */
var PdbCollection = Backbone.Collection.extend({
	model: PdbModel,
	initialize: function(options) {
		// TODO add & set attributes if required
	}
});

module.exports = PdbCollection;