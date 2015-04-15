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
 * PDB Table View.
 *
 * This view is designed to function in parallel with the 3D visualizer.
 *
 * options: {el: [target container],
 *           model: {geneSymbol: hugo gene symbol,
 *                   pdbColl: collection of PdbModel instances,
 *                   pdbProxy: pdb data proxy,
 *                   tableOpts: pdb table options (optional)},
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var PdbTableView = Backbone.View.extend({
	initialize : function (options) {
		this.options = options || {};
	},
	render: function(callback)
	{
		var self = this;

		// compile the template using underscore
		var templateFn = BackboneTemplateCache.getTemplateFn("pdb_table_view_template");
		// TODO customize loader image
		var template = templateFn({loaderImage: "images/ajax-loader.gif"});

		// load the compiled HTML into the Backbone "el"
		self.$el.html(template);

		// init pdb table
		self._initPdbTable(callback);

		// format after rendering
		self.format();
	},
	format: function()
	{
		var self = this;

		// hide view initially
		self.$el.hide();
	},
	hideView: function()
	{
		var self = this;
		self.$el.slideUp();
	},
	showView: function()
	{
		var self = this;
		self.$el.slideDown();
	},
	toggleView: function()
	{
		var self = this;
		self.$el.slideToggle();
	},
	refreshView: function()
	{
		var self = this;
		self.pdbTable.getDataTable().fnAdjustColumnSizing();
	},
	/**
	 * Resets all table filters (rolls back to initial state)
	 */
	resetFilters: function()
	{
		var self = this;

		// TODO do not clean filters if not filtered
		self.pdbTable.cleanFilters();
	},
	selectChain: function(pdbId, chainId)
	{
		var self = this;

		if (self.pdbTable != null)
		{
			self.pdbTable.selectRow(pdbId, chainId);
		}
	},
	/**
	 * Moves the scroll bar to the selected chain's position.
	 */
	scrollToSelected: function()
	{
		var self = this;
		var selected = self.pdbTable.getSelectedRow();

		var container = self.$el.find(".dataTables_scrollBody");

		// TODO make scroll parameters customizable?
		container.scrollTo($(selected),
		                   {axis: 'y', duration: 800});
	},
	/**
	 * Initializes the PDB chain table.
	 *
	 * @return {MutationPdbTable}   table instance
	 */
	_initPdbTable: function(callback)
	{
		var self = this;

		var pdbColl = self.model.pdbColl;
		var pdbProxy = self.model.pdbProxy;

		var options = jQuery.extend(true, {}, self.model.tableOpts);
		options.el = options.el || self.$el.find(".pdb-chain-table");

		var table = new MutationPdbTable(options);
		self.pdbTable = table;

		if (_.isFunction(callback))
		{
			callback(self, table);
		}

		self._generateRowData(table.getColumnOptions(), pdbColl, pdbProxy, function(rowData) {
			// init table with the row data
			table.renderTable(rowData);
			// hide loader image
			self.$el.find(".pdb-chain-table-loader").hide();
		});

		return table;
	},
	_generateRowData: function(headers, pdbColl, pdbProxy, callback)
	{
		var rows = [];
		var pdbIds = [];

		pdbColl.each(function(pdb) {
			pdbIds.push(pdb.pdbId);
		});

		pdbProxy.getPdbInfo(pdbIds.join(" "), function(data) {
			pdbColl.each(function(pdb) {
				pdb.chains.each(function(chain) {
					// this is the data of the hidden column "datum"
					var datum = {
						pdbId: pdb.pdbId,
						chain: chain,
						organism: PdbDataUtil.getOrganism(data[pdb.pdbId], chain.chainId),
						summary: PdbDataUtil.generatePdbInfoSummary(data[pdb.pdbId], chain.chainId)
					};

					// only set the datum
					var row = [datum];

					// set everything else to null...
					for (var i=0; i < _.size(headers) - 1; i++)
					{
						row.push(null);
					}

					rows.push(row);
				})
			});

			callback(rows);
		});
	}
});

