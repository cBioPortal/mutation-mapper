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
 * This class is designed to retrieve cBio Portal specific data on demand.
 *
 * @param options  additional options
 *
 * @author Selcuk Onur Sumer
 */
function ClinicalDataProxy(options)
{
	var self = this;

	// default options
	var _defaultOpts = {
		servletName: "api/clinicaldata",
		subService: {
			patients: "patients"
		}
	};

	// merge options with default options to use defaults for missing values
	var _options = jQuery.extend(true, {}, _defaultOpts, options);

	// call super constructor to init options and other params
	AbstractDataProxy.call(this, _options);
	_options = self._options;

	// cache
	var _data = {};

	/**
	 * Initializes with full data. Once initialized with full data,
	 * this proxy class assumes that there will be no additional data.
	 *
	 * @param options   data proxy options
	 */
	function fullInit(options)
	{
		_data = options.data;
	}

	function getPatientData(samples, callback)
	{
		// TODO full init & cache...

		var cancerStudyId;
		var patientSampleMap = {};
		var patientIds = [];
		var querySession = null;

		// TODO we need to find a better way to plug PortalGlobals into MutationMapper!
		// workaround: since PortalGlobals is actually live in cBioPortal
		// we need to make sure that it doesn't break the standalone MutationMapper instances
		try {
			querySession = window.QuerySession;
		} catch (e) {
			// undefined reference: QuerySession
		}

		if (querySession) {
			cancerStudyId = querySession.cancer_study_ids[0];
			querySession.getPatientSampleIdMap().then(function (patientSampleMap){
                for (var i = 0; i < samples.length; i++) {
                    patientIds.push(patientSampleMap[samples[i]]);
                }
                makePatientData();
            });
		}
		else {
			cancerStudyId = window.cancer_study_id;
            makePatientData();
		}
        function makePatientData() {
            // no cancer study id or patient information...
		    if (!cancerStudyId || _.size(patientIds) === 0)
		    {
			    callback(null);
			    return;
		    }

		    var args = {study_id:cancerStudyId, attribute_ids:["12_245_PARTC_CONSENTED"], patient_ids:patientIds};
		    var arg_strings = [];
		    for (var k in args) {
			    if (args.hasOwnProperty(k)) {
			        arg_strings.push(k + '=' + [].concat(args[k]).join(","));
			    }
		    }

		    var arg_string = arg_strings.join("&") || "?";

		    var ajaxOpts = {
			    type: "POST",
			    url: _options.servletName + "/" + _options.subService.patients,
			    data: arg_string,
			    dataType: "json",
			    success: function(data) {
				    callback(data);
			    },
			    error: function(data) {
				    callback(null);
			    }
		    };

		    self.requestData(ajaxOpts);
                                        
        };
	}

	// override required base functions
	self.fullInit = fullInit;

	// class specific functions
	self.getPatientData = getPatientData;
}

// PdbDataProxy extends AbstractDataProxy...
PortalDataProxy.prototype = new AbstractDataProxy();
PortalDataProxy.prototype.constructor = ClinicalDataProxy;
