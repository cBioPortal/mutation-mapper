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
 * Utility class to initialize the 3D mutation visualizer with Jmol (Java)
 * instance.
 *
 * Note: This class is assumed to have the same interface
 * (the same signature for all public functions) with the JSmolWrapper.
 *
 * @author Selcuk Onur Sumer
 */
function JmolWrapper(useJava)
{
	// Jmol applet reference
	var _applet = null;

	// wrapper, created by the Jmol lib -- html element
	var _wrapper = null;

	// default options (parameters required to init with the applet)
	var defaultOpts = initDefaultOpts(useJava);

	var _options = null;

	/**
	 * Initializes the visualizer.
	 *
	 * @param name      name of the application
	 * @param options   app options
	 */
	function init(name, options)
	{
		_options = jQuery.extend(true, {}, defaultOpts, options);

		// disable the Jmol tracker
		delete Jmol._tracker;

		// init applet
		_applet = Jmol.getApplet(name, _options);

		// update wrapper reference
		// TODO the wrapper id depends on the JMol implementation
		_wrapper = $("#" + name + "_appletinfotablediv");
		_wrapper.hide();
	}

	/**
	 * Updates the container of the visualizer object.
	 *
	 * @param container container selector
	 */
	function updateContainer(container)
	{
		// move visualizer into its new container
		if (_wrapper != null)
		{
			container.append(_wrapper);
			_wrapper.show();
		}
	}

	/**
	 * Runs the given command as a script on the 3D visualizer object.
	 *
	 * @param command   command to send
	 * @param callback  function to call after execution of the script
	 */
	function script(command, callback)
	{
		// run Jmol script
		Jmol.script(_applet, command);

		// call the callback function after script completed
		if(_.isFunction(callback))
		{
			callback();
		}
	}

	function initDefaultOpts(useJava)
	{
		if (useJava)
		{
			return {
				//defaultModel: "$dopamine",
				jarPath: "js/lib/jmol/",
				jarFile: "JmolAppletSigned.jar",
				disableJ2SLoadMonitor: true,
				disableInitialConsole: true
			};
		}
		else
		{
			return {
				use: "HTML5",
				j2sPath: "js/lib/jsmol/j2s",
				disableJ2SLoadMonitor: true,
				disableInitialConsole: true
			}
		}
	}

	return {
		init: init,
		updateContainer: updateContainer,
		script: script
	};
}
