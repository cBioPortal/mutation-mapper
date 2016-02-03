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
 * Base class for data proxy instances.
 *
 * @author Selcuk Onur Sumer
 */
function AbstractDataProxy(options)
{
	var self = this;

	// default options
	self._defaultOpts = {
		initMode: "lazy", // "lazy" or "full"
		servletName: "",  // name of the servlet to retrieve the actual data (used for AJAX query)
		data: {}          // actual data, will be used only if it is a full init, i.e {initMode: "full"}
	};

	self._queryQueue = new RequestQueue({
		completeEvent: "dataProxyDataRetrievalComplete",
		newRequestEvent: "dataProxyNewQueryRequest"
	});

	// merge options with default options to use defaults for missing values
	self._options = jQuery.extend(true, {}, self._defaultOpts, options);

	/**
	 * Initializes the data proxy with respect to init mode.
	 */
	self.init = function()
	{
		self._queryQueue.init(function(options) {
			$.ajax(options);
		});

		if (self.isFullInit())
		{
			self.fullInit(self._options);
		}
		else
		{
			self.lazyInit(self._options);
		}
	};

	// TODO find an efficient way to avoid hitting the server more than once
	// for the exact same simultaneous query
	self.processQueue = function()
	{
		// get the first element from the queue
		var options = _.first(self._queryQueue);
		self._queryQueue = _.rest(self._queryQueue);

		// still elements in queue
		if (options)
		{
			self._queryInProgress = options;
			$.ajax(options);
		}
		// no more query to process
		else
		{
			self._queryInProgress = false;
		}
	};

	/**
	 * Initializes the proxy without actually grabbing anything from the server.
	 * Provided servlet name will be used later.
	 *
	 * @param options   data proxy options
	 */
	self.lazyInit = function(options)
	{
		// no default implementation, can be overridden by subclasses
	};

	/**
	 * Initializes with full data. Once initialized with full data,
	 * this proxy class assumes that there will be no additional data.
	 *
	 * @param options   data proxy options
	 */
	self.fullInit = function(options)
	{
		// method body should be overridden by subclasses
	};

	/**
	 * Checks if the initialization is full or lazy.
	 *
	 * @return {boolean} true if full init, false otherwise
	 */
	self.isFullInit = function()
	{
		return !(self._options.initMode.toLowerCase() === "lazy");
	};


	/**
	 * This function ensures that at most only one ajax request is
	 * sent from a particular DataProxy instance. This is to prevent
	 * too many simultaneous requests.
	 *
	 * @ajaxOptions jQuery ajax options
	 */
	self.requestData = function(ajaxOptions)
	{
		var complete = ajaxOptions.complete;

		var defaultOpts = {
			complete: function(request, status)
			{
				self._queryQueue.complete();

				if (_.isFunction(complete))
				{
					complete(request, status);
				}
			}
		};

		// extend options with default options
		var options = jQuery.extend(true, {}, ajaxOptions, defaultOpts);

		self._queryQueue.add(options);
	};
}
