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
 * This class is designed to retrieve PFAM data on demand.
 *
 * @param options  additional options
 *
 * @author Selcuk Onur Sumer
 */
function PfamDataProxy(options)
{
	// default options
	var _defaultOpts = {};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	// name of the PFAM data servlet
	var _servletName;

	// flag to indicate if the initialization is full or lazy
	var _fullInit;

	// map of <gene, data> pairs
	var _pfamDataCache = {};

	/**
	 * Initializes the proxy without actually grabbing anything from the server.
	 * Provided servlet name will be used later.
	 *
	 * @param servletName   name of the PFAM data servlet (used for AJAX query)
	 */
	function lazyInit(servletName)
	{
		_servletName = servletName;
		_fullInit = false;
	}

	/**
	 * Initializes with full PFAM data. Once initialized with full data,
	 * this proxy class assumes that there will be no additional data.
	 *
	 * @param pfamData  full PFAM data
	 */
	function fullInit(pfamData)
	{
		//assuming the given data is a map of <gene, sequence data> pairs
		_pfamDataCache = pfamData;

		_fullInit = true;
	}

	function getPfamData(servletParams, callback)
	{
		// TODO allow more than one gene at a time? (see MutationDataProxy)
		var gene = servletParams.geneSymbol;

		if (gene == null)
		{
			// no gene symbol provided, nothing to retrieve
			callback(null);
			return;
		}

		// retrieve data from the server if not cached
		if (_pfamDataCache[gene] == undefined)
		{
			if (_fullInit)
			{
				callback(null);
				return;
			}

			// process & cache the raw data
			var processData = function(data) {
				_pfamDataCache[gene] = data;

				// forward the processed data to the provided callback function
				callback(data);
			};

			// retrieve data from the servlet
			$.getJSON(_servletName,
			          servletParams,
			          processData);
		}
		else
		{
			// data is already cached, just forward it
			callback(_pfamDataCache[gene]);
		}
	}

	return {
		initWithData: fullInit,
		initWithoutData: lazyInit,
		getPfamData: getPfamData
	};
}
