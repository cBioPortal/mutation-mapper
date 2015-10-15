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

	// latest selection
	var _selected = null;

	// latest style
	var _style = null;

	// latest color
	var _color = null;

	var _styleSpecs = {
		ballAndStick: {stick: {}, sphere: {scale: 0.25}},
		spaceFilling: {sphere: {scale: 0.6}},
		ribbon: {},
		cartoon: {cartoon: {}},
		trace: {}
	};

	/**
	 * Loads the pdb file for the given pdb ID.
	 *
	 * @param pdbId     pdb ID to load
	 * @param callback  to be invoked after the model is loaded
	 * @returns {string}
	 */
	function loadPdb(pdbId, callback)
	{
		// clear current content
		_viewer.clear();

		// reload with the given pdbId
		$3Dmol.download("pdb:" + pdbId, _viewer, {doAssembly:true}, callback);
		return "$3Dmol";
	}

	function selectAll()
	{
		_selected = {};
		return "";
	}

	function setScheme(schemeName)
	{
		_style = _.extend({}, _styleSpecs[schemeName]);
		_viewer.setStyle(_selected, _style);
		return "";
	}

	function setColor(color)
	{
		// save the color selection
		_color = formatColor(color);

		// update current style with color information
		_.each(_style, function(ele) {
			ele.color = _color;
		});

		_viewer.setStyle(_selected, _style);
		return "";
	}

	function selectChain(chainId)
	{
		_selected = {chain: chainId};
		return "";
	}

	function selectAlphaHelix(chainId)
	{
		_selected = {chain: chainId, ss: "h"};
		return "";
	}

	function selectBetaSheet(chainId)
	{
		_selected = {chain: chainId, ss: "s"};
		return "";
	}

	/**
	 * Generates a position array for 3Dmol.js.
	 *
	 * @position object containing PDB position info
	 * @return {Array} residue code (rescode) array for 3Dmol.js
	 */
	function scriptPosition(position)
	{
		var residues = [];
		var start = parseInt(position.start.pdbPos);
		var end = parseInt(position.end.pdbPos);

		for (var i=start; i <= end; i++)
		{
			residues.push(i);
		}

		// TODO this may not be accurate if residues.length > 2

		if (position.start.insertion)
		{
			residues[0] += "^" + position.start.insertion;
		}

		if (residues.length > 1 &&
		    position.end.insertion)
		{
			residues[residues.length - 1] += "^" + position.end.insertion;
		}

		return residues;
	}

	function selectPositions(scriptPositions, chainId)
	{
		_selected = {rescode: scriptPositions, chain: chainId};
		return "";
	}

	function selectSideChains(scriptPositions, chainId)
	{
		// TODO determine side chain atoms!
		_selected = {
			rescode: scriptPositions,
			chain: chainId/*,
			atom: ["CA"]*/
		};
		return "";
	}

	/**
	 * Generates highlight script by using the converted highlight positions.
	 *
	 * @param scriptPositions   script positions
	 * @param color             highlight color
	 * @param options           visual style options
	 * @param chain             a PdbChainModel instance
	 * @return {Array} script lines as an array
	 */
	function highlightScript(scriptPositions, color, options, chain)
	{
		var self = this;
		var script = [""];

		// add highlight color
		self.selectPositions(scriptPositions, chain.chainId);
		self.setColor(color);

		var displaySideChain = options.displaySideChain != "none";

		// show/hide side chains
		self.generateSideChainScript(scriptPositions, displaySideChain, options, chain);

		return script;
	}

	function enableBallAndStick()
	{
		// extend current style with ball and stick
		var style = _.extend({}, _style, _styleSpecs.ballAndStick);
		// use the latest defined color
		// (this is not the best function to set the side chain color, it should be set
		// in a method like generateSideChainScript or generateVisualStyleScript)
		style.sphere.color = _color;
		style.stick.color = _color;
		// update style of the selection
		_viewer.setStyle(_selected, style);
		return "";
	}

	function disableBallAndStick()
	{
		// looks like this method is obsolete for 3Dmol.js
		//return "wireframe OFF; spacefill OFF;";
		return "";
	}

	function rainbowColor(chainId)
	{
		_selected = {chain: chainId};
		setColor("spectrum");
		return "";
	}

	function cpkColor(chainId)
	{
		_selected = {chain: chainId};

		_.each(_style, function(ele) {
			// remove previous single color
			delete ele.color;

			// add default color scheme
			ele.colors = $3Dmol.elementColors.defaultColors;
		});

		_viewer.setStyle(_selected, _style);
		return "";
	}

	function formatColor(color)
	{
		// this is for 3Dmol.js compatibility
		// (colors should start with an "0x" instead of "#")
		return color.replace("#", "0x");
	}

	function setViewer(viewer)
	{
		_viewer = viewer;
	}

	// class specific functions
	this.setViewer = setViewer;

	// override required functions
	this.loadPdb = loadPdb;
	this.selectAll = selectAll;
	this.setScheme = setScheme;
	this.setColor = setColor;
	this.selectChain = selectChain;
	this.selectAlphaHelix = selectAlphaHelix;
	this.selectBetaSheet = selectBetaSheet;
	this.scriptPosition = scriptPosition;
	this.selectPositions = selectPositions;
	this.selectSideChains = selectSideChains;
	this.highlightScript = highlightScript;
	this.rainbowColor = rainbowColor;
	this.cpkColor = cpkColor;
	this.enableBallAndStick = enableBallAndStick;
	this.disableBallAndStick = disableBallAndStick;
}

// JmolScriptGenerator extends MolScriptGenerator...
Mol3DScriptGenerator.prototype = new MolScriptGenerator();
Mol3DScriptGenerator.prototype.constructor = Mol3DScriptGenerator;

