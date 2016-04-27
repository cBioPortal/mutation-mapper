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
 * Default mutation details view for the entire mutation details tab.
 * Creates a separate MainMutationView (another Backbone view) for each gene.
 *
 * options: {el: [target container],
 *           model: {mutationProxy: [mutation data proxy],
 *                   sampleArray: [list of case ids as an array of strings],
 *                   diagramOpts: [mutation diagram options -- optional],
 *                   tableOpts: [mutation table options -- optional]}
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var MutationDetailsView = Backbone.View.extend({
	initialize : function (options) {
		var defaultOpts = {
			config: {
				coreTemplate: "default_mutation_details_template",
				mainContentTemplate: "default_mutation_details_main_content_template",
				listContentTemplate: "default_mutation_details_list_content_template"
			}
		};

		this.options = jQuery.extend(true, {}, defaultOpts, options);

		this._3dPanelInitialized = false;

		// custom event dispatcher
		this.dispatcher = {};
		_.extend(this.dispatcher, Backbone.Events);
	},
	render: function() {
		var self = this;

		// init tab view flags (for each gene)
		self.geneTabView = {};

		var content = self._generateContent();

		// TODO make the image customizable?
		var variables = {loaderImage: "images/ajax-loader.gif",
			listContent: content.listContent,
			mainContent: content.mainContent};

		// compile the template using underscore
		var templateFn = BackboneTemplateCache.getTemplateFn(self.options.config.coreTemplate);
		var template = templateFn(variables);

		// load the compiled HTML into the Backbone "el"
		self.$el.html(template);

		if (self.model.mutationProxy.hasData())
		{
			if (_.isFunction(self.options.config.init))
			{
				self.options.config.init(self);
			}
			else
			{
				// init default view, if no custom init function is provided
				self._initDefaultView();
			}
		}

		// format after render

		if (self.options.config.format)
		{
			self.options.config.format(self);
		}
		else
		{
			self.format();
		}
	},
	/**
	 * Formats the contents of the view after the initial rendering.
	 */
	format: function()
	{
		var self = this;

		if (self.model.mutationProxy.hasData())
		{
			var mainContent = self.$el.find(".mutation-details-content");
			mainContent.tabs();
			mainContent.tabs('paging', {tabsPerPage: 10, follow: true, cycle: false});
			mainContent.tabs("option", "active", 0);
			self.$el.find(".mutation-details-tabs-ref").tipTip(
				{defaultPosition: "bottom", delay:"100", edgeOffset: 10, maxWidth: 200});
		}
	},
	/**
	 * Refreshes the genes tab.
	 * (Intended to fix a resize problem with ui.tabs.paging plugin)
	 */
	refreshGenesTab: function()
	{
		// tabs("refresh") is problematic...
//		var self = this;
//		var mainContent = self.$el.find(".mutation-details-content");
//		mainContent.tabs("refresh");

        // just trigger the window resize event,
        // rest is handled by the resize handler in ui.tabs.paging plugin.
		// it would be better to directly call the resize handler of the plugin,
		// but the function doesn't have public access...
		$(window).trigger('resize');
	},
	init3dPanel: function()
	{
		var self = this;

		self.dispatcher.trigger(
			MutationDetailsEvents.VIS_3D_PANEL_INIT);

		self._3dPanelInitialized = true;
	},
	is3dPanelInitialized: function()
	{
		var self = this;

		return self._3dPanelInitialized;
	},
	/**
	 * Generates the content structure by creating div elements for each
	 * gene.
	 *
	 * @return {Object} content backbone with div elements for each gene
	 */
	_generateContent: function()
	{
		var self = this;
		var mainContent = "";
		var listContent = "";

		// create a div for for each gene
		_.each(self.model.mutationProxy.getGeneList(), function(gene, idx) {
			var templateFn = BackboneTemplateCache.getTemplateFn(self.options.config.mainContentTemplate);

			mainContent += templateFn(
					{loaderImage: "images/ajax-loader.gif",
						geneSymbol: gene,
						geneId: cbio.util.safeProperty(gene)});

			templateFn = BackboneTemplateCache.getTemplateFn(self.options.config.listContentTemplate);

			listContent += templateFn(
				{geneSymbol: gene,
					geneId: cbio.util.safeProperty(gene)});
		});

		return {mainContent: mainContent,
			listContent: listContent};
	},
	/**
	 * Initializes the mutation view for the current mutation data.
	 * Use this function if you want to have a default view of mutation
	 * details composed of different backbone views (by default params).
	 *
	 * If you want to have more customized components, it is better
	 * to initialize all the component separately.
	 */
	_initDefaultView: function()
	{
		var self = this;

		var contentSelector = self.$el.find(".mutation-details-content");

		// reset all previous tabs related listeners (if any)
		contentSelector.bind('tabscreate', false);
		contentSelector.bind('tabsactivate', false);

		// init view for the first gene only
		contentSelector.bind('tabscreate', function(event, ui) {
			// hide loader image
			self.$el.find(".mutation-details-loader").hide();

			// trigger corresponding event
			self.dispatcher.trigger(
				MutationDetailsEvents.GENE_TABS_CREATED);
		});

		// init other views upon selecting the corresponding tab
		contentSelector.bind('tabsactivate', function(event, ui) {
			// note: ui.index is replaced with ui.newTab.index() after jQuery 1.9
			//var gene = genes[ui.newTab.index()];

			// using index() causes problems with ui.tabs.paging plugin,
			// get the gene name directly from the html content
			var gene = ui.newTab.text().trim();

			// trigger corresponding event
			self.dispatcher.trigger(
				MutationDetailsEvents.GENE_TAB_SELECTED,
				gene);
		});
	}
});
