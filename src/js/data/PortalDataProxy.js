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
 * This class is designed to retrieve cBio Portal specific data on demand.
 *
 * @param options  additional options
 *
 * @author Selcuk Onur Sumer
 */
function PortalDataProxy(options)
{
	var self = this;

	// default options
	var _defaultOpts = {
		servletName: "portalMetadata.json"
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	// call super constructor to init options and other params
	AbstractDataProxy.call(this, _options);
	_options = self._options;

	// cache
	var _data = {};

	/**
	 * Initializes with full portal data. Once initialized with full data,
	 * this proxy class assumes that there will be no additional data.
	 *
	 * @param options   data proxy options
	 */
	function fullInit(options)
	{
		_data = options.data;
	}

	function getPortalData(servletParams, callback)
	{
		// for each servlet param, retrieve data (if not cached yet)
		var metadata = {};
		var queryParams = {};

		_.each(_.keys(servletParams), function(key, idx) {
			// not cached yet
			if (_data[key] == null)
			{
				// update query params
				queryParams[key] = servletParams[key];
			}
			// already cached
			else
			{
				// get data from cache
				metadata[key] = _data[key];
			}
		});

		var processData = function(data)
		{
			// update the cache
			_.each(_.keys(data), function(key, idx) {
				_data[key] = data[key];
			});

			// forward data to the callback function
			if(_.isFunction(callback))
			{
				callback(jQuery.extend(true, {}, metadata, data));
			}
		};

		// TODO full init...

		// everything is cached
		if (_.isEmpty(queryParams))
		{
			// just forward
			processData(metadata);
		}
		else
		{
			// retrieve data from the servlet
			$.getJSON(_options.servletName,
			          queryParams,
			          processData);
		}
	}

	// override required base functions
	self.fullInit = fullInit;

	// class specific functions
	self.getPortalData = getPortalData;
}

// PdbDataProxy extends AbstractDataProxy...
PortalDataProxy.prototype = new AbstractDataProxy();
PortalDataProxy.prototype.constructor = PortalDataProxy;
