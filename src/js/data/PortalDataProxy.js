/**
 * This class is designed to retrieve cBio Portal specific data on demand.
 *
 * @author Selcuk Onur Sumer
 */
function PortalDataProxy()
{
	var _servletName;
	var _fullInit;

	var _data = {};

	/**
	 * Initializes the proxy without actually grabbing anything from the server.
	 * Provided servlet name will be used later.
	 *
	 * @param servletName   name of the portal data servlet (used for AJAX query)
	 */
	function lazyInit(servletName)
	{
		_servletName = servletName;
		_fullInit = false;
	}

	/**
	 * Initializes with full portal data. Once initialized with full data,
	 * this proxy class assumes that there will be no additional data.
	 *
	 * @param portalData  full portal data
	 */
	function fullInit(portalData)
	{
		//assuming the given data is a map of <gene, sequence data> pairs
		_data = portalData;

		_fullInit = true;
	}

	function getPortalData(servletParams, callback)
	{
		// TODO for each servlet param retrieve data (if not cached yet)
		var data = {};

		if(_.isFunction(callback))
		{
			callback(data);
		}
	}

	return {
		initWithData: fullInit,
		initWithoutData: lazyInit,
		getPortalData: getPortalData
	};
}
