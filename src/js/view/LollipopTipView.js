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

var LollipopTipStatsView = require("../view/LollipopTipStatsView");
var BackboneTemplateCache = require("../util/BackboneTemplateCache");

var Backbone = require("backbone");
var $ = require("jquery");

/**
 * Tooltip view for the mutation diagram's lollipop circles.
 *
 * options: {el: [target container],
 *           model: {count: [number of mutations],
 *                   label: [info for that location]}
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var LollipopTipView = Backbone.View.extend({
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
		// implement if necessary...
	},

    showStats: false,
    setShowStats: function(showStats) {
        this.showStats = showStats;
    },
    getShowStats: function(showStats) {
        return this.showStats;
    },

    compileTemplate: function()
	{
        var thatModel = this.model;
        var mutationStr = thatModel.count > 1 ? "mutations" : "mutation";

		// pass variables in using Underscore.js template
		var variables = {count: thatModel.count,
			mutationStr: mutationStr,
			label: thatModel.label
        };

		// compile the template using underscore
		var templateFn = BackboneTemplateCache.getTemplateFn("mutation_details_lollipop_tip_template");
        var compiledEl = $(templateFn(variables));

        var statsEl = compiledEl.find(".lollipop-stats");
        if(this.showStats)
        {
            (new LollipopTipStatsView({ el: statsEl, model: thatModel.stats })).render();
            statsEl.find("table").dataTable({
                "sDom": 't',
                "bJQueryUI": true,
                "bDestroy": true,
                "aaSorting": [[ 1, "desc" ]],
                "aoColumns": [
                    { "bSortable": false },
                    { "bSortable": false }
                ]
            });
        } else {
            statsEl.hide();
        }

        return compiledEl.html();
	}
});

module.exports = LollipopTipView;