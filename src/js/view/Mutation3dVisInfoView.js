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
var $ = require("jquery");
require("jquery-expander");

/**
 * Information view for the 3D Visualization panel.
 *
 * options: {el: [target container],
 *           model: {pdbId: String,
 *                   chainId: String,
 *                   pdbInfo: String,
 *                   molInfo: String}
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var Mutation3dVisInfoView = Backbone.View.extend({
	render: function()
	{
		var self = this;

		// compile the template using underscore
		var templateFn = BackboneTemplateCache.getTemplateFn("mutation_3d_vis_info_template");
		var template = templateFn(self.model);

		// load the compiled HTML into the Backbone "el"
		self.$el.html(template);

		// format after rendering
		self.format();
	},
	format: function()
	{
		var self = this;
		var pdbInfo = self.model.pdbInfo;
		var molInfo = self.model.molInfo;

		// if no info provided, then hide the corresponding span
		if (pdbInfo == null ||
		    pdbInfo.length == 0)
		{
			self.$el.find(".mutation-3d-pdb-info").hide();
		}
		else
		{
			// make information text expandable/collapsible
			self._addExpander(".mutation-3d-pdb-info");
		}

		if (molInfo == null ||
		    molInfo.length == 0)
		{
			self.$el.find(".mutation-3d-mol-info").hide();
		}
		else
		{
			// make information text expandable/collapsible
			self._addExpander(".mutation-3d-mol-info");
		}
	},
	/**
	 * Applies expander plugin to the PDB info area. The options are
	 * optimized to have 1 line of description at init.
	 */
	_addExpander: function(selector)
	{
		var self = this;

		var expanderOpts = {slicePoint: 40, // default is 100
			widow: 2,
			expandPrefix: ' ',
			expandText: '[...]',
			//collapseTimer: 5000, // default is 0, so no re-collapsing
			userCollapseText: '[^]',
			moreClass: 'expander-read-more',
			lessClass: 'expander-read-less',
			detailClass: 'expander-details',
			// do not use default effects
			// (see https://github.com/kswedberg/jquery-expander/issues/46)
			expandEffect: 'fadeIn',
			collapseEffect: 'fadeOut'};

		//self.$el.find(".mutation-3d-info-main").expander(expanderOpts);
		self.$el.find(selector).expander(expanderOpts);
	}
});

module.exports = Mutation3dVisInfoView;