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
 * JmolScriptGenerator class (extends MolScriptGenerator)
 *
 * Script generator for Jmol/JSmol applications.
 *
 * @author Selcuk Onur Sumer
 */
function JmolScriptGenerator()
{
	// Predefined style scripts for Jmol
	var _styleScripts = {
		ballAndStick: "wireframe ONLY; wireframe 0.15; spacefill 20%;",
		spaceFilling: "spacefill ONLY; spacefill 100%;",
		ribbon: "ribbon ONLY;",
		cartoon: "cartoon ONLY;",
		trace: "trace ONLY;"
	};

	function loadPdb(pdbId)
	{
		return "load=" + pdbId + ";";
	}

	function selectAll()
	{
		return "select all;";
	}

	function selectNone()
	{
		return "select none;";
	}

	function setScheme(schemeName)
	{
		return _styleScripts[schemeName];
	}

	function setColor (color)
	{
		return "color [" + formatColor(color) + "];"
	}

	function selectChain(chainId)
	{
		return "select :" + chainId + ";";
	}

	function selectAlphaHelix(chainId)
	{
		return "select :" + chainId + " and helix;";
	}

	function selectBetaSheet(chainId)
	{
		return "select :" + chainId + " and sheet;";
	}

	function rainbowColor(chainId)
	{
		// min atom no within the selected chain
		var rangeMin = "@{{:" + chainId + "}.atomNo.min}";
		// max atom no within the selected chain
		var rangeMax = "@{{:" + chainId + "}.atomNo.max}";

		// max residue no within the selected chain
		//var rangeMin = "@{{:" + chain.chainId + "}.resNo.min}";
		// max residue no within the selected chain
		//var rangeMax = "@{{:" + chain.chainId + "}.resNo.max}";

		// color the chain by rainbow coloring scheme (gradient coloring)
		return 'color atoms property atomNo "roygb" ' +
			'range ' + rangeMin + ' ' + rangeMax + ';';
	}

	function cpkColor(chainId)
	{
		return "color atoms CPK;";
	}

	function hideBoundMolecules()
	{
		return "restrict protein;";
	}

	function setTransparency(transparency)
	{
		// TODO we should use the given transparency value...
		if (transparency > 0)
		{
			return "color translucent;";
		}
		else
		{
			return "color opaque;";
		}
	}

	/**
	 * Generates a position string for Jmol scripting.
	 *
	 * @position object containing PDB position info
	 * @return {string} position string for Jmol
	 */
	function scriptPosition(position)
	{
		var insertionStr = function(insertion) {
			var posStr = "";

			if (insertion != null &&
			    insertion.length > 0)
			{
				posStr += "^" + insertion;
			}

			return posStr;
		};

		var startPdbPos = position.start.pdbPos || position.start.pdbPosition;
		var endPdbPos = position.end.pdbPos || position.end.pdbPosition;

		var posStr = startPdbPos +
		             insertionStr(position.start.insertion);

		if (endPdbPos > startPdbPos)
		{
			posStr += "-" + endPdbPos +
			          insertionStr(position.end.insertion);
		}

		return posStr;
	}

	function selectPositions(scriptPositions, chainId)
	{
		return "select (" + scriptPositions.join(", ") + ") and :" + chainId + ";";
	}

	function selectSideChains(scriptPositions, chainId)
	{
		return "select ((" + scriptPositions.join(", ") + ") and :" + chainId + " and sidechain) or " +
		"((" + scriptPositions.join(", ") + ") and :" + chainId + " and *.CA);"
	}

	function enableBallAndStick()
	{
		return "wireframe 0.15; spacefill 25%;";
	}

	function disableBallAndStick()
	{
		return "wireframe OFF; spacefill OFF;";
	}

	function center(position, chainId)
	{
		var self = this;
		var scriptPos = self.scriptPosition(position);
		return "center " + scriptPos + ":" + chainId + ";"
	}

	function defaultCenter()
	{
		return "center;";
	}

	function zoom(zoomValue)
	{
		// center and zoom to the selection
		return "zoom " + zoomValue + ";";
	}

	function defaultZoomIn()
	{
		return "zoom in;"
	}

	function defaultZoomOut()
	{
		return "zoom out;"
	}

	function spin(value)
	{
		return "spin " + value + ";";
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
		var script = [];

		// add highlight color
		// "select (" + scriptPositions.join(", ") + ") and :" + chain.chainId + ";"
		script.push(self.selectPositions(scriptPositions, chain.chainId));
		script.push(self.setColor(color));

		var displaySideChain = options.displaySideChain != "none";

		// show/hide side chains
		script = script.concat(
			self.generateSideChainScript(scriptPositions, displaySideChain, options, chain));

		return script;
	}

	function formatColor(color)
	{
		// this is for Jmol compatibility
		// (colors should start with an "x" instead of "#")
		return color.replace("#", "x");
	}

	// override required functions
	this.loadPdb = loadPdb;
	this.selectAll = selectAll;
	this.selectNone = selectNone;
	this.setScheme = setScheme;
	this.setColor = setColor;
	this.selectChain = selectChain;
	this.selectAlphaHelix = selectAlphaHelix;
	this.selectBetaSheet = selectBetaSheet;
	this.rainbowColor = rainbowColor;
	this.cpkColor = cpkColor;
	this.hideBoundMolecules = hideBoundMolecules;
	this.setTransparency = setTransparency;
	this.scriptPosition = scriptPosition;
	this.selectPositions = selectPositions;
	this.selectSideChains = selectSideChains;
	this.enableBallAndStick = enableBallAndStick;
	this.disableBallAndStick = disableBallAndStick;
	this.highlightScript = highlightScript;
	this.center = center;
	this.defaultZoomIn = defaultZoomIn;
	this.defaultZoomOut = defaultZoomOut;
	this.defaultCenter = defaultCenter;
	this.spin = spin;
}

// JmolScriptGenerator extends MolScriptGenerator...
JmolScriptGenerator.prototype = new MolScriptGenerator();
JmolScriptGenerator.prototype.constructor = JmolScriptGenerator;
