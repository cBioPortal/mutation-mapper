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
 * Constructor for MutationHistogram class.
 *
 * @param geneSymbol    hugo gene symbol
 * @param options       visual options object
 * @param data          collection of Mutation models (MutationCollection)
 * @constructor
 *
 * @author Selcuk Onur Sumer
 */
function MutationHistogram(geneSymbol, options, data)
{
	// call super constructor
	MutationDiagram.call(this, geneSymbol, options, data);
}

// this is for inheritance (MutationHistogram extends MutationDiagram)
MutationHistogram.prototype = new MutationDiagram();
MutationHistogram.prototype.constructor = MutationHistogram;

/**
 * Draws histogram bars on the plot area.
 *
 * @param svg       svg container for the diagram
 * @param pileups   array of mutations (pileups)
 * @param options   options object
 * @param bounds    bounds of the plot area {width, height, x, y}
 *                  x, y is the actual position of the origin
 * @param xScale    scale function for the x-axis
 * @param yScale    scale function for the y-axis
 * @override
 */
MutationHistogram.prototype.drawPlot = function(svg, pileups, options, bounds, xScale, yScale)
{
	// TODO draw multi color animated histogram lines
};