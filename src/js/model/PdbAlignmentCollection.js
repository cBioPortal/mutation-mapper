var Backbone = require("backbone");
var PdbAlignmentModel = require("../model/PdbAlignmentModel");

/**
 * Collection of pdb alignment data (PdbAlignmentModel instances).
 */
var PdbAlignmentCollection = Backbone.Collection.extend({
	model: PdbAlignmentModel,
	initialize: function(options) {
		// TODO add & set attributes if required
	}
});

module.exports = PdbAlignmentCollection;