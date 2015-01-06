/**
 * Singleton utility class to precompile & cache backbone templates.
 * Using precompiled templates increases rendering speed dramatically.
 *
 * @author Selcuk Onur Sumer
 */
var BackboneTemplateCache = (function () {
	var _cache = {};

	/**
	 * Compiles the template for the given template id
	 * by using underscore template function.
	 *
	 * @param templateId    html id of the template content
	 * @returns function    compiled template function
	 */
	function compileTemplate(templateId)
	{
		return _.template($("#" + templateId).html());
	}

	/**
	 * Gets the template function corresponding to the given template id.
	 *
	 * @param templateId    html id of the template content
	 * @returns function    template function
	 */
	function getTemplateFn(templateId)
	{
		// try to use the cached value first
		var templateFn = _cache[templateId];

		// compile if not compiled yet
		if (templateFn == null)
		{
			templateFn = compileTemplate(templateId);
			_cache[templateId] = templateFn;
		}

		return templateFn;
	}

	return {
		getTemplateFn: getTemplateFn
	};
})();
