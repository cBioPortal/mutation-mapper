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
 *           diagram: reference to the MutationDiagram instance
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var MutationInfoPanelView = Backbone.View.extend({
	initialize : function (options) {
		this.options = options || {};

		// custom event dispatcher
		this.dispatcher = {};
		_.extend(this.dispatcher, Backbone.Events);
	},
	render: function()
	{
		var self = this;

		var pileups = PileupUtil.convertToPileups(new MutationCollection(self.model.mutations));
		var countByType = PileupUtil.countMutationsByMutationType(pileups);
		self.updateView(countByType);
	},
	format: function()
	{
		var self = this;

		self.$el.find(".mutation-type-info-link").on('click', function(evt) {
			evt.preventDefault();
			var mutationType = $(this).attr("alt");

			self.dispatcher.trigger(
				MutationDetailsEvents.INFO_PANEL_MUTATION_TYPE_SELECTED,
				mutationType);
		})
	},
	updateView: function(countByType) {
		var self = this;

		var mutationTypeStyle = MutationViewsUtil.getVisualStyleMaps().mutationType;

		var content = [];

		_.each(_.keys(countByType).sort(), function(mutationType) {
			var templateFn = BackboneTemplateCache.getTemplateFn("mutation_info_panel_type_template");

			var text = mutationType;
			var textStyle = mutationTypeStyle["other"].style;

			if (mutationTypeStyle[mutationType])
			{
				text = mutationTypeStyle[mutationType].longName;
				textStyle = mutationTypeStyle[mutationType].style;
			}

			var count = countByType[mutationType];

			var variables = {
				mutationType: mutationType,
				type: text,
				textStyle: textStyle,
				count: count,
				countStyle: textStyle + "_count"
			};

			var template = templateFn(variables);
			content.push(template);
		});

		// template vars
		var variables = {
			mutationTypeContent: content.join("\n")
		};

		// compile the template using underscore
		var templateFn = BackboneTemplateCache.getTemplateFn("mutation_info_panel_template");
		var template = templateFn(variables);

		// load the compiled HTML into the Backbone "el"
		self.$el.html(template);

		// format after rendering
		self.format();
	}
});

