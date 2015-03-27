/**
 * This class is designed to retrieve PFAM data on demand.
 *
 * @param options  additional options
 *
 * @author Selcuk Onur Sumer
 */
function PfamDataProxy(options)
{
	var self = this;

	// default options
	var _defaultOpts = {
		servletName: "getPfamSequence.json"
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	// call super constructor to init options and other params
	AbstractDataProxy.call(this, _options);
	_options = self._options;

	// map of <gene, data> pairs
	var _pfamDataCache = {};

	/**
	 * Initializes with full PFAM data. Once initialized with full data,
	 * this proxy class assumes that there will be no additional data.
	 *
	 * @param options   data proxy options
	 */
	function fullInit(options)
	{
		//assuming the given data is a map of <gene, sequence data> pairs
		_pfamDataCache = options.data;;
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
			if (self.isFullInit())
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
			$.getJSON(_options.servletName,
			          servletParams,
			          processData);
		}
		else
		{
			// data is already cached, just forward it
			callback(_pfamDataCache[gene]);
		}
	}

	// override required base functions
	self.fullInit = fullInit;

	// class specific functions
	self.getPfamData = getPfamData;
}

// PdbDataProxy extends AbstractDataProxy...
PfamDataProxy.prototype = new AbstractDataProxy();
PfamDataProxy.prototype.constructor = PfamDataProxy;