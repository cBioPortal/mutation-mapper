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
var MutationCustomizePanelView = Backbone.View.extend({
	initialize : function (options) {
		this.options = options || {};
	},
	render: function()
	{
		var self = this;
		var diagram = self.options.diagram;

		// template vars
		var variables = {minY: 2,
			maxY: diagram.getInitialMaxY()};

		// compile the template using underscore
		var templateFn = BackboneTemplateCache.getTemplateFn("mutation_customize_panel_template");
		var template = templateFn(variables);

		// load the compiled HTML into the Backbone "el"
		self.$el.html(template);

		// format after rendering
		self.format();
	},
	format: function()
	{
		var self = this;
		var diagram = self.options.diagram;

		// hide the view initially
		self.$el.hide();

		// format panel controls

		var customizeClose = self.$el.find(".diagram-customize-close");
		var yAxisSlider = self.$el.find(".diagram-y-axis-slider");
		var yAxisInput = self.$el.find(".diagram-y-axis-limit-input");

		// add listener to close button
		customizeClose.click(function(event) {
			event.preventDefault();
			self.toggleView();
		});

		// set initial value of the input field
		yAxisInput.val(diagram.getMaxY());

		// init y-axis slider controls
		yAxisSlider.slider({
			value: diagram.getMaxY(), // set value to current max
			min: 2, // anything below 2 doesn't make much sense
			max: diagram.getInitialMaxY(), // set max value to initial max
			change: function(event, ui) {
				var value = ui.value;

				// adjust the slider value to the threshold
				// and stop execution, because this will trigger
				// this event (change event) again...
				if (value > diagram.getThreshold()) {
					value = diagram.getThreshold();
					$(this).slider('value', value);
					return;
				}

				// update input field
				yAxisInput.val(value);

				// update diagram
				diagram.updateOptions({maxLengthY: value});
				diagram.rescaleYAxis();
			},
			slide: function(event, ui) {
				// update input field only
				yAxisInput.val(ui.value);
			}
		});

		yAxisInput.keypress(function(event) {
			var enterCode = 13;

			if (event.keyCode == enterCode)
			{
				var input = yAxisInput.val();
				var value = input;

				// not a valid value, update with defaults
				if (isNaN(value) ||
				    value > diagram.getThreshold())
				{
					value = diagram.getThreshold();
				}
				else if (input < 2)
				{
					value = 2;
				}

				// update weight slider and input value
				yAxisInput.val(value);
				yAxisSlider.slider("option", "value", Math.floor(value));
			}
		});
	},
	toggleView: function() {
		var self = this;
		self.$el.slideToggle();
	}
});
