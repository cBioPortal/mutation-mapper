/*
 * Copyright (c) 2016 Memorial Sloan-Kettering Cancer Center.
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

var $ = require("jquery");
var jQuery = $;
var _ = require("underscore");
var Backbone = require("backbone");

/**
 * A simple queue implementation for serializing requests.
 *
 * @author Selcuk Onur Sumer
 */
function RequestQueue(options)
{
	var self = this;

	var _defaultOpts = {
		completeEvent: "requestQueueProcessComplete",
		newRequestEvent: "requestQueueNewRequest"
	};

	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	var _queryQueue = [];
	var _queryInProgress = false;
	var _dispatcher = {};
	_.extend(_dispatcher, Backbone.Events);

	/**
	 * Initializes the queue with the provided process function.
	 *
	 * @param processFn function to be invoked to process queue elements
	 */
	function init(processFn)
	{
		_dispatcher.on(_options.newRequestEvent, function() {
			// no query in progress, ready to consume
			if (!_queryInProgress)
			{
				processQueue(processFn);
			}
		});

		_dispatcher.on(_options.completeEvent, function() {
			processQueue(processFn);
		});
	}

	// TODO find an efficient way to avoid hitting the server more than once
	// for the exact same simultaneous query

	/**
	 * Processes the queue by invoking the given process function
	 * for the current element in the queue.
	 *
	 * @param processFn function to process the queue element
	 */
	function processQueue(processFn)
	{
		// get the first element from the queue
		var element = _.first(_queryQueue);
		_queryQueue = _.rest(_queryQueue);

		// still elements in queue
		if (element)
		{
			_queryInProgress = element;

			if (_.isFunction(processFn))
			{
				processFn(element);
			}
		}
		// no more query to process
		else
		{
			_queryInProgress = false;
		}
	}

	/**
	 * Function to be invoked upon completion of the process of a queue element.
	 */
	function complete()
	{
		_queryInProgress = false;
		_dispatcher.trigger(_options.completeEvent);
	}

	/**
	 * Adds a new element into the queue, and triggers a new request event.
	 *
	 * @param element   a new queue element
	 */
	function add(element)
	{
		_queryQueue.push(element);
		_dispatcher.trigger(_options.newRequestEvent);
	}

	self.add = add;
	self.complete = complete;
	self.init = init;
}

module.exports = RequestQueue;