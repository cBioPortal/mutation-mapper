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
 * Tooltip view for the mutation table's cosmic column.
 *
 * options: {el: [target container],
 *           model: {cosmic: [raw cosmic text],
 *                   geneSymbol: [hugo gene symbol],
 *                   keyword: [mutation keyword],
 *                   total: [number of total cosmic occurrences]}
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var CosmicTipView = Backbone.View.extend({
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
		// initialize cosmic details table
		this.$el.find(".cosmic-details-table").dataTable({
			"aaSorting" : [[2, "desc"]], // sort by count at init
			"sDom": 'pt', // show the table and the pagination buttons
			"aoColumnDefs": [
				{"mRender": function ( data, type, full ) {
						// TODO move this link into the template
                        return '<a href="http://cancer.sanger.ac.uk/cosmic/mutation/overview?id='+data+'">'+data+'</a>';
                    }, "aTargets": [0]},
				{"sType": "aa-change-col", "sClass": "left-align-td", "aTargets": [1]},
				{"sType": "numeric", "sClass": "left-align-td", "aTargets": [2]}],
			"bDestroy": false,
			"bPaginate": true,
			"bJQueryUI": true,
			"bFilter": false});
	},
	_parseCosmic: function(cosmic)
	{
		var dataRows = [];
		// TODO create a backbone template for the cosmic table row
		// COSMIC data (as AA change & frequency pairs)
		cosmic.forEach(function(c) {
                        dataRows.push(c[0]+"</td><td>"+c[1]+"</td><td>"+c[2]);
                    });

		return "<tr><td>" + dataRows.join("</td></tr><tr><td>") + "</td></tr>";
	},
	compileTemplate: function()
	{
		var dataRows = this._parseCosmic(this.model.cosmic);

		// pass variables in using Underscore.js template
		var variables = {cosmicDataRows: dataRows,
			cosmicTotal: this.model.total,
			mutationKeyword: this.model.keyword};

		// compile the template using underscore
		var templateFn = BackboneTemplateCache.getTemplateFn("mutation_details_cosmic_tip_template");
		return templateFn(variables);
	}
});