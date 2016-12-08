/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
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

var BackboneTemplateCache = require("../util/BackboneTemplateCache");

var Backbone = require("backbone");

/**
 * Tooltip view for the mutation table's FIS column.
 *
 * options: {el: [target container],
 *           model: {xvia: [link to Mutation Assessor],
 *                   impact: [impact text or value]}
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var PredictedImpactTipView = Backbone.View.extend({
	render: function()
	{
		// compile the template
		var template = this.compileTemplate();

		// load the compiled HTML into the Backbone "el"
		this.$el.html(template);
		this.format();
	},
	format: function()
	{
		var isValidLink = function(url)
		{
			var valid = true;

			if (url == null || url == "NA" || url.length == 0)
			{
				valid = false;
			}

			return valid;
		};

		var xvia = this.model.xvia;

		if (!isValidLink(xvia))
		{
			this.$el.find(".mutation-assessor-main-link").hide();
		}

		var pdbLink = this.model.pdbLink;

		if (!isValidLink(pdbLink))
		{
			this.$el.find(".mutation-assessor-3d-link").hide();
		}

		var msaLink = this.model.msaLink;

		if (!isValidLink(msaLink))
		{
			this.$el.find(".mutation-assessor-msa-link").hide();
		}
	},
	compileTemplate: function()
	{
		// pass variables in using Underscore.js template
		var variables = {linkOut: this.model.xvia,
			msaLink: this.model.msaLink,
			pdbLink: this.model.pdbLink,
			impact: this.model.impact};

		// compile the template using underscore
		var templateFn = BackboneTemplateCache.getTemplateFn("mutation_details_fis_tip_template");
		return templateFn(variables);
	}
});

module.exports = PredictedImpactTipView;