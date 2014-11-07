/**
 * Singleton utility class for data proxy related tasks.
 *
 * @author Selcuk Onur Sumer
 */
var DataProxyUtil = (function()
{
	/**
	 * Initializes data proxy instances for the given options.
	 *
	 * @param options   data proxy options (for all proxies)
	 * @param mut3dVis [optional] 3D visualizer instance (only used to init pdb proxy)
	 */
	function initDataProxies(options, mut3dVis)
	{
		// init proxies
		var dataProxies = {};

		// workaround: alphabetically sorting to ensure that mutationProxy is
		// initialized before pdpProxy, since pdbProxy depends on the mutationProxy instance
		_.each(_.keys(options).sort(), function(proxy) {
			var proxyOpts = options[proxy];
			var instance = null;

			// TODO see if it is possible to remove pdb proxy's dependency on mutation proxy

			// special initialization required for mutation proxy
			// and pdb proxy, so a custom function is provided
			// as an additional parameter to the initDataProxy function
			if (proxy == "pdbProxy")
			{
				instance = initDataProxy(proxyOpts, function(proxyOpts) {
					var mutationProxy = dataProxies["mutationProxy"];

					if (mut3dVis != null &&
					    mutationProxy != null &&
					    mutationProxy.hasData())
					{
						proxyOpts.options.mutationUtil = mutationProxy.getMutationUtil();
						return true;
					}
					else
					{
						// do not initialize pdbProxy at all
						return false;
					}
				});
			}
			else
			{
				// regular init for all other proxies...
				instance = initDataProxy(proxyOpts);
			}

			dataProxies[proxy] = instance;
		});

		return dataProxies;
	}

	/**
	 *
	 * @param proxyOpts     data proxy options (for a single proxy)
	 * @param preProcessFn  [optional] pre processing function, should return a boolean value.
	 * @returns {Object}    a data proxy instance
	 */
	function initDataProxy(proxyOpts, preProcessFn)
	{
		// use the provided custom instance if available
		var instance = proxyOpts.instance;

		if (instance == null)
		{
			// custom pre process function for the proxy options
			// before initialization
			if (preProcessFn != null &&
			    _.isFunction(preProcessFn))
			{
				// if preprocess is not successful do not initialize
				if (!preProcessFn(proxyOpts))
				{
					return null;
				}
			}

			// init data proxy
			var Constructor = proxyOpts.instanceClass;
			instance = Constructor(proxyOpts.options);

			if (proxyOpts.lazy)
			{
				// init without data
				instance.initWithoutData(proxyOpts.servletName);
			}
			else
			{
				// init with full data
				instance.initWithData(proxyOpts.data);
			}
		}

		return instance;
	}

	return {
		initDataProxies: initDataProxies,
		initDataProxy: initDataProxy
	};
})();
