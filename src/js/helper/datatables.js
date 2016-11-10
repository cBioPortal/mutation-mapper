/*
 * Modules such as datatables-tabletools and datatables-colvis require 'datatables' as a module,
 * but we actually have "datatables.net", so this module is designed as an alias to 'datatables'
 *
 * This module also makes sure that datatables pluging is properly registered
 * as a jQuery plugin, by passing the window and $
 *
 * @author Selcuk Onur Sumer
*/

var dt = require("datatables.net");
var $ = require("jquery");

// this is for external lib compatibility
if (dt) {
	dt(window, $);
}

module.exports = dt;