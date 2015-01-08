/**
 * Mutation Diagram view.
 *
 * options: {el: [target container],
 *           model: {mutations: [mutation data as an array of JSON objects],
 *                   sequence: [sequence data as an array of JSON objects],
 *                   geneSymbol: [hugo gene symbol as a string],
 *                   diagramOpts: [mutation diagram options -- optional]}
 *          }
 *
 * @author Selcuk Onur Sumer
 */
var MutationDiagramView = Backbone.View.extend({
	initialize : function (options) {
		this.options = options || {};

		// custom event dispatcher
		this.dispatcher = {};
		_.extend(this.dispatcher, Backbone.Events);
	},
	render: function()
	{
		var self = this;

		// pass variables in using Underscore.js template
		var variables = {geneSymbol: self.model.geneSymbol,
			uniprotId: self.model.sequence.metadata.identifier};

		// compile the template using underscore
		var templateFn = BackboneTemplateCache.getTemplateFn("mutation_diagram_view_template");
		var template = templateFn(variables);

		// load the compiled HTML into the Backbone "el"
		self.$el.html(template);

		// init the actual diagram component
		self.mutationDiagram = self._initMutationDiagram(
			self.model.geneSymbol,
			self.model.mutations,
			self.model.sequence,
			self.model.diagramOpts);

		self.format();
	},
	/**
	 * Formats the contents of the view after the initial rendering.
	 */
	format: function()
	{
		var self = this;

		// hide the toolbar & customization panel by default
		self.$el.find(".mutation-diagram-toolbar").hide();
		self.$el.find(".mutation-diagram-customize").hide();
		self.$el.find(".mutation-diagram-help").hide();
		self.$el.find(".mutation-diagram-toolbar-buttons").css("visibility", "hidden");

		// init toolbar if the diagram is initialized successfully
		if (self.mutationDiagram)
		{
			// init diagram toolbar
			self._initToolbar(self.mutationDiagram,
			                  self.model.geneSymbol);
		}
	},
	/**
	 * Initializes the mutation diagram view.
	 *
	 * @param gene          hugo gene symbol
	 * @param mutationData  mutation data (array of JSON objects)
	 * @param sequenceData  sequence data (as a JSON object)
	 * @param options       [optional] diagram options
	 * @return {Object}     initialized mutation diagram view
	 */
	_initMutationDiagram: function (gene, mutationData, sequenceData, options)
	{
		var self = this;

		// use defaults if no options provided
		if (!options)
		{
			options = {};
		}

		// do not draw the diagram if there is a critical error with
		// the sequence data
		if (sequenceData["length"] == "" ||
		    parseInt(sequenceData["length"]) <= 0)
		{
			// return null to indicate an error
			return null;
		}

		// overwrite container in any case (for consistency with the default view)
		options.el = self.$el.find(".mutation-diagram-container");

		// create a backbone collection for the given data
		var mutationColl = new MutationCollection(mutationData);

		// create a data object
		var diagramData = {
			pileups: PileupUtil.convertToPileups(mutationColl),
			sequence: sequenceData
		};

		var mutationDiagram = new MutationDiagram(gene, options, diagramData);

		// if no sequence data is provided, try to get it from the servlet
		if (sequenceData == null)
		{
			// TODO use PfamDataProxy instance!!
			$.getJSON("getPfamSequence.json",
			{geneSymbol: self.geneSymbol},
				function(data) {
					if (data)
					{
						mutationDiagram.updateSequenceData(data[0]);
					}

					mutationDiagram.initDiagram();
			});
		}
		// if data is already there just init the diagram
		else
		{
			mutationDiagram.initDiagram();
		}

		return mutationDiagram;
	},
	/**
	 * Initializes the toolbar over the mutation diagram.
	 *
	 * @param diagram       the mutation diagram instance
	 * @param geneSymbol    gene symbol as a string
	 */
	_initToolbar: function(diagram, geneSymbol) {
		var self = this;

		var toolbar = self.$el.find(".mutation-diagram-toolbar");
		var pdfButton = self.$el.find(".diagram-to-pdf");
		var svgButton = self.$el.find(".diagram-to-svg");
		var customizeButton = self.$el.find(".diagram-customize");
		var helpButton = self.$el.find(".diagram-help");

		// helper function to trigger submit event for the svg and pdf button clicks
		var submitForm = function(alterFn, diagram, type)
		{
			var filename = "mutation_diagram_" + geneSymbol + "." + type;

			// alter diagram to have the desired output
			alterFn(diagram, false);

			if (type == "svg")
			{
				cbio.download.initDownload(diagram.svg[0][0], {filename: filename});
			}
			else if (type == "pdf")
			{
				var params = {filename: filename,
					contentType: "application/pdf",
					servletName: "svgtopdf.do"
				};

				cbio.download.initDownload(diagram.svg[0][0], params);
			}

			// restore previous settings after generating xml string
			alterFn(diagram, true);

//			// set actual value of the form element (svgelement)
//			var form = self.$el.find("." + formClass);
//			form.find('input[name="svgelement"]').val(svgString);
//
//			// submit form
//			form.submit();
		};

		// helper function to adjust SVG for file output
		var alterDiagramForSvg = function(diagram, rollback)
		{
			var topLabel = geneSymbol;

			if (rollback)
			{
				topLabel = "";
			}

			// adding a top left label (to include a label in the file)
			diagram.updateTopLabel(topLabel);
		};

		// helper function to adjust SVG for PDF output
		var alterDiagramForPdf = function(diagram, rollback)
		{
			// we also need the same changes (top label) in pdf
			alterDiagramForSvg(diagram, rollback);
		};

		//add listener to the svg button
		svgButton.click(function (event) {
			// submit svg form
			//submitForm(alterDiagramForSvg, diagram, "svg-to-file-form");
			submitForm(alterDiagramForSvg, diagram, "svg");
		});

		// add listener to the pdf button
		pdfButton.click(function (event) {
			// submit pdf form
			//submitForm(alterDiagramForPdf, diagram, "svg-to-pdf-form");
			submitForm(alterDiagramForPdf, diagram, "pdf");
		});

		// add listeners to customize button
		customizeButton.click(function(event) {
			var panel = self.customizePanelView;

			// init view if not init yet
			if (!panel)
			{
				panel = new MutationCustomizePanelView({
					el: self.$el.find(".mutation-diagram-customize"),
					diagram: diagram});
				panel.render();

				self.customizePanelView = panel;
			}

			// toggle view
			panel.toggleView();
		});

		// add listeners to customize button
		helpButton.click(function(event) {
			var panel = self.helpPanelView;

			// init view if not init yet
			if (!panel)
			{
				panel = new MutationHelpPanelView({
					el: self.$el.find(".mutation-diagram-help")});
				panel.render();

				self.helpPanelView = panel;
			}

			// toggle view
			panel.toggleView();
		});

		// hide buttons initially, show on mouse over
		self._autoHideToolbarButtons();

		toolbar.show();
	},
	/**
	 * Shows the toolbar buttons only on mouse over.
	 * And hides them on mouse out.
	 */
	_autoHideToolbarButtons: function()
	{
		var self = this;
		var buttons = self.$el.find(".mutation-diagram-toolbar-buttons");

		cbio.util.autoHideOnMouseLeave(self.$el, buttons);
	}
});
