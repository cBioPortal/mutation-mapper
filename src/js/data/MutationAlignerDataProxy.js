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
 * This class is designed to retrieve Mutation Aligner data on demand.
 *
 * @param options  additional options
 *
 * @author Selcuk Onur Sumer
 */
function MutationAlignerDataProxy(options)
{
	var self = this;

	// default options
	var _defaultOpts = {
		servletName: "getMutationAligner.json"
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	// call super constructor to init options and other params
	AbstractDataProxy.call(this, _options);
	_options = self._options;

	// map of <gene, data> pairs
	var _maDataCache = {};

	/**
	 * Initializes with full PFAM data. Once initialized with full data,
	 * this proxy class assumes that there will be no additional data.
	 *
	 * @param options   data proxy options
	 */
	function fullInit(options)
	{
		//assuming the given data is a map of <gene, sequence data> pairs
		_maDataCache = options.data;
	}

	function getMutationAlignerData(servletParams, callback)
	{
		// TODO allow more than one accession at a time? (see MutationDataProxy)
		var pfamAccession = servletParams.pfamAccession;

		if (pfamAccession == null)
		{
			// no gene symbol provided, nothing to retrieve
			callback(null);
			return;
		}

		// retrieve data from the server if not cached
		if (_maDataCache[pfamAccession] == undefined)
		{
			if (self.isFullInit())
			{
				callback(null);
				return;
			}

			// process & cache the raw data
			var processData = function(data) {
				_maDataCache[pfamAccession] = data;

				// forward the processed data to the provided callback function
				callback(data);
			};

			// retrieve data from the servlet
			$.getJSON(_options.servletName,
			          servletParams,
			          processData);
		}
		else
		{
			// data is already cached, just forward it
			callback(_maDataCache[pfamAccession]);
		}
	}

	// override required base functions
	self.fullInit = fullInit;

	// class specific functions
	self.getMutationAlignerData = getMutationAlignerData;
}

// MutationAlignerDataProxy extends AbstractDataProxy...
MutationAlignerDataProxy.prototype = new AbstractDataProxy();
MutationAlignerDataProxy.prototype.constructor = MutationAlignerDataProxy;
