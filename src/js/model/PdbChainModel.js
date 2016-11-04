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

var PdbAlignmentCollection = require("../model/PdbAlignmentCollection");

var Backbone = require("backbone");

/**
 * PDB Chain Model.
 *
 * @author Selcuk Onur Sumer
 */
var PdbChainModel = Backbone.Model.extend({
	initialize: function(attributes) {
		// chain id (A, B, C, X, etc.)
		this.chainId = attributes.chainId;
		//  map of (mutation id, pdb position) pairs
		this.positionMap = attributes.positionMap;
		// collection of PdbAlignmentModel instances
		this.alignments = new PdbAlignmentCollection(attributes.alignments);
		// summary of all alignments (merged alignments)
		this.mergedAlignment = attributes.mergedAlignment;
	}
});

module.exports = PdbChainModel;