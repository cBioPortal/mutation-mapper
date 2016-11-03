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

var _ = require("underscore");

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
	 */
	function initDataProxies(options)
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

					if (mutationProxy != null &&
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
			instance = new Constructor(proxyOpts.options);
			instance.init();
		}

		return instance;
	}

	return {
		initDataProxies: initDataProxies,
		initDataProxy: initDataProxy
	};
})();

module.exports = DataProxyUtil;