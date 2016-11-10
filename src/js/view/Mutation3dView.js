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
var _ = require("underscore");
var $ = require("jquery");

require("qtip2");
require("qtip2/dist/jquery.qtip.css");

/**
 * 3D visualizer controls view.
 *
 * This view is designed to provide controls to initialize, show or hide
 * the actual 3D visualizer panel.
 *
 * IMPORTANT NOTE: This view does not initialize the actual 3D visualizer.
 * 3D visualizer is a global instance bound to MutationDetailsView
 * and it is a part of Mutation3dVisView.
 *
 * options: {el: [target container],
 *           model: {geneSymbol: hugo gene symbol,
 *                   uniprotId: uniprot identifier for this gene,
 *                   pdbProxy: pdb data proxy}
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var Mutation3dView = Backbone.View.extend({
	initialize : function (options) {
		this.options = options || {};

		// custom event dispatcher
		this.dispatcher = {};
		_.extend(this.dispatcher, Backbone.Events);
	},
	render: function()
	{
		var self = this;
		var gene = self.model.geneSymbol;

		// compile the template using underscore
		var templateFn = BackboneTemplateCache.getTemplateFn("mutation_3d_view_template");
		var template = templateFn({});

		// load the compiled HTML into the Backbone "el"
		this.$el.html(template);

		// format after rendering
		this.format();
	},
	format: function()
	{
		var self = this;
		var button3d = self.$el.find(".mutation-3d-vis");

		// initially disable the 3D button
		button3d.attr("disabled", "disabled");

		var formatButton = function(hasData) {
			if (hasData)
			{
				// enable button if there is PDB data
				button3d.removeAttr("disabled");
			}
			else
			{
				var gene = self.model.geneSymbol;
				var content = "No structure data for " + gene;

				// set tooltip options
				var qtipOpts = {content: {text: content},
					hide: {fixed: true, delay: 100, event: 'mouseout'},
					show: {event: 'mouseover'},
					style: {classes: 'qtip-light qtip-rounded qtip-shadow cc-ui-tooltip'},
					position: {my:'bottom center', at:'top center', viewport: $(window)}};

				// disabled buttons do not trigger mouse events,
				// so add tooltip to the wrapper div instead
				self.$el.qtip(qtipOpts);
			}
		};

		var pdbProxy = self.model.pdbProxy;
		var uniprotId = self.model.uniprotId;

		pdbProxy.hasPdbData(uniprotId, formatButton);
	},
	/**
	 * Adds a callback function for the 3D visualizer init button.
	 *
	 * @param callback      function to be invoked on click
	 */
	addInitCallback: function(callback) {
		var self = this;
		var button3d = self.$el.find(".mutation-3d-vis");

		// add listener to 3D init button
		button3d.click(callback);
	},
	/**
	 * Resets the 3D view to its initial state.
	 */
	resetView: function()
	{
		var self = this;
		var button3d = self.$el.find(".mutation-3d-vis");

		// TODO this might not be safe, since we are relying on the callback function

		// just simulate click function on the 3d button to reset the view
		button3d.click();
	},
	isVisible: function()
	{
		var self = this;
		return self.$el.is(":visible");
	}
});

module.exports = Mutation3dView;