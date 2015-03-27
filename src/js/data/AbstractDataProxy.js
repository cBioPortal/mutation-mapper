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

	// merge options with default options to use defaults for missing values
	self._options = jQuery.extend(true, {}, self._defaultOpts, options);

	/**
	 * Initializes the data proxy with respect to init mode.
	 */
	self.init = function()
	{
		if (self.isFullInit())
		{
			self.fullInit(self._options);
		}
		else
		{
			self.lazyInit(self._options);
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
}
