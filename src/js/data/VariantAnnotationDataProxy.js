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

/**
 * This class is designed to retrieve annotation data on demand,
 * but it can be also initialized with the full annotation data.
 *
 * @param options  proxy options
 *
 * @author Selcuk Onur Sumer
 */
function VariantAnnotationDataProxy(options)
{
	var self = this;

	// map of <variant, data> pairs
	var _annotationDataCache = {};

	// default options
	var _defaultOpts = {
		servletName: "variant_annotation/hgvs"
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	// call super constructor to init options and other params
	AbstractDataProxy.call(this, _options);
	_options = self._options;

	/**
	 * Initializes with full annotation data. Once initialized with full data,
	 * this proxy class assumes that there will be no additional data.
	 *
	 * @param options   data proxy options
	 */
	function fullInit(options)
	{
		//assuming the given data is a map of <variant, annotation data> pairs
		_annotationDataCache = options.data;
	}

	/**
	 * Returns the mutation data for the given gene(s).
	 *
	 * @param variantList  list of variants as a comma separated string
	 * @param callback  callback function to be invoked after retrieval
	 */
	function getAnnotationData(variantList, callback)
	{
		var variants = variantList.trim().split(",");
		var variantsToQuery = [];

		// get previously grabbed data (if any)
		var annotationData = [];

		// process each variant in the given list
		_.each(variants, function(variant, idx) {
			// variant annotator is case sensitive!
			//variant = variant.toUpperCase();

			var data = _annotationDataCache[variant];

			if (data == undefined || _.isEmpty(data))
			{
				// annotation data does not exist for this variant, add it to the list
				variantsToQuery.push(variant);
			}
			else
			{
				// data is already cached for this variant, update the data array
				annotationData = annotationData.concat(data);
			}
		});

		// all data is already retrieved (full init)
		if (self.isFullInit())
		{
			// just forward the call the callback function
			callback(annotationData);
		}
		// we need to retrieve missing data (lazy init)
		else
		{
			var process = function(data) {
				// cache data (assuming data is an array)
				_.each(data, function(variant, idx) {
					if (_.isString(variant.annotationJSON))
					{
						// assuming it is a JSON string
						var annotation = JSON.parse(variant.annotationJSON);

						if (_.isArray(annotation) &&
						    annotation.length > 0)
						{
							annotation = annotation[0];
						}

						variant.annotationJSON = annotation;
					}

					if (variant.annotationJSON.id)
					{
						_annotationDataCache[variant.annotationJSON.id] = variant;
					}
				});

				// concat new data with already cached data,
				// and forward it to the callback function
				annotationData = annotationData.concat(data);
				callback(annotationData);
			};

			// some (or all) data is missing,
			// send ajax request for missing genes
			if (variantsToQuery.length > 0)
			{
				var variantsData = variantsToQuery.join(",");
				// retrieve data from the server
				//$.post(_options.servletName, servletParams, process, "json");
				var ajaxOpts = {
					type: "POST",
					url: _options.servletName,
					data: variantsData,
					success: process,
					error: function() {
						console.log("[VariantDataProxy.getAnnotationData] " +
						            "error retrieving annotation data for variants: " +
						            variantsData);
						process([]);
					},
					//processData: false,
					contentType: false,
					dataType: "json"
				};

				self.requestData(ajaxOpts);
			}
			// data for all requested genes already cached
			else
			{
				// just forward the data to the callback function
				callback(annotationData);
			}
		}
	}

	// override required base functions
	self.fullInit = fullInit;

	// class specific functions
	self.getAnnotationData = getAnnotationData;
}

// VariantAnnotationDataProxy extends AbstractDataProxy...
VariantAnnotationDataProxy.prototype = new AbstractDataProxy();
VariantAnnotationDataProxy.prototype.constructor = VariantAnnotationDataProxy;
