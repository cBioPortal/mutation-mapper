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
 * Mol3DScriptGenerator class (extends MolScriptGenerator)
 *
 * Script generator for 3Dmol.js applications.
 *
 * @author Selcuk Onur Sumer
 */
function Mol3DScriptGenerator()
{
	// reference to the 3Dmol viewer.
	var _viewer = null;

	this.loadPdb = function(pdbId) {
		// clear current content
		_viewer.clear();

		// reload with the given pdbId
		$3Dmol.download("pdb:" + pdbId, _viewer, {doAssembly:true});

		return null;
	};

	this.setViewer = function(viewer) {
		_viewer = viewer;
	}
}

// JmolScriptGenerator extends MolScriptGenerator...
Mol3DScriptGenerator.prototype = new MolScriptGenerator();
Mol3DScriptGenerator.prototype.constructor = Mol3DScriptGenerator;

