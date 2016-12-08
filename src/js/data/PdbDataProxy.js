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

var AbstractDataProxy = require("../data/AbstractDataProxy");
var PdbDataUtil = require("../util/PdbDataUtil");

var $ = require("jquery");
var jQuery = $;
var _ = require("underscore");

/**
 * This class is designed to retrieve PDB data on demand.
 *
 * @param options  additional options
 *
 * @author Selcuk Onur Sumer
 */
function PdbDataProxy(options)
{
	var self = this;

	// default options
	var _defaultOpts = {
		//servletName: "get3dPdb.json",
		servletName: "pdb_annotation",
		subService: {
			alignmentByPdb: "alignment/byPdb",
			alignmentByUniprot: "alignment/byUniprot",
			header: "header",
			map: "map",
			summary: "summary"
		},
		listJoiner: ",",
		mutationUtil: {} // an instance of MutationDetailsUtil class
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	// call super constructor to init options and other params
	AbstractDataProxy.call(this, _options);
	_options = self._options;

	var _util = _options.mutationUtil;

	// cache for PDB data:

	// map of <uniprot id, PdbCollection> pairs
	var _pdbDataCache = {};

	// map of <uniprot id, PdbChain[][]> pairs
	var _pdbRowDataCache = {};

	// map of <pdb id, pdb info> pairs
	var _pdbInfoCache = {};

	// map of <uniprot id, pdb data summary> pairs
	var _pdbDataSummaryCache = {};

	// map of <gene_pdbId_chainId, positionMap> pairs
	var _positionMapCache = {};

	/**
	 *
	 * @param options   data proxy options
	 */
	function fullInit(options)
	{
		var data = options.data;

		// process pdb data
		_.each(_.keys(data.pdbData), function(uniprotId) {
			var pdbColl = PdbDataUtil.processPdbData(data.pdbData[uniprotId]);
			_pdbDataCache[uniprotId] = pdbColl;
			_pdbRowDataCache[uniprotId] = PdbDataUtil.allocateChainRows(pdbColl);
		});

		// set info data
		_pdbInfoCache = data.infoData;

		// set summary data
		_pdbDataSummaryCache = data.summaryData;

		// process position data
//		_.each(_.keys(data.positionData), function(key) {
//			// TODO this is a bit tricky so let the user provide whole cache for now...
//		});

		// set position data
		_positionMapCache = data.positionData;
	}

	/**
	 * Retrieves the position map for the given gene and chain.
	 * Invokes the given callback function after retrieving the data.
	 *
	 * @param gene          hugo gene symbol
	 * @param chain         a PdbChainModel instance
	 * @param callbackFn    function to be invoked after data retrieval
	 */
	function getPositionMap(gene, chain, callbackFn)
	{
		// collection of alignments (PdbAlignmentCollection)
		var alignments = chain.alignments;
		var cacheKey = generatePositionMapCacheKey(gene, chain);

		// do not retrieve data if it is already there
		if (self.isFullInit() || _positionMapCache[cacheKey] != null)
		{
			callbackFn(_positionMapCache[cacheKey] || {});
			return;
		}

		// get protein positions for current mutations
		var positions = _util.getProteinPositions(gene);

		// populate position data array
		// first create as an object (map),
		// then convert to an array to avoid duplicate positions
		var positionObj = {};

		// only add positions which fall between chain start & end positions
		_.each(positions, function(ele, i) {
			if (ele.start > -1 &&
			    ele.start >= chain.mergedAlignment.uniprotFrom &&
			    ele.start <= chain.mergedAlignment.uniprotTo)
			{
				positionObj[ele.start] = ele.start;
			}

			if (ele.end > ele.start &&
			    ele.end >= chain.mergedAlignment.uniprotFrom &&
			    ele.end <= chain.mergedAlignment.uniprotTo)
			{
				positionObj[ele.end] = ele.end;
			}
		});

		// convert object to array
		var positionData = _.values(positionObj);

		// populate alignment data array
		var alignmentData = [];

		alignments.each(function(ele, i) {
			alignmentData.push(ele.alignmentId);
		});

		// callback function for the AJAX call
		var processData = function(data) {
			var positionMap = {};
			var mutations = _util.getMutationGeneMap()[gene];

			// this is to be compatible with both old and the new services...
			var positionData = data.positionMap || data;

			if (positionData != null &&
			    _.size(positionData) > 0)
			{
				// re-map mutation ids with positions by using the raw position map
				for(var i=0; i < mutations.length; i++)
				{
					var start = positionData[mutations[i].getProteinStartPos()];

					// TODO if the data is an array pick the longest one...
					if (_.isArray(start) && _.size(start) > 0)
					{
						start = start[0];
					}

					var end = start;

					var type = mutations[i].get("mutationType");

					// ignore end position for mutation other than in frame del
					if (type != null &&
						type.toLowerCase() === "in_frame_del")
					{
						end = positionData[mutations[i].get("proteinPosEnd")] || end;

						// TODO if array pick the longest one...
						if (_.isArray(end) && _.size(end) > 0)
						{
							end = end[0];
						}
					}

					// if no start and end position found for this mutation,
					// then it means this mutation position is not in this chain
					if (start != null &&
					    end != null)
					{
						positionMap[mutations[i].get("mutationId")] =
							{start: start, end: end};
					}
				}
			}

			// cache the map
			if (cacheKey)
			{
				_positionMapCache[cacheKey] = positionMap;
				//console.log("%s", JSON.stringify(_positionMapCache));
			}

			// call the callback function with the updated position map
			callbackFn(positionMap);
		};

		// check if there are positions to map
		if (positionData.length > 0)
		{
			var url = _options.servletName;

			// this is to be compatible with both old and the new services...
			if (_options.subService && _options.subService.map)
			{
				url = url + "/" + _options.subService.map;
			}

			// get pdb data for the current mutations
			var ajaxOpts = {
				type: "POST",
				url: url,
				data: {
					positions: positionData.join(_options.listJoiner),
					alignments: alignmentData.join(_options.listJoiner)
				},
				success: processData,
				dataType: "json"
			};

			self.requestData(ajaxOpts);
		}
		// no position data: no need to query the server
		else
		{
			// just forward to callback with empty data
			callbackFn({});
		}
	}

	/**
	 * Generates a cache key for the position map
	 * by the given gene and chain information.
	 *
	 * @param gene  hugo gene symbol
	 * @param chain a PdbChainModel instance
	 * @returns {String} cache key as a string
	 */
	function generatePositionMapCacheKey(gene, chain)
	{
		var key = null;

		if (chain.alignments.length > 0)
		{
			// TODO make sure that the key is unique!
			key = gene + "_" + chain.alignments.at(0).pdbId + "_" + chain.chainId;
		}

		return key;
	}

	/**
	 * Retrieves the PDB data for the provided uniprot id. Passes
	 * the retrieved data as a parameter to the given callback function
	 * assuming that the callback function accepts a single parameter.
	 *
	 * @param uniprotId     uniprot id
	 * @param callback      callback function to be invoked
	 */
	function getPdbData(uniprotId, callback)
	{
		if (self.isFullInit())
		{
			callback(_pdbDataCache[uniprotId]);
			return;
		}

		// retrieve data from the server if not cached
		if (_pdbDataCache[uniprotId] == undefined)
		{
			// process & cache the raw data
			var processData = function(data) {
				var pdbColl = PdbDataUtil.processPdbData(data);
				_pdbDataCache[uniprotId] = pdbColl;

				// forward the processed data to the provided callback function
				callback(pdbColl);
			};

			var url = _options.servletName;

			if (_options.subService &&
			    _options.subService.alignmentByUniprot)
			{
				url = url + "/" + _options.subService.alignmentByUniprot;
			}

			//retrieve data from the servlet
			var ajaxOpts = {
				type: "POST",
				url: url,
				data: {uniprotId: uniprotId, uniprotIds: uniprotId},
				success: processData,
				dataType: "json"
			};

			self.requestData(ajaxOpts);
		}
		else
		{
			// data is already cached, just forward it
			callback(_pdbDataCache[uniprotId]);
		}
	}

	/**
	 * Retrieves the PDB data for the provided uniprot id, and creates
	 * a 2D-array of pdb chains ranked by length and other criteria.
	 *
	 * Forwards the processed data to the given callback function
	 * assuming that the callback function accepts a single parameter.
	 *
	 * @param uniprotId     uniprot id
	 * @param callback      callback function to be invoked
	 */
	function getPdbRowData(uniprotId, callback)
	{
		// retrieve data if not cached yet
		if (!self.isFullInit() &&
		    _pdbRowDataCache[uniprotId] == undefined)
		{
			getPdbData(uniprotId, function(pdbColl) {
				// get the data & cache
				var rowData = PdbDataUtil.allocateChainRows(pdbColl);
				_pdbRowDataCache[uniprotId] = rowData;

				// forward to the callback
				callback(rowData);
			});
		}
		else
		{
			// data is already cached, just forward it
			callback(_pdbRowDataCache[uniprotId]);
		}
	}

	/**
	 * Retrieves the PDB data summary for the provided uniprot id. Passes
	 * the retrieved data as a parameter to the given callback function
	 * assuming that the callback function accepts a single parameter.
	 *
	 * @param uniprotId     uniprot id
	 * @param callback      callback function to be invoked
	 */
	function getPdbDataSummary(uniprotId, callback)
	{
		// retrieve data from the server if not cached
		if (!self.isFullInit() &&
			_pdbDataSummaryCache[uniprotId] == undefined)
		{
			// process & cache the raw data
			var processData = function(data) {
				var summaryData = data;

				if (_.isArray(summaryData) &&
				    _.size(summaryData) > 0)
				{
					summaryData = summaryData[0];
				}

				_pdbDataSummaryCache[uniprotId] = summaryData;

				// forward the processed data to the provided callback function
				callback(summaryData);
			};

			var url = _options.servletName;

			if (_options.subService &&
			    _options.subService.summary)
			{
				url = url + "/" + _options.subService.summary;
			}

			// retrieve data from the servlet
			var ajaxOpts = {
				type: "POST",
				url: url,
				data: {
					uniprotId: uniprotId,
					uniprotIds: uniprotId,
					type: "summary"
				},
				success: processData,
				dataType: "json"
			};

			self.requestData(ajaxOpts);
		}
		else
		{
			// data is already cached, just forward it
			callback(_pdbDataSummaryCache[uniprotId]);
		}
	}

	/**
	 * Checks if there is structure (PDB) data available for the provided
	 * uniprot id. Passes a boolean parameter to the given callback function
	 * assuming that the callback function accepts a single parameter.
	 *
	 * @param uniprotId     uniprot id
	 * @param callback      callback function to be invoked
	 */
	function hasPdbData(uniprotId, callback)
	{
		var processData = function(data) {
			var hasData = data && (data.alignmentCount > 0);
			callback(hasData);
		};

		getPdbDataSummary(uniprotId, processData);
	}

	/**
	 * Retrieves the PDB information for the provided PDB id(s). Passes
	 * the retrieved data as a parameter to the given callback function
	 * assuming that the callback function accepts a single parameter.
	 *
	 * @param pdbIdList list of PDB ids as a white-space delimited string
	 * @param callback  callback function to be invoked
	 */
	function getPdbInfo(pdbIdList, callback)
	{
		var pdbIds = pdbIdList.trim().split(/\s+/);
		var pdbToQuery = [];

		// get previously grabbed data (if any)

		var pdbData = {};

		// process each pdb id in the given list
		_.each(pdbIds, function(pdbId, idx) {
			//pdbId = pdbId.toLowerCase();

			var data = _pdbInfoCache[pdbId];

			if (data == undefined ||
			    data.length == 0)
			{
				// data does not exist for this pdb, add it to the list
				pdbToQuery.push(pdbId);
			}
			else
			{
				// data is already cached for this pdb id, update the data object
				pdbData[pdbId] = data;
			}
		});

		if (self.isFullInit())
		{
			// no additional data to retrieve
			callback(pdbData);
			return;
		}

		var servletParams = {};

		// some (or all) data is missing,
		// send ajax request for missing ids
		if (pdbToQuery.length > 0)
		{
			// process & cache the raw data
			var processData = function(data) {
				var pdbInfoData = data;

				if (_.isArray(data))
				{
					pdbInfoData = _.indexBy(data, 'pdbId');
				}

				_.each(pdbIds, function(pdbId, idx) {
					if (pdbInfoData[pdbId] != null)
					{
						_pdbInfoCache[pdbId] = pdbInfoData[pdbId];

						// concat new data with already cached data
						pdbData[pdbId] = pdbInfoData[pdbId];
					}
				});

				// forward the final data to the callback function
				callback(pdbData);
			};

			// add pdbToQuery to the servlet params
			servletParams.pdbIds = pdbToQuery.join(_options.listJoiner);

			var url = _options.servletName;

			if (_options.subService &&
			    _options.subService.header)
			{
				url = url + "/" + _options.subService.header;
			}

			// retrieve data from the server
			var ajaxOpts = {
				type: "POST",
				url: url,
				data: servletParams,
				success: processData,
				dataType: "json"
			};

			self.requestData(ajaxOpts);
		}
		// data for all requested chains already cached
		else
		{
			// just forward the data to the callback function
			callback(pdbData);
		}
	}

	// override required base functions
	self.fullInit = fullInit;

	// class specific functions
	self.hasPdbData = hasPdbData;
	self.getPdbData = getPdbData;
	self.getPdbRowData = getPdbRowData;
	self.getPdbInfo = getPdbInfo;
	self.getPositionMap = getPositionMap;
}

// PdbDataProxy extends AbstractDataProxy...
PdbDataProxy.prototype = new AbstractDataProxy();
PdbDataProxy.prototype.constructor = PdbDataProxy;

module.exports = PdbDataProxy;