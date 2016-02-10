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
 * Default table view for the mutations.
 *
 * options: {el: [target container],
 *           model: {mutations: mutation data as an array of JSON objects,
 *                   dataProxies: all available data proxies,
 *                   dataManager: global mutation data manager
 *                   geneSymbol: hugo gene symbol as a string,
 *                   tableOpts: mutation table options (optional)}
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var MutationDetailsTableView = Backbone.View.extend({
	initialize : function (options) {
		this.options = options || {};

		// custom event dispatcher
		this.dispatcher = {};
		_.extend(this.dispatcher, Backbone.Events);
	},
	render: function()
	{
		var self = this;

		// compile the template using underscore
		var templateFn = BackboneTemplateCache.getTemplateFn("mutation_details_table_template");
		// TODO customize loader image
		var template = templateFn({loaderImage: "images/ajax-loader.gif"});

		// load the compiled HTML into the Backbone "el"
		self.$el.html(template);

		// init mutation table
		self._initMutationTable();

		// format after rendering
		self.format();
	},
	/**
	 * Initializes the PDB chain table.
	 *
	 * @return {MutationDetailsTable}   table instance
	 */
	_initMutationTable: function(callback)
	{
		var self = this;

		var options = jQuery.extend(true, {}, self.model.tableOpts);
		options.el = options.el || self.$el.find(".mutation_details_table");

		var mutationColl = new MutationCollection(self.model.mutations);
		var mutationUtil = new MutationDetailsUtil(mutationColl);

		var table = new MutationDetailsTable(
			options,
			self.model.geneSymbol,
			mutationUtil,
			self.model.dataProxies,
			self.model.dataManager);

		// TODO self.mutationTable = table;
		self.mutationTable = table;

		if (_.isFunction(callback))
		{
			callback(self, table);
		}

		self._generateRowData(table, table.getColumnOptions(), mutationColl, function(rowData) {
			// init table with the row data
			table.renderTable(rowData);
			// hide loader image
			//self.$el.find(".mutation-details-table-loader").hide();
		});

		return table;
	},
	_generateRowData: function(table, headers, mutationColl, callback)
	{
		var rows = [];

		mutationColl.each(function(mutation) {
			// only set the datum
			var datum = {
				table: table, // reference to the actual table instance
				mutation: mutation // actual mutation corresponding to the row
			};
			var row = [datum];

			// set everything else to null...
			for (var i=0; i < _.size(headers) - 1; i++)
			{
				row.push(null);
			}

			rows.push(row);
		});

		callback(rows);
	},
	format: function()
	{
		// TODO format table if required
	},
	hideView: function()
	{
		var self = this;
		self.$el.hide();
	},
	showView: function()
	{
		var self = this;
		self.$el.show();
	},
	/**
	 * Highlights the given mutations in the table.
	 *
	 * @param mutations mutations to highlight
	 */
	highlight: function(mutations)
	{
		var self = this;
		var tableSelector = self.$el.find('.mutation_details_table');

		for (var i = 0; i < mutations.length; i++)
		{
			//var row = tableSelector.find("#" + mutations[i].mutationId);
            var row = tableSelector.find("tr." + mutations[i].get("mutationSid"));
            row.addClass("mutation-table-highlight");
		}
	},
	/**
	 * Clears all highlights from the mutation table.
	 */
	clearHighlights: function()
	{
		var self = this;
		var tableSelector = self.$el.find('.mutation_details_table');

		// TODO this depends on highlight function
		tableSelector.find('tr').removeClass("mutation-table-highlight");
	},
	/**
	 * Filters out all other mutations than the given mutations.
	 *
	 * @param mutations mutations to keep
	 * @param updateBox [optional] show the filter text in the search box
	 * @param limit     [optional] column to limit filtering to
	 */
	filter: function(mutations, updateBox, limit)
	{
		var self = this;
		var oTable = self.mutationTable.getDataTable();

		// construct regex
		var ids = [];

		for (var i = 0; i < mutations.length; i++)
		{
			ids.push(mutations[i].get("mutationSid"));
		}

		var regex = "(" + ids.join("|") + ")";
		var asRegex = true;

		// empty mutation list, just show everything
		if (ids.length == 0)
		{
			regex = "";
			asRegex = false;
		}

		// disable event triggering before filtering, otherwise it creates a chain reaction
		self.mutationTable.setFilterEventActive(false);

		// apply filter
		self._applyFilter(oTable, regex, asRegex, updateBox, limit);

		// enable events after filtering
		self.mutationTable.setFilterEventActive(true);
	},
	/**
	 * Resets all table filters (rolls back to initial state)
	 */
	resetFilters: function()
	{
		var self = this;
		// pass an empty array to show everything
		self.filter([], true);
		// also clean filter related variables
		self.mutationTable.cleanFilters();
	},
	/**
	 * Rolls back the table to the last state where a manual search
	 * (manual filtering) performed. This function is required since
	 * we also filter the table programmatically.
	 */
	rollBack: function()
	{
		var self = this;
		var oTable = self.mutationTable.getDataTable();

		// disable event triggering before filtering, otherwise it creates a chain reaction
		self.mutationTable.setFilterEventActive(false);

		// re-apply last manual filter string
		var searchStr = self.mutationTable.getManualSearch();
		self._applyFilter(oTable, searchStr, false);

		// enable events after filtering
		self.mutationTable.setFilterEventActive(true);
	},
	/**
	 * Filters the given data table with the provided filter string.
	 *
	 * @param oTable    target data table to be filtered
	 * @param filterStr filter string to apply with the filter
	 * @param asRegex   indicates if the given filterStr is a regex or not
	 * @param updateBox [optional] show the filter text in the search box
	 * @param limit     [optional] column to limit filtering to
	 * @private
	 */
	_applyFilter: function(oTable, filterStr, asRegex, updateBox, limit)
	{
		var self = this;

		if (limit == undefined)
		{
			limit = null;
		}

		// TODO not updating the filter text in the box may be confusing
		if (updateBox == undefined)
		{
			updateBox = false;
		}

		var smartFilter = true;
		var caseInsensitive = true;

		var prevValue = self.$el.find(".mutation_datatables_filter input[type=search]").val();

		oTable.fnFilter(filterStr, limit, asRegex, smartFilter, updateBox, caseInsensitive);

		// reset to previous value if updateBox is set to false
		if (!updateBox)
		{
			self.$el.find(".mutation_datatables_filter input[type=search]").val(prevValue);
		}
	}
});
