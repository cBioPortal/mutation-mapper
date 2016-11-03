var Backbone = require("backbone");
var MutationModel = require("../model/MutationModel");

/**
 * Collection of mutations (MutationModel instances).
 */
var MutationCollection = Backbone.Collection.extend({
	model: MutationModel,
	initialize: function(options) {
		// TODO add & set attributes if required
	},
	parse: function(response) {
		// TODO parse response (returned from web service)
		// this.attributes = function() { return response.attributes; };   // save the attributes
		// return response.data;    // but the data is what is to be model-ed
	},
	url: function() {
		// TODO implement this to get the data from a web service
		var urlStr = "webservice.do?cmd=...";
	}
});

module.exports = MutationCollection;
