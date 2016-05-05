/*
 * Copyright (c) 2016 Memorial Sloan-Kettering Cancer Center.
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
 * Mutation Details Customization Panel View.
 *
 * This view is designed to provide a customization panel for Mutation Details page.
 *
 * options: {el: [target container],
 *           model: {},
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var MutationSummaryView = Backbone.View.extend({
	initialize : function (options) {
		this.options = options || {};

		// custom event dispatcher
		//this.dispatcher = {};
		//_.extend(this.dispatcher, Backbone.Events);
	},
	render: function()
	{
		var self = this;

		var mutationSummary = self._mutationSummary();

		var variables = {
			mutationSummary: mutationSummary,
			geneSymbol: self.model.geneSymbol
		};

		// compile the template using underscore
		var templateFn = BackboneTemplateCache.getTemplateFn('mutation_summary_view_template');
		var template = templateFn(variables);

		// load the compiled HTML into the Backbone "el"
		self.$el.html(template);

		self.format()
	},
	format: function()
	{
		var self = this;
	},
	/**
	 * Generates a one-line summary of the mutation data.
	 *
	 * @return {string} summary string
	 */
	_mutationSummary: function()
	{
		var self = this;
		var mutationUtil = self.model.mutationProxy.getMutationUtil();
		var gene = self.model.geneSymbol;
		var cases = self.model.sampleArray;

		var summary = "";

		if (cases.length > 0)
		{
			// calculate somatic & germline mutation rates
			var mutationCount = mutationUtil.countMutations(gene, cases);
			// generate summary string for the calculated mutation count values
			summary = mutationUtil.generateSummary(mutationCount);
		}

		return summary;
	}
});
