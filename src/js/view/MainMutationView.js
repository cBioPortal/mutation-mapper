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

var PdbPanelView = require("../view/PdbPanelView");
var MutationSummaryView = require("../view/MutationSummaryView");
var Mutation3dView = require("../view/Mutation3dView");
var MutationDiagramView = require("../view/MutationDiagramView");
var MutationDetailsTableView = require("../view/MutationDetailsTableView");
var MutationInfoPanelView = require("../view/MutationInfoPanelView");
var MutationDetailsEvents = require("../controller/MutationDetailsEvents");
var BackboneTemplateCache = require("../util/BackboneTemplateCache");

var Backbone = require("backbone");
var _ = require("underscore");
var $ = require("jquery");
var jQuery = $;

/**
 * Default mutation view for a single gene.
 *
 * options: {el: [target container],
 *           model: {geneSymbol: [hugo gene symbol],
 *                   mutationData: [mutation data for a specific gene]
 *                   dataProxies: [all available data proxies],
 *                   dataManager: global mutation data manager,
 *                   uniprotId: uniprot identifier,
 *                   sampleArray: [list of case ids as an array of strings]}
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var MainMutationView = Backbone.View.extend({
	initialize : function (options) {
		var defaultOpts = {
			config: {
				loaderImage: "images/ajax-loader.gif"
			}
		};

		this.options = jQuery.extend(true, {}, defaultOpts, options);

		// custom event dispatcher
		this.dispatcher = {};
		_.extend(this.dispatcher, Backbone.Events);
	},
	render: function() {
		var self = this;

		// pass variables in using Underscore.js template
		var variables = {geneSymbol: self.model.geneSymbol,
			uniprotId: self.model.uniprotId};

		// compile the template using underscore
		var templateFn = BackboneTemplateCache.getTemplateFn("mutation_view_template");
		var template = templateFn(variables);

		// load the compiled HTML into the Backbone "el"
		self.$el.html(template);

		// format after rendering
		self.format();
	},
	format: function() {
		var self = this;

		// initially hide all components by default
		// they will be activated wrt selected options
		self.$el.find(".mutation-details-filter-info").hide();
		self.$el.find(".mutation-details-no-data-info").hide();
		self.$el.find(".mutation-3d-initializer").hide();
		self.$el.find(".mutation-info-panel-container").hide();
		self.$el.find(".mutation-summary-view").hide();
		self.$el.find(".mutation-table-container").hide();
		self.$el.find(".mutation-diagram-view").hide();
	},
	initPdbPanelView: function(renderOpts, panelOpts, tableOpts, pdbColl)
	{
		var self = this;
		var diagram = null;

		// diagram can be null/disabled
		if (self.diagramView && self.diagramView.mutationDiagram)
		{
			diagram = self.diagramView.mutationDiagram;
		}

		// TODO we should not be overwriting the render options...
		renderOpts.loaderImage = self.options.config.loaderImage;

		// allow initializing the pdb panel even if there is no diagram
		var viewOpts = {
			//el: "#mutation_pdb_panel_view_" + gene.toUpperCase(),
			el: self.$el.find(".mutation-pdb-panel-view"),
			config: renderOpts,
			model: {geneSymbol: self.model.geneSymbol,
				pdbColl: pdbColl,
				pdbProxy: self.model.dataProxies.pdbProxy,
				pdbPanelOpts: panelOpts,
				pdbTableOpts: tableOpts},
			diagram: diagram
		};

		var pdbPanelView = new PdbPanelView(viewOpts);
		pdbPanelView.render();

		self._pdbPanelView = pdbPanelView;

		return pdbPanelView;
	},
	initSummaryView: function()
	{
		var self = this;
		var target = self.$el.find(".mutation-summary-view");
		target.show();

		var summaryOpts = {
			el: target,
			model: {
				mutationProxy: self.model.dataProxies.mutationProxy,
				clinicalProxy: self.model.dataProxies.clinicalProxy,
				geneSymbol: self.model.geneSymbol,
				sampleArray: self.model.sampleArray
			}
		};

		var summaryView = new MutationSummaryView(summaryOpts);
		summaryView.render();

		self.summaryView = summaryView;

		return summaryView;
	},
	init3dView: function(mut3dVisView)
	{
		var self = this;

		return self._init3dView(self.model.geneSymbol,
			self.model.uniprotId,
			self.model.dataProxies.pdbProxy,
			mut3dVisView);
	},
	/**
	 * Initializes the 3D view initializer.
	 *
	 * @param gene
	 * @param uniprotId
	 * @param pdbProxy
	 * @param mut3dVisView
	 * @return {Object}     a Mutation3dView instance
	 */
	_init3dView: function(gene, uniprotId, pdbProxy, mut3dVisView)
	{
		var self = this;

		var target = self.$el.find(".mutation-3d-initializer");
		target.show();

		// init the 3d view (button)
		var view3d = new Mutation3dView({
			el: target,
			model: {uniprotId: uniprotId,
				geneSymbol: gene,
				pdbProxy: pdbProxy}
		});

		view3d.render();

		// also reset (init) the 3D view if the 3D panel is already active
		if (mut3dVisView &&
		    mut3dVisView.isVisible())
		{
			view3d.resetView();
		}

		return view3d;
	},
	/**
	 * Initializes the mutation diagram view for the given diagram options
	 * and sequence data.
	 *
	 * @param options   mutation diagram options
	 * @param sequence  PFAM sequence data
	 * @returns {MutationDiagramView} mutation diagram view instance
	 */
	initMutationDiagramView: function(options, sequence)
	{
		var self = this;

		//mutationData = mutationData || self.model.mutationData;

		self.diagramView = self._initMutationDiagramView(
			self.model.geneSymbol,
			self.model.mutationData,
			sequence,
			self.model.dataProxies,
		    options);

		if (!self.diagramView)
		{
			console.log("Error initializing mutation diagram: %s", self.model.geneSymbol);
		}
		else
		{
			self.dispatcher.trigger(
				MutationDetailsEvents.DIAGRAM_INIT,
				self.diagramView.mutationDiagram);
		}

		return self.diagramView;
	},
	/**
	 * Initializes the mutation diagram view.
	 *
	 * @param gene          hugo gene symbol
	 * @param mutationData  mutation data (array of JSON objects)
	 * @param sequenceData  sequence data (as a JSON object)
	 * @param dataProxies   all available data proxies
	 * @param options       [optional] diagram options
	 * @return {Object}     initialized mutation diagram view
	 */
	_initMutationDiagramView: function (gene, mutationData, sequenceData, dataProxies, options)
	{
		var self = this;
		var target = self.$el.find(".mutation-diagram-view");
		target.show();

		var model = {mutations: mutationData,
			sequence: sequenceData,
			geneSymbol: gene,
			dataProxies: dataProxies,
			diagramOpts: options};

		var diagramView = new MutationDiagramView({
			el: target,
			model: model});

		diagramView.render();

		return diagramView;
	},
	initMutationTableView: function(options)
	{
		var self = this;

		self.tableView = self._initMutationTableView(self.model.geneSymbol,
			self.model.mutationData,
			self.model.dataProxies,
			self.model.dataManager,
		    options);

		if (!self.tableView)
		{
			console.log("Error initializing mutation table: %s", self.model.geneSymbol);
		}
		else
		{
			self.dispatcher.trigger(
				MutationDetailsEvents.MUTATION_TABLE_INITIALIZED,
				self.tableView.mutationTable);
		}

		return self.tableView;
	},
	/**
	 * Initializes the mutation table view.
	 *
	 * @param gene          hugo gene symbol
	 * @param mutationData  mutation data (array of JSON objects)
	 * @param dataProxies   all available data proxies
	 * @param dataManager   global mutation data manager
	 * @param options       [optional] table options
	 * @return {Object}     initialized mutation table view
	 */
	_initMutationTableView: function(gene, mutationData, dataProxies, dataManager, options)
	{
		var self = this;
		var target = self.$el.find(".mutation-table-container");
		target.show();

		var mutationTableView = new MutationDetailsTableView({
			el: target,
			config: {loaderImage: self.options.config.loaderImage},
			model: {geneSymbol: gene,
				mutations: mutationData,
				dataProxies: dataProxies,
				dataManager: dataManager,
				tableOpts: options}
		});

		mutationTableView.render();

		return mutationTableView;
	},
	initMutationInfoView: function(options)
	{
		var self = this;
		var target = self.$el.find(".mutation-info-panel-container");
		target.show();

		var model = {
			mutations: self.model.mutationData,
			infoPanelOpts: options
		};

		var infoView = new MutationInfoPanelView({
			el: target,
			model: model
		});

		infoView.render();

		self.infoView = infoView;

		self.dispatcher.trigger(
			MutationDetailsEvents.INFO_PANEL_INIT,
			self.infoView);

		return infoView;
	},
	/**
	 * Initializes the filter reset link, which is a part of filter info
	 * text on top of the diagram, with the given callback function.
	 *
	 * @param callback      function to be invoked on click
	 */
	addResetCallback: function(callback) {
		var self = this;
		var resetLink = self.$el.find(".mutation-details-filter-reset");

		// add listener to diagram reset link
		resetLink.click(callback);
	},
	showFilterInfo: function() {
		this.$el.find(".mutation-details-filter-info").slideDown();
	},
	hideFilterInfo: function() {
		this.$el.find(".mutation-details-filter-info").slideUp();
	},
	showNoDataInfo: function() {
		this.$el.find(".mutation-details-no-data-info").slideDown();
	},
	hideNoDataInfo: function() {
		this.$el.find(".mutation-details-no-data-info").slideUp();
	}
});

module.exports = MainMutationView;