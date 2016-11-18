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
 * Constructor for the MutationDiagram class.
 *
 * @param geneSymbol    hugo gene symbol
 * @param options       visual options object
 * @param data          object: {mutations: a MutationCollection instance,
 *                               sequence: sequence data as a JSON object}
 * @param dataProxies   all available data proxies
 * @constructor
 *
 * @author Selcuk Onur Sumer
 */
function MutationDiagram(geneSymbol, options, data, dataProxies)
{
	var self = this;

	// event listeners
	self.listeners = {};

	// custom event dispatcher
	self.dispatcher = {};
	_.extend(self.dispatcher, Backbone.Events);

	// merge options with default options to use defaults for missing values
	self.options = jQuery.extend(true, {}, self.defaultOpts, options);

	self.dataProxies = dataProxies;
	self.geneSymbol = geneSymbol; // hugo gene symbol
	self.data = data; // processed initial (unfiltered) data
	self.pileups = (data == null) ? null : // current pileups (updated after each filtering)
		PileupUtil.convertToPileups(data.mutations, options.pileupConverter);
	self.initialPileups = self.pileups;
	self.highlighted = {}; // map of highlighted data points (initially empty)
	self.multiSelect = false; // indicates if multiple lollipop selection is active

	// init other class members as null, will be assigned later
	self.svg = null;    // svg element (d3)
	self.bounds = null; // bounds of the plot area
	self.gData = null; // svg group for lollipop data points
	self.gLine = null;   // svg group for lollipop lines
	self.gLabel = null;  // svg group for lollipop labels
	self.xScale = null;  // scale function for x-axis
	self.yScale = null;  // scale function for y-axis
	self.topLabel = null;   // label on top-left corner of the diagram
	self.xAxisLabel = null; // label for x-axis
	self.yAxisLabel = null; // label for y-axis
	self.xMax = null; // max value on the x-axis
	self.yMax = null; // max value on the y-axis
	self.maxCount = null; // mutation count of the highest data point

	// color mapping for mutations: <mutation id, (pileup) color> pairs
	self.mutationColorMap = {};

	// mutation id to pileup mapping: <mutation sid, pileup group> pairs
	self.mutationPileupMap = {};
}

// TODO use percent values instead of pixel values for some components?
// TODO allow "auto" or a function as an option where applicable

/**
 * Default visual options.
 */
MutationDiagram.prototype.defaultOpts = {
	el: "#mutation_diagram_d3", // id of the container
	elWidth: 740,               // width of the container
	elHeight: 180,              // height of the container
	marginLeft: 45,             // left margin for the plot area
	marginRight: 30,            // right margin for the plot area
	marginTop: 30,              // top margin for the plot area
	marginBottom: 60,           // bottom margin for the plot area
	labelTop: "",                 // informative label on top of the diagram (false means "do not draw")
	labelTopFont: "sans-serif",   // font type of the top label
	labelTopFontColor: "#2E3436", // font color of the top label
	labelTopFontSize: "12px",     // font size of the top label
	labelTopFontWeight: "bold",   // font weight of the top label
	labelTopMargin: 2,            // left margin for the top label
	labelX: false,              // informative label of the x-axis (false means "do not draw")
	labelXFont: "sans-serif",   // font type of the x-axis label
	labelXFontColor: "#2E3436", // font color of the x-axis label
	labelXFontSize: "12px",     // font size of x-axis label
	labelXFontWeight: "normal", // font weight of x-axis label
	labelY: "# Mutations",      // informative label of the y-axis (false means "do not draw")
	labelYFont: "sans-serif",   // font type of the y-axis label
	labelYFontColor: "#2E3436", // font color of the y-axis label
	labelYFontSize: "12px",     // font size of y-axis label
	labelYFontWeight: "normal", // font weight of y-axis label
	minLengthX: 0,              // min value of the largest x value to show
	minLengthY: 5,              // min value of the largest y value to show
	maxLengthX: Infinity,       // max value of the largest x value to show (infinity: no upper value)
	maxLengthY: Infinity,       // max value of the largest y value to show (infinity: no upper value)
	seqFillColor: "#BABDB6",    // color of the sequence rectangle
	seqHeight: 14,              // height of the sequence rectangle
	seqPadding: 5,              // padding between sequence and plot area
	regionHeight: 24,           // height of a region (drawn on the sequence)
	regionFont: "sans-serif",   // font of the region text
	regionFontColor: "#FFFFFF", // font color of the region text
	regionFontSize: "12px",     // font size of the region text
	regionTextAnchor: "middle", // text anchor (alignment) for the region label
	showRegionText: true,       // show/hide region text
	showStats: false,           // show/hide mutation stats in the lollipop tooltip
	multiSelectKeycode: 16,     // shift (default multiple selection key)
	lollipopLabelCount: 1,          // max number of lollipop labels to display
	lollipopLabelThreshold: 2,      // y-value threshold: points below this value won't be labeled
	lollipopFont: "sans-serif",     // font of the lollipop label
	lollipopFontColor: "#2E3436",   // font color of the lollipop label
	lollipopFontSize: "10px",       // font size of the lollipop label
	lollipopTextAnchor: "auto",     // text anchor (alignment) for the lollipop label
	lollipopTextPadding: 8,         // padding between the label and the data point
	lollipopTextAngle: 0,           // rotation angle for the lollipop label
//	lollipopFillColor: "#B40000",
	lollipopFillColor: {            // color of the lollipop data point
		missense: "#008000",
		truncating: "#000000",
		inframe: "#8B4513",
		fusion: "#8B00C9",
		other: "#8B00C9",       // all other mutation types
		default: "#BB0000"      // default is used when there is a tie
	},
	lollipopBorderColor: "#BABDB6", // border color of the lollipop data points
	lollipopBorderWidth: 0.5,       // border width of the lollipop data points
	lollipopSize: 30,               // size of the lollipop data points
	lollipopHighlightSize: 100,     // size of the highlighted lollipop data points
	lollipopStrokeWidth: 1,         // width of the lollipop lines
	lollipopStrokeColor: "#BABDB6", // color of the lollipop line
	lollipopShapeRegular: "circle", // shape of the regular lollipop data points
	lollipopShapeSpecial: "circle", // shape of the special lollipop data points
	xAxisPadding: 10,           // padding between x-axis and the sequence
	xAxisTickIntervals: [       // valid major tick intervals for x-axis
		100, 200, 400, 500, 1000, 2000, 5000, 10000, 20000, 50000
	],
	xAxisTicks: 8,              // maximum number of major ticks for x-axis
								// (a major tick may not be labeled if it is too close to the max)
	xAxisTickSize: 6,           // size of the major ticks of x-axis
	xAxisStroke: "#AAAAAA",     // color of the x-axis lines
	xAxisFont: "sans-serif",    // font type of the x-axis labels
	xAxisFontSize: "10px",      // font size of the x-axis labels
	xAxisFontColor: "#2E3436",  // font color of the x-axis labels
	yAxisPadding: 5,            // padding between y-axis and the plot area
	yAxisLabelPadding: 15,      // padding between y-axis and its label
	yAxisTicks: 10,             // maximum number of major ticks for y-axis
	yAxisTickIntervals: [       // valid major tick intervals for y-axis
		1, 2, 5, 10, 20, 50, 100, 200, 500
	],
	yAxisTickSize: 6,           // size of the major ticks of y-axis
	yAxisStroke: "#AAAAAA",     // color of the y-axis lines
	yAxisFont: "sans-serif",    // font type of the y-axis labels
	yAxisFontSize: "10px",      // font size of the y-axis labels
	yAxisFontColor: "#2E3436",  // font color of the y-axis labels
	yAxisAutoAdjust: true,      // indicates whether to adjust max y-axis value after plot update
	animationDuration: 1000,    // transition duration (in ms) used for highlight animations
	fadeDuration: 1500,         // transition duration (in ms) used for fade animations
	pileupConverter: false,
	/**
	 * Default lollipop tooltip function.
	 *
	 * @param element   target svg element (lollipop data point)
	 * @param pileup    a pileup model instance
     * @param showStats whether to show cancer type distribution in the tooltip
	 */
	lollipopTipFn: function (element, pileup, showStats) {
		var tooltipView = new LollipopTipView({model: pileup});
        tooltipView.setShowStats(showStats);
		var content = tooltipView.compileTemplate();

		var options = {content: {text: content},
			hide: {fixed: true, delay: 100, event: 'mouseout'},
			show: {event: 'mouseover'},
			style: {classes: 'qtip-light qtip-rounded qtip-shadow cc-ui-tooltip'},
			position: {my:'bottom left', at:'top center',viewport: $(window)}};

		//$(element).qtip(options);
		cbio.util.addTargetedQTip(element, options);
	},
	/**
	 * Default region tooltip function.
	 *
	 * @param element   target svg element (region rectangle)
	 * @param region    a JSON object representing the region
	 * @param maProxy   mutation aligner proxy for additional region data
	 */
	regionTipFn: function (element, region, maProxy) {
		var model = {identifier: region.metadata.identifier,
			type: region.type,
			description: region.metadata.description,
			start: region.metadata.start,
			end: region.metadata.end,
			pfamAccession: region.metadata.accession,
			mutationAlignerInfo: ""};

		maProxy.getMutationAlignerData(
			{pfamAccession: region.metadata.accession},
			function(data) {
				// if the link is valid update model.mutationAligner
				if (data != null &&
				    data.linkToMutationAligner != null &&
				    data.linkToMutationAligner.length > 0)
				{
					var templateFn = BackboneTemplateCache.getTemplateFn("mutation_aligner_info_template");
					model.mutationAlignerInfo = templateFn({
						linkToMutationAligner: data.linkToMutationAligner
					});
				}

				var tooltipView = new RegionTipView({model: model});
				var content = tooltipView.compileTemplate();

				var options = {content: {text: content},
					hide: {fixed: true, delay: 100, event: 'mouseout'},
					show: {event: 'mouseover'},
					style: {classes: 'qtip-light qtip-rounded qtip-shadow qtip-lightyellow'},
					position: {my:'bottom left', at:'top center',viewport: $(window)}};

				//$(element).qtip(options);
				cbio.util.addTargetedQTip(element, options);
			}
		);
	}
};

/**
 * Updates the diagram options object with the given one.
 * This function does not update (re-render) the actual view
 * with the new options. only updates some class fields.
 *
 * @param options   diagram options object
 */
MutationDiagram.prototype.updateOptions = function(options)
{
	var self = this;

	// merge options with current options to use existing ones for missing values
	self.options = jQuery.extend(true, {}, self.options, options);

	// recalculate global values
	self.updateGlobals();
};

/**
 * Rescales the y-axis by using the updated options and
 * latest (filtered) data.
 *
 * @param noUpdatePlot if set true, plot contents are NOT updated
 */
MutationDiagram.prototype.rescaleYAxis = function(noUpdatePlot)
{
	var self = this;

	// recalculate global values
	self.updateGlobals();

	// remove & draw y-axis
	self.svg.select(".mut-dia-y-axis").remove();
	self.drawYAxis(self.svg, self.yScale, self.yMax, self.options, self.bounds);

	if (!noUpdatePlot)
	{
		// re-draw the plot with new scale
		self.updatePlot();
	}
};


/**
 * Update global class fields such as bounds, scales, max, etc.
 * wrt the given options.
 *
 * @param options   diagram options
 */
MutationDiagram.prototype.updateGlobals = function(options)
{
	var self = this;
	options = options || self.options;

	var pileups = self.initialPileups; // initial pileup data

	// in case auto adjust is enabled,
	// use current pileup data instead of the initial pileup data
	if (options.yAxisAutoAdjust)
	{
		pileups = self.pileups;
	}

	var maxCount = self.maxCount = self.calcMaxCount(pileups);

	var xMax = self.xMax = self.calcXMax(options, self.data);
	var yMax = self.yMax = self.calcYMax(options, maxCount);

	self.bounds = this.calcBounds(options);
	self.xScale = this.xScaleFn(self.bounds, xMax);
	self.yScale = this.yScaleFn(self.bounds, yMax);
};

/**
 * Updates the sequence data associated with this diagram.
 *
 * @param sequenceData  sequence data as a JSON object
 */
MutationDiagram.prototype.updateSequenceData = function(sequenceData)
{
	var self = this;

	self.data.sequence = sequenceData;
};

/**
 * Initializes the diagram with the given sequence data.
 * If no sequence data is provided, then tries to retrieve
 * the data from the default servlet.
 */
MutationDiagram.prototype.initDiagram = function()
{
	var self = this;

	// selecting using jQuery node to support both string and jQuery selector values
	var node = $(self.options.el)[0];
	var container = d3.select(node);

	// calculate bounds & save a reference for future access
	var bounds = self.bounds = self.calcBounds(self.options);

	self.mutationPileupMap = PileupUtil.mapToMutations(self.initialPileups);

	// init svg container
	var svg = self.createSvg(container,
	                         self.options.elWidth,
	                         self.options.elHeight);

	// save a reference for future access
	self.svg = svg;

	// draw the whole diagram
	self.drawDiagram(svg,
	                 bounds,
	                 self.options,
	                 self.data);

	// add default listeners
	self.addDefaultListeners();
};

/**
 * Calculates the bounds of the actual plot area excluding
 * axes, sequence, labels, etc. So, this is the bounds for
 * the data points (lollipops) only.
 *
 * @param options   options object
 * @return {object} bounds as an object
 */
MutationDiagram.prototype.calcBounds = function(options)
{
	var bounds = {};

	bounds.width = options.elWidth -
	               (options.marginLeft + options.marginRight);
	bounds.height = options.elHeight -
	                (options.marginBottom + options.marginTop);
	bounds.x = options.marginLeft;
	bounds.y = options.elHeight - options.marginBottom;

	return bounds;
};

/**
 * Draws the mutation diagram.
 *
 * @param svg       svg container for the diagram
 * @param bounds    bounds of the plot area {width, height, x, y}
 *                  x, y is the actual position of the origin
 * @param options   options object
 * @param data      data to visualize
 */
MutationDiagram.prototype.drawDiagram = function (svg, bounds, options, data)
{
	var self = this;
	var sequenceLength = parseInt(data.sequence["length"]);
	var pileups = self.initialPileups || PileupUtil.convertToPileups(data.mutations, options.pileupConverter);

	var maxCount = self.maxCount = self.calcMaxCount(pileups);
	var xMax = self.xMax = self.calcXMax(options, data);
	var yMax = self.yMax = self.calcYMax(options, maxCount);

	var regions = data.sequence.regions;
	var seqTooltip = self.generateSequenceTooltip(data);

	var xScale = self.xScale = self.xScaleFn(bounds, xMax);
	var yScale = self.yScale = self.yScaleFn(bounds, yMax);

	// draw x-axis
	self.drawXAxis(svg, xScale, xMax, options, bounds);

	if (options.labelX != false)
	{
		//TODO self.xAxisLabel = self.drawXAxisLabel(svg, options, bounds);
	}

	// draw y-axis
	self.drawYAxis(svg, yScale, yMax, options, bounds);

	if (options.labelY != false)
	{
		self.yAxisLabel = self.drawYAxisLabel(svg, options, bounds);
	}

	if (options.topLabel != false)
	{
		self.topLabel = self.drawTopLabel(svg, options, bounds);
	}

	// draw a fully transparent rectangle for proper background click handling
	var rect = svg.append('rect')
		.attr('fill', '#FFFFFF')
		.attr('opacity', 0)
		.attr('x', bounds.x)
		.attr('y', bounds.y - bounds.height)
		.attr('width', bounds.width)
		.attr('height', bounds.height)
		.attr('class', 'mut-dia-background');

	// draw the plot area content
	self.drawPlot(svg,
		pileups,
		options,
		bounds,
		xScale,
		yScale);

	// draw sequence
	var sequence = self.drawSequence(svg, options, bounds);
	// add a regular tooltip (not qtip)
	sequence.attr("title", seqTooltip);

	// draw regions
	for (var i = 0, size = regions.length; i < size; i++)
	{
		self.drawRegion(svg, regions[i], options, bounds, xScale);
	}
};

/**
 * Generates an x-scale function for the current bounds
 * and the max value of the x-axis.
 *
 * @param bounds    bounds of the plot area {width, height, x, y}
 *                  x, y is the actual position of the origin
 * @param max       maximum value for the x-axis
 * @return {function} scale function for the x-axis
 */
MutationDiagram.prototype.xScaleFn = function(bounds, max)
{
	return d3.scale.linear()
		.domain([0, max])
		.range([bounds.x, bounds.x + bounds.width]);
};

/**
 * Generates a y-scale function for the current bounds
 * and the max value of the y-axis.
 *
 * @param bounds    bounds of the plot area {width, height, x, y}
 *                  x, y is the actual position of the origin
 * @param max       maximum value for the y-axis
 * @return {function} scale function for the y-axis
 */
MutationDiagram.prototype.yScaleFn = function(bounds, max)
{
	return d3.scale.linear()
		.domain([0, max])
		.range([bounds.y, bounds.y - bounds.height]);
};

/**
 * Finds out the maximum value for the x-axis.
 *
 * @param options   options object
 * @param data      data to visualize
 * @return {Number} maximum value for the x-axis
 */
MutationDiagram.prototype.calcXMax = function(options, data)
{
	var sequenceLength = parseInt(data.sequence["length"]);

	return Math.min(options.maxLengthX,
		Math.max(sequenceLength, options.minLengthX));
};

/**
 * Finds out the maximum value for the y-axis.
 *
 * @param options   options object
 * @param maxCount  number of mutations in the highest data point
 * @return {Number} maximum value for the y-axis
 */
MutationDiagram.prototype.calcYMax = function(options, maxCount)
{
	return Math.min(options.maxLengthY,
		Math.max(maxCount, options.minLengthY));
};

/**
 * Generates the tooltip content for the sequence rectangle.
 *
 * @param data      data to visualize
 * @return {string} tooltip content
 */
MutationDiagram.prototype.generateSequenceTooltip = function(data)
{
	var seqTooltip = "";
	var sequenceLength = parseInt(data.sequence["length"]);

	if (data.sequence.metadata.identifier)
	{
		seqTooltip += data.sequence.metadata.identifier;

		if (data.sequence.metadata.description)
		{
			seqTooltip += ", " + data.sequence.metadata.description;
		}
	}

	seqTooltip += " (" + sequenceLength + "aa)";

	return seqTooltip;
};

/**
 * Draw lollipop lines, data points and labels on the plot area
 * for the provided mutations (pileups).
 *
 * @param svg       svg container for the diagram
 * @param pileups   array of mutations (pileups)
 * @param options   options object
 * @param bounds    bounds of the plot area {width, height, x, y}
 *                  x, y is the actual position of the origin
 * @param xScale    scale function for the x-axis
 * @param yScale    scale function for the y-axis
 */
MutationDiagram.prototype.drawPlot = function(svg, pileups, options, bounds, xScale, yScale)
{
	var self = this;

	// group for lollipop labels (draw labels first)
	var gText = self.gLabel;
	if (gText === null)
	{
		gText = svg.append("g").attr("class", "mut-dia-lollipop-labels");
		self.gLabel = gText;
	}

	// group for lollipop lines (lines should be drawn before the data point)
	var gLine = self.gLine;
	if (gLine === null)
	{
		gLine = svg.append("g").attr("class", "mut-dia-lollipop-lines");
		self.gLine = gLine;
	}

	// group for lollipop data points (points should be drawn later)
	var gData = self.gData;
	if (gData === null)
	{
		gData = svg.append("g").attr("class", "mut-dia-lollipop-points");
		self.gData = gData;
	}

	// draw lollipop lines and data points
	for (var i = 0; i < pileups.length; i++)
	{
		self.drawLollipop(gData,
				gLine,
				pileups[i],
				options,
				bounds,
				xScale,
				yScale);
	}

	// draw lollipop labels
	self.drawLollipopLabels(gText, pileups, options, xScale, yScale);
};

/**
 * Creates the main svg (graphical) component.
 *
 * @param container main container (div, etc.)
 * @param width     width of the svg area
 * @param height    height of the svg area
 * @return {object} svg component
 */
MutationDiagram.prototype.createSvg = function (container, width, height)
{
	var svg = container.append("svg");

	svg.attr('width', width);
	svg.attr('height', height);

	return svg;
};

// helper function to calculate major tick interval for the axis
/**
 * Calculates major tick interval for the given possible interval values,
 * maximum value on the axis, and the desired maximum tick count.
 *
 * @param intervals     possible interval values
 * @param maxValue      highest value on the axis
 * @param maxTickCount  desired maximum tick count
 * @return {number}     interval value
 */
MutationDiagram.prototype.calcTickInterval = function(intervals, maxValue, maxTickCount)
{
	var interval = -1;

	for (var i=0; i < intervals.length; i++)
	{
		interval = intervals[i];
		var count = maxValue / interval;

		//if (Math.round(count) <= maxLabelCount)
		if (count < maxTickCount - 1)
		{
			break;
		}
	}

	return interval;
};

/**
 * Calculates all tick values for the given max and interval values.
 *
 * @param maxValue  maximum value for the axis
 * @param interval  interval (increment) value
 * @return {Array}  an array of all tick values
 */
MutationDiagram.prototype.getTickValues = function(maxValue, interval)
{
	// determine tick values
	var tickValues = [];
	var value = 0;

	while (value < maxValue)
	{
		tickValues.push(value);
		// use half interval value for generating minor ticks
		// TODO change back to full value when there is a fix for d3 minor ticks
		value += interval / 2;
	}

	// add the max value in any case
	tickValues.push(maxValue);

	return tickValues;
};

/**
 * Draws the x-axis on the bottom side of the plot area.
 *
 * @param svg       svg to append the axis
 * @param xScale    scale function for the y-axis
 * @param xMax      max y value for the axis
 * @param options   general options object
 * @param bounds    bounds of the plot area {width, height, x, y}
 *                  x, y is the actual position of the origin
 * @return {object} svg group containing all the axis components
 */
MutationDiagram.prototype.drawXAxis = function(svg, xScale, xMax, options, bounds)
{
	var self = this;

	var interval = self.calcTickInterval(options.xAxisTickIntervals,
		xMax,
		options.xAxisTicks);

	var tickValues = self.getTickValues(xMax, interval);

	// formatter to hide labels
	var formatter = function(value) {
//		var displayInterval = calcDisplayInterval(interval,
//			xMax,
//			options.xAxisMaxTickLabel);

		// always display max value
		if (value == xMax)
		{
			return value + " aa";
		}
		// do not display minor values
		// (this is custom implementation of minor ticks,
		// minor ticks don't work properly for custom values)
		else if (value % interval != 0)
		{
			return "";
		}
		// display major tick value if its not too close to the max value
		else if (xMax - value > interval / 3)
		{
			return value;
		}
		// hide remaining labels
		else
		{
			return "";
		}
	};

	var tickSize = options.xAxisTickSize;

	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.tickValues(tickValues)
		.tickFormat(formatter)
		//.tickSubdivide(true) TODO minor ticks have a problem with custom values
		.tickSize(tickSize, tickSize/2, 0);

	// calculate y-coordinate of the axis
	var position = bounds.y + options.regionHeight + options.xAxisPadding;

	// append axis
	var axis = svg.append("g")
		.attr("class", "mut-dia-x-axis")
		.attr("transform", "translate(0," + position + ")")
		.call(xAxis);

	// format axis
	self.formatAxis(".mut-dia-x-axis",
		options.xAxisStroke,
		options.xAxisFont,
		options.xAxisFontSize,
		options.xAxisFontColor);

	return axis;
};

/**
 * Draws the y-axis on the left side of the plot area.
 *
 * @param svg       svg to append the axis
 * @param yScale    scale function for the y-axis
 * @param yMax      max y value for the axis
 * @param options   general options object
 * @param bounds    bounds of the plot area {width, height, x, y}
 *                  x, y is the actual position of the origin
 * @return {object} svg group containing all the axis components
 */
MutationDiagram.prototype.drawYAxis = function(svg, yScale, yMax, options, bounds)
{
	var self = this;

	var interval = self.calcTickInterval(options.yAxisTickIntervals,
		yMax,
		options.yAxisTicks);

	// passing 2 * interval to avoid non-integer values
	// (this is also related to minor tick issue)
	var tickValues = self.getTickValues(yMax, 2 * interval);

	// formatter to hide all except first and last
	// also determines to put a '>' sign before the max value
	var formatter = function(value) {
		var formatted = '';

		if (value === yMax)
		{
			formatted = value;

			if (self.maxCount > yMax)
			{
				formatted = ">" + value;
			}
		}
		else if (value === 0)
		{
			formatted = value;
		}

		return formatted;
	};

	var tickSize = options.yAxisTickSize;

	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.tickValues(tickValues)
		.tickFormat(formatter)
		//.tickSubdivide(true) TODO minor ticks have a problem with custom values
		.tickSize(tickSize, tickSize/2, 0);

	// calculate y-coordinate of the axis
	var position = bounds.x - options.yAxisPadding;

	// append axis
	var axis = svg.append("g")
		.attr("class", "mut-dia-y-axis")
		.attr("transform", "translate(" + position + ",0)")
		.call(yAxis);

	// format axis
	self.formatAxis(".mut-dia-y-axis",
		options.yAxisStroke,
		options.yAxisFont,
		options.yAxisFontSize,
		options.yAxisFontColor);

	return axis;
};

/**
 * Draws the label of the y-axis.
 *
 * @param svg       svg to append the label element
 * @param options   general options object
 * @param bounds    bounds of the plot area {width, height, x, y}
 *                  x, y is the actual position of the origin
 * @return {object} text label (svg element)
 */
MutationDiagram.prototype.drawTopLabel = function(svg, options, bounds)
{
	// set x, y of the label as the middle of the top left margins
	var x = options.labelTopMargin;
	var y = options.marginTop / 2;

	// append label
	var label = svg.append("text")
		.attr("fill", options.labelTopFontColor)
		.attr("text-anchor", "start")
		.attr("x", x)
		.attr("y", y)
		.attr("class", "mut-dia-top-label")
		.style("font-family", options.labelTopFont)
		.style("font-size", options.labelTopFontSize)
		.style("font-weight", options.labelTopFontWeight)
		.text(options.labelTop);

	return label;
};

/**
 * Draws the label of the y-axis.
 *
 * @param svg       svg to append the label element
 * @param options   general options object
 * @param bounds    bounds of the plot area {width, height, x, y}
 *                  x, y is the actual position of the origin
 * @return {object} text label (svg element)
 */
MutationDiagram.prototype.drawYAxisLabel = function(svg, options, bounds)
{
	// set x, y of the label as the middle of the y-axis

	var x = bounds.x -
		options.yAxisPadding -
		options.yAxisTickSize -
		options.yAxisLabelPadding;

	var y =  bounds.y - (bounds.height / 2);

	// append label
	var label = svg.append("text")
		.attr("fill", options.labelYFontColor)
		.attr("text-anchor", "middle")
		.attr("x", x)
		.attr("y", y)
		.attr("class", "mut-dia-y-axis-label")
		.attr("transform", "rotate(270, " + x + "," + y +")")
		.style("font-family", options.labelYFont)
		.style("font-size", options.labelYFontSize)
		.style("font-weight", options.labelYFontWeight)
		.text(options.labelY);

	return label;
};

/**
 * Formats the style of the plot axis defined by the given selector.
 *
 * @param axisSelector  selector for the axis components
 * @param stroke        line color of the axis
 * @param font          font type of the axis value labels
 * @param fontSize      font size of the axis value labels
 * @param fontColor     font color of the axis value labels
 */
MutationDiagram.prototype.formatAxis = function(axisSelector, stroke, font, fontSize, fontColor)
{
	var selector = d3.selectAll(axisSelector + ' line');

	selector.style("fill", "none")
		.style("stroke", stroke)
		.style("shape-rendering", "crispEdges");

	selector = d3.selectAll(axisSelector + ' path');

	selector.style("fill", "none")
		.style("stroke", stroke)
		.style("shape-rendering", "crispEdges");

	selector = d3.selectAll(axisSelector + ' text');

	selector.attr("fill", fontColor)
		.style("font-family", font)
		.style("font-size", fontSize);
};

/**
 * Draws the lollipop data point and its line (from sequence to the lollipop top)
 * on the plot area.
 *
 * @param points    group (svg element) to append the lollipop data point
 * @param lines     line group (svg element) to append the lollipop lines
 * @param pileup    list (array) of mutations (pileup) at a specific location
 * @param options   general options object
 * @param bounds    bounds of the plot area {width, height, x, y}
 *                  x, y is the actual position of the origin
 * @param xScale    scale function for the x-axis
 * @param yScale    scale function for the y-axis
 * @return {object} lollipop data point & line as svg elements
 */
MutationDiagram.prototype.drawLollipop = function (points, lines, pileup, options, bounds, xScale, yScale)
{
	var self = this;

	// default data point type is circle
	var type = options.lollipopShapeRegular;

	var count = pileup.count;
	var start = pileup.location;

	var x = xScale(start);
	var y = yScale(count);

	// check if y-value (count) is out of the range
	if (count > options.maxLengthY)
	{
		// set a different shape for out-of-the-range values
		//type = "triangle-up";
		type = options.lollipopShapeSpecial;

		// set y to the max value
		y = yScale(options.maxLengthY);
	}

	var lollipopFillColor = self.getLollipopFillColor(options, pileup);
	self.updateColorMap(pileup, lollipopFillColor);

	var dataPoint = points.append('path')
		.attr('d', d3.svg.symbol().size(options.lollipopSize).type(type))
		.attr("transform", "translate(" + x + "," + y + ")")
		.attr('fill', lollipopFillColor)
		.attr('stroke', options.lollipopBorderColor)
		.attr('stroke-width', options.lollipopBorderWidth)
		.attr('id', pileup.pileupId)
		.attr('class', 'mut-dia-data-point')
		.attr('opacity', 0);

	// TODO add transition for y value to have a nicer effect
	self.fadeIn(dataPoint);

	// bind pileup data with the lollipop data point
	dataPoint.datum(pileup);

	var addTooltip = options.lollipopTipFn;
	addTooltip(dataPoint, pileup, options.showStats);

	var line = lines.append('line')
		.attr('x1', x)
		.attr('y1', y)
		.attr('x2', x)
		.attr('y2', self.calcSequenceBounds(bounds, options).y)
		.attr('stroke', options.lollipopStrokeColor)
		.attr('stroke-width', options.lollipopStrokeWidth)
		.attr('class', 'mut-dia-data-line')
		.attr('opacity', 0);

	// TODO add transition for y2 value to have a nicer effect
	self.fadeIn(line);

	return {"dataPoint": dataPoint, "line": line};
};

/**
 * Updates the mutation color map by adding a new entry for each mutation
 * in the given pile up.
 *
 * Mapped color of a mutation is NOT determined by its type, instead it is
 * determined by the color of the pileup. This is why we create a mapping
 * based on the pileup, otherwise a simple mapping (based on mutation type)
 * could be used.
 *
 * @param pileup    pileup of mutations
 * @param color     color of the given pileup
 */
MutationDiagram.prototype.updateColorMap = function(pileup, color)
{
	var self = this;

	// iterate all mutations in this pileup
	for (var i=0; i < pileup.mutations.length; i++)
	{
		// assign the same color to all mutations in this pileup
		self.mutationColorMap[pileup.mutations[i].get("mutationId")] = color;
	}
};

/**
 * Returns the shape (type) function to determine the shape of a
 * data point in the diagram. This implementation is required in order
 * to access "options" class member within the returned function.
 *
 * @return {Function}   shape function (for d3 symbol type)
 */
MutationDiagram.prototype.getLollipopShapeFn = function()
{
	var self = this;

	// actual function to use with d3.symbol.type(...)
	var shapeFunction = function(datum)
	{
		var type = self.options.lollipopShapeRegular;

		// set a different shape for out-of-the-range values
		if (datum.count > self.options.maxLengthY)
		{
			type = self.options.lollipopShapeSpecial;
		}

		return type;
	};

	return shapeFunction;
};

/**
 * Returns the fill color of the lollipop data point for the given pileup
 * of mutations.
 *
 * @param options   general options object
 * @param pileup    list (array) of mutations (pileup) at a specific location
 * @return {String} fill color
 */
MutationDiagram.prototype.getLollipopFillColor = function(options, pileup)
{
	var self = this;
	var color = options.lollipopFillColor;
	var value;

	if (_.isFunction(color))
	{
		value = color(pileup);
	}
	// check if the color is fixed
	else if (_.isString(color))
	{
		value = color;
	}
	// assuming color is an object
	else
	{
		var mutationsByMainType = PileupUtil.groupMutationsByMainType(pileup);

		// no main type for the given mutations (this should not happen)
		if (mutationsByMainType.length === 0)
		{
			// use default color
			value = color.default;
		}
		// color with the main type color
		else
		{
			// mutationsByMainType array is sorted by mutation count,
			// under tie condition certain types have priority over others
			value = color[mutationsByMainType[0].type];
		}
	}

	return value;
};

/**
 * Put labels over the lollipop data points. The number of labels to be displayed is defined
 * by options.lollipopLabelCount.
 *
 * @param labels        text group (svg element) for labels
 * @param pileups       array of mutations (pileups)
 * @param options       general options object
 * @param xScale        scale function for the x-axis
 * @param yScale        scale function for the y-axis
 */
MutationDiagram.prototype.drawLollipopLabels = function (labels, pileups, options, xScale, yScale)
{
	var self = this;

	// helper function to adjust text position to prevent overlapping with the y-axis
	var getTextAnchor = function(text, textAnchor)
	{
		var anchor = textAnchor;

		// adjust if necessary and (if it is set to auto only)
		if (anchor.toLowerCase() == "auto")
		{
			// calculate distance of the label to the y-axis (assuming the anchor will be "middle")
			var distance = text.attr("x") - (text.node().getComputedTextLength() / 2);

			// adjust label to prevent overlapping with the y-axis
			if (distance < options.marginLeft)
			{
				anchor = "start";
			}
			else
			{
				anchor = "middle";
			}
		}

		return anchor;
	};

	var count = options.lollipopLabelCount;
	var maxAllowedTie = 2; // TODO refactor as an option?

	// do not show any label if there are too many ties
	// exception: if there is only one mutation then display the label in any case
	if (pileups.length > 1)
	{
		var max = pileups[0].count;

		// at the end of this loop, numberOfTies will be the number of points with
		// max y-value (number of tied points)
		for (var numberOfTies = 0; numberOfTies < pileups.length; numberOfTies++)
		{
			if (pileups[numberOfTies].count < max)
			{
				break;
			}
		}

		// do not display any label if there are too many ties
		if (count < numberOfTies &&
		    numberOfTies > maxAllowedTie)
		{
			count = 0;
		}

	}

	// show (lollipopLabelCount) label(s)
	for (var i = 0;
	     i < count && i < pileups.length;
	     i++)
	{
		// check for threshold value
		if (pileups.length > 1 &&
		    pileups[i].count < options.lollipopLabelThreshold)
		{
			// do not processes remaining values below threshold
			// (assuming mutations array is sorted)
			break;
		}

		var x = xScale(pileups[i].location);
		var y = yScale(Math.min(pileups[i].count, options.maxLengthY)) -
		        (options.lollipopTextPadding);

		// init text
		var text = labels.append('text')
			.attr("fill", options.lollipopFontColor)
			.attr("x", x)
			.attr("y", y)
			.attr("class", "mut-dia-lollipop-text")
			.attr("transform", "rotate(" + options.lollipopTextAngle + ", " + x + "," + y +")")
			.style("font-size", options.lollipopFontSize)
			.style("font-family", options.lollipopFont)
			.text(pileups[i].label)
			.attr("opacity", 0);

		self.fadeIn(text);

		// adjust anchor
		var textAnchor = getTextAnchor(text, options.lollipopTextAnchor);
		text.attr("text-anchor", textAnchor);
	}
};

/**
 * Draws the given region on the sequence.
 *
 * @param svg       target svg to append region rectangle
 * @param region    region data
 * @param options   general options object
 * @param bounds    bounds of the plot area {width, height, x, y}
 *                  x, y is the actual position of the origin
 * @param xScale    scale function for the x-axis
 * @return {object} region rectangle & its text (as an svg group element)
 */
MutationDiagram.prototype.drawRegion = function(svg, region, options, bounds, xScale)
{
	var self = this;

	var start = region.metadata.start;
	var end = region.metadata.end;
	var label = region.text;
	var color = region.colour;

	var width = Math.abs(xScale(start) - xScale(end));
	var height = options.regionHeight;
	var y = bounds.y + options.seqPadding;
	var x = xScale(start);

	// group region and its label
	var group = svg.append("g")
		.attr("class", "mut-dia-region")
		.attr("transform", "translate(" + x + "," + y +")");

	var rect = group.append('rect')
		.attr('fill', color)
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', width)
		.attr('height', height);

	var addTooltip = options.regionTipFn;

	// add tooltip to the rect
	addTooltip(rect, region, self.dataProxies.mutationAlignerProxy);

	if (options.showRegionText)
	{
		var text = self.drawRegionText(label, group, options, width);

		// add tooltip if the text fits
		if (text)
		{
			// add tooltip to the text
			addTooltip(text, region, self.dataProxies.mutationAlignerProxy);
		}
	}

	return group;
};

/**
 * Draws the text for the given svg group (which represents the region).
 * Returns null if neither the text nor its truncated version fits
 * into the region rectangle.
 *
 * @param label     text contents
 * @param group     target svg group to append the text
 * @param options   general options object
 * @param width     width of the region rectangle
 * @return {object} region text (svg element)
 */
MutationDiagram.prototype.drawRegionText = function(label, group, options, width)
{
	var xText = width/2;
	var height = options.regionHeight;

	if (options.regionTextAnchor === "start")
	{
		xText = 0;
	}
	else if (options.regionTextAnchor === "end")
	{
		xText = width;
	}

	// truncate or hide label if it is too long to fit
	var fits = true;

	// init text
	var text = group.append('text')
		.style("font-size", options.regionFontSize)
		.style("font-family", options.regionFont)
		.text(label)
		.attr("text-anchor", options.regionTextAnchor)
		.attr("fill", options.regionFontColor)
		.attr("x", xText)
		.attr("y", 2*height/3)
		.attr("class", "mut-dia-region-text");

	// check if the text fits into the region rectangle
	// adjust it if necessary
	if (text.node().getComputedTextLength() > width)
	{
		// truncate text if not fits
		label = label.substring(0,3) + "..";
		text.text(label);

		// check if truncated version fits
		if (text.node().getComputedTextLength() > width)
		{
			// remove if the truncated version doesn't fit either
			text.remove();
			text = null;
		}
	}

	return text;
};

/**
 * Draws the sequence just below the plot area.
 *
 * @param svg       target svg to append sequence rectangle
 * @param options   general options object
 * @param bounds    bounds of the plot area {width, height, x, y}
 *                  x, y is the actual position of the origin
 * @return {object} sequence rectangle (svg element)
 */
MutationDiagram.prototype.drawSequence = function(svg, options, bounds)
{
	var seqBounds = this.calcSequenceBounds(bounds, options);

	return svg.append('rect')
		.attr('fill', options.seqFillColor)
		.attr('x', seqBounds.x)
		.attr('y', seqBounds.y)
		.attr('width', seqBounds.width)
		.attr('height', seqBounds.height)
		.attr('class', 'mut-dia-sequence');
};

/**
 * Returns the number of mutations at the hottest spot.
 *
 * @param pileups array of piled up mutation data
 * @return {Number} number of mutations at the hottest spot
 */
MutationDiagram.prototype.calcMaxCount = function(pileups)
{
	var maxCount = -1;
//
//	for (var i = 0; i < mutations.length; i++)
//	{
//		if (mutations[i].count >= maxCount)
//		{
//			maxCount = mutations[i].count;
//		}
//	}
//
//	return maxCount;

	// assuming the list is sorted (descending)
	if (pileups.length > 0)
	{
		maxCount = pileups[0].count;
	}

	return maxCount;
};

/**
 * Calculates the bounds of the sequence.
 *
 * @param bounds    bounds of the plot area
 * @param options   diagram options
 */
MutationDiagram.prototype.calcSequenceBounds = function (bounds, options)
{
	var x = bounds.x;
	var y = bounds.y +
	        Math.abs(options.regionHeight - options.seqHeight) / 2 +
	        options.seqPadding;
	var width = bounds.width;
	var height = options.seqHeight;

	return {x: x,
		y: y,
		width: width,
		height: height};
};

/**
 * Updates the plot area of the diagram for the given set of pileup data.
 * This function assumes that the provided mutation data is a subset
 * of the original data. Therefore this function only modifies the plot area
 * elements (lollipops, labels, etc.). If the provided data set is not a subset
 * of the original data, then the behavior of this function is unpredicted.
 *
 * If the number of mutations provided in pileupData is less than the number
 * mutation in the original data set, this function returns true to indicate
 * the provided data set is a subset of the original data. If the number of
 * mutations is the same, then returns false.
 *
 * @param mutationColl  a MutationCollection instance
 * @return {boolean}  true if the diagram is filtered, false otherwise
 */
MutationDiagram.prototype.updatePlot = function(mutationColl)
{
	var self = this;
	var pileups = self.pileups;

	// TODO for a safer update, verify the provided data
	var pileupData = [];

	// update current data & pileups
	if (mutationColl)
	{
		pileupData = PileupUtil.convertToPileups(mutationColl, self.options.pileupConverter);
		self.pileups = pileups = pileupData;
		self.mutationPileupMap = PileupUtil.mapToMutations(pileups);
	}

	// remove all elements in the plot area
	self.cleanPlotArea();

	// reset color mapping (for the new data we may have different pileup colors)
	self.mutationColorMap = {};

	if (self.options.yAxisAutoAdjust)
	{
		// rescale y-axis without updating the plot,
		// otherwise... infinite recursion!
		self.rescaleYAxis(true);
	}

	// re-draw plot area contents for new data
	self.drawPlot(self.svg,
	              pileups,
	              self.options,
	              self.bounds,
	              self.xScale,
	              self.yScale);

	// also re-add listeners
	//for (var selector in self.listeners)
	_.each(_.keys(self.listeners), function(selector) {
		var target = self.svg.selectAll(selector);

		//for (var event in self.listeners[selector])
		_.each(_.keys(self.listeners[selector]), function(event) {
			target.on(event,
				self.listeners[selector][event]);
		});
	});

	// reset highlight map
	self.highlighted = {};

	// trigger corresponding event
	self.dispatcher.trigger(
		MutationDetailsEvents.DIAGRAM_PLOT_UPDATED);

	return self.isFiltered();
};

/**
 * Removes all elements of the plot area.
 */
MutationDiagram.prototype.cleanPlotArea = function()
{
	var self = this;

	// select all plot area elements
	var labels = self.gLabel.selectAll("text");
	var lines = self.gLine.selectAll("line");
	var dataPoints = self.gData.selectAll(".mut-dia-data-point");

	// remove all plot elements (no animation)
//	labels.remove();
//	lines.remove();
//	dataPoints.remove();

	self.fadeOut(labels, function(element) {
		$(element).remove();
	});

	self.fadeOut(lines, function(element) {
		$(element).remove();
	});

	self.fadeOut(dataPoints, function(element) {
		$(element).remove();
	});

	// alternative animated version:
	// fade out and then remove all
//	labels.transition()
//		.style("opacity", 0)
//		.duration(1000)
//		.each("end", function() {
//			$(this).remove();
//		});
//
//	lines.transition()
//		.style("opacity", 0)
//		.duration(1000)
//		.each("end", function() {
//			$(this).remove();
//		});
//
//	points.transition()
//		.style("opacity", 0)
//		.duration(1000)
//		.each("end", function() {
//			$(this).remove();
//		});

	// for the alternative animated version
	// plot re-drawing should also be delayed to have a nicer effect
};

/**
 * Resets the plot area back to its initial state.
 */
MutationDiagram.prototype.resetPlot = function()
{
	var self = this;

	self.updatePlot(self.data.mutations);

	// trigger corresponding event
	self.dispatcher.trigger(
		MutationDetailsEvents.DIAGRAM_PLOT_RESET);
};

/**
 * Updates the text of the top label.
 *
 * @param text  new text to set as the label value
 */
MutationDiagram.prototype.updateTopLabel = function(text)
{
	var self = this;

	// if no text value is passed used gene symbol to update the value
	if (text == undefined || text == null)
	{
		text = "";
	}

	self.topLabel.text(text);
};

/**
 * Adds an event listener for specific diagram elements.
 *
 * @param selector  selector string for elements
 * @param event     name of the event
 * @param handler   event handler function
 */
MutationDiagram.prototype.addListener = function(selector, event, handler)
{
	var self = this;

	self.svg.selectAll(selector).on(event, handler);

	// save the listener for future reference
	if (self.listeners[selector] == null)
	{
		self.listeners[selector] = {};
	}

	self.listeners[selector][event] = handler;

};

/**
 * Removes an event listener for specific diagram elements.
 *
 * @param selector  selector string for elements
 * @param event     name of the event
 */
MutationDiagram.prototype.removeListener = function(selector, event)
{
	var self = this;

	self.svg.selectAll(selector).on(event, null);

	// remove listener from the map
	if (self.listeners[selector] &&
	    self.listeners[selector][event])
	{
		delete self.listeners[selector][event];
	}
};

MutationDiagram.prototype.addDefaultListeners = function()
{
	var self = this;

	// diagram background click
	self.addListener(".mut-dia-background", "click", function(datum, index) {
		// ignore the action (do not dispatch an event) if multi selection mode is on
		if (!self.multiSelect)
		{
			// remove all diagram highlights
			self.clearHighlights();

			// trigger corresponding event
			self.dispatcher.trigger(
				MutationDetailsEvents.ALL_LOLLIPOPS_DESELECTED);
		}
	});

	// lollipop circle click
	self.addListener(".mut-dia-data-point", "click", function(datum, index) {
		if (self.multiSelect)
		{
			// trigger corresponding event
			self.dispatcher.trigger(
				MutationDetailsEvents.LOLLIPOP_MULTI_SELECT,
				datum, index);
		}
		else
		{
			// trigger corresponding event
			self.dispatcher.trigger(
				MutationDetailsEvents.LOLLIPOP_SINGLE_SELECT,
				datum, index);
		}
	});

	// lollipop circle mouse out
	self.addListener(".mut-dia-data-point", "mouseout", function(datum, index) {
		// trigger corresponding event
		self.dispatcher.trigger(
			MutationDetailsEvents.LOLLIPOP_MOUSEOUT,
			datum, index);
	});

	// lollipop circle mouse over
	self.addListener(".mut-dia-data-point", "mouseover", function(datum, index) {
		// trigger corresponding event
		self.dispatcher.trigger(
			MutationDetailsEvents.LOLLIPOP_MOUSEOVER,
			datum, index);
	});

	// listener that prevents text selection
	// when multi selection is activated by the shift key
	var preventSelection = function (datum, index)
	{
		if (self.multiSelect)
		{
			// current event is stored under d3.event
			d3.event.preventDefault();
		}
	};

	self.addListener(".mut-dia-data-point", "mousedown", preventSelection);
	self.addListener(".mut-dia-background", "mousedown", preventSelection);

	// TODO listen to the key events only on the diagram (if possible)
	// ...it might be better to bind window key event handlers in a global util class

	$(window).on("keydown", function(event) {
		if (event.keyCode == self.options.multiSelectKeycode)
		{
			self.multiSelect = true;
		}
	});

	$(window).on("keyup", function(event) {
		if (event.keyCode == self.options.multiSelectKeycode)
		{
			self.multiSelect = false;
		}
	});
};

/**
 * Checks whether a diagram data point is highlighted or not.
 * If no selector provided, then checks if the there is
 * at least one highlighted data point.
 *
 * @param selector  [optional] selector for a specific data point element
 * @return {boolean} true if highlighted, false otherwise
 * @deprecated
 */
MutationDiagram.prototype.isHighlighted = function(selector)
{
	var self = this;
	var highlighted = false;

	if (selector == undefined)
	{
		highlighted = !(_.isEmpty(self.highlighted));
	}
	else
	{
		var element = d3.select(selector);
		var location = element.datum().location;

		if (self.highlighted[location] != undefined)
		{
			highlighted = true;
		}
	}

	return highlighted;
};

/**
 * Resets all highlighted data points back to their original state.
 */
MutationDiagram.prototype.clearHighlights = function()
{
	var self = this;
	var dataPoints = self.gData.selectAll(".mut-dia-data-point");

	self.resizeLollipop(dataPoints, self.options.lollipopSize);
	self.highlighted = {};
};

/**
 * Highlights the pileup containing the given mutation.
 *
 * @param mutationSid    id of the mutation
 */
MutationDiagram.prototype.highlightMutation = function(mutationSid)
{
	var self = this;

	var pileupId = self.mutationPileupMap[mutationSid];

	// there may not be a pileup corresponding to the given sid,
	// because not every mutation is mapped onto the diagram
	if (pileupId != null)
	{
		var pileup = self.svg.select("#" + pileupId);

		if (pileup.length > 0)
		{
			self.highlight(pileup[0][0]);
		}
	}
};

/**
 * Highlights a single data point. This function assumes that the provided
 * selector is a selector for one of the SVG data point elements on the
 * diagram.
 *
 * @param selector  selector for a specific data point element
 */
MutationDiagram.prototype.highlight = function(selector)
{
	var self = this;
	var element = d3.select(selector);

	// resize lollipop to the highlight size
	self.resizeLollipop(element, self.options.lollipopHighlightSize);

	// add data point to the map
	var location = element.datum().location;
	self.highlighted[location] = element;
};

/**
 * Removes highlight of a single data point. This function assumes that
 * the provided selector is a selector for one of the SVG data point
 * elements on the diagram.
 *
 * @param selector  selector for a specific data point element
 */
MutationDiagram.prototype.removeHighlight = function(selector)
{
	var self = this;
	var element = d3.select(selector);

	// resize lollipop to the regular size
	self.resizeLollipop(element, self.options.lollipopSize);

	// remove data point from the map
	var location = element.datum().location;
	delete self.highlighted[location];
};

MutationDiagram.prototype.resizeLollipop = function(lollipop, size)
{
	var self = this;

	lollipop.transition()
		.ease("elastic")
		.duration(self.options.animationDuration)
		// TODO see if it is possible to update ONLY size, not the whole 'd' attr
		.attr("d", d3.svg.symbol()
			.size(size)
			.type(self.getLollipopShapeFn()));
};

MutationDiagram.prototype.fadeIn = function(element, callback)
{
	var self = this;

	element.transition()
		.style("opacity", 1)
		.duration(self.options.fadeDuration)
		.each("end", function() {
			      if(_.isFunction(callback)) {
				      callback(this);
			      }
		      });
};

MutationDiagram.prototype.fadeOut = function(element, callback)
{
	var self = this;

	element.transition()
		.style("opacity", 0)
		.duration(self.options.fadeDuration)
		.each("end", function() {
			      if(_.isFunction(callback)) {
				      callback(this);
			      }
		      });
};

/**
 * Returns selected (highlighted) elements as a list of svg elements.
 *
 * @return {Array}  a list of SVG elements
 * @deprecated
 */
MutationDiagram.prototype.getSelectedElements = function()
{
	var self = this;

	return _.values(self.highlighted);
};

/**
 * Checks the diagram for filtering. If the current data set
 * is a subset of the initial data set, then it means
 * the diagram is filtered. If the current data set is the
 * initial data set, then the diagram is not filtered.
 *
 * @return {boolean} true if current view is filtered, false otherwise
 */
MutationDiagram.prototype.isFiltered = function()
{
	var self = this;
	var filtered = false;

	if (PileupUtil.countMutations(self.pileups) <
	    PileupUtil.countMutations(self.initialPileups))
	{
		filtered = true;
	}

	return filtered;
};

MutationDiagram.prototype.getThreshold = function()
{
	return Math.max(this.maxCount, this.options.minLengthY);
};

MutationDiagram.prototype.getMaxY = function()
{
	return this.yMax;
};

MutationDiagram.prototype.getInitialMaxY = function()
{
	var self = this;

	if (!self.initialYMax)
	{
		var maxCount = self.calcMaxCount(self.initialPileups);
		self.initialYMax = self.calcYMax(self.options, maxCount);
	}

	return self.initialYMax;
};

MutationDiagram.prototype.getMinY = function()
{
	return this.options.minLengthY;
};