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
 * This file is part of cBioPortal.
 *
 * cBioPortal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @author Selcuk Onur Sumer
 */
function MutationData(options)
{
    var _self = this;
    var _dispatcher = {};

    var _data = {

    };

    var _defaultOpts = {

    };

    var _state = {
        highlighted: [],
        selected: [],
        filtered: []
    };

    // merge options with default options to use defaults for missing values
    var _options = jQuery.extend(true, {}, _defaultOpts, options);

    function updateData(data)
    {
        _data = jQuery.extend(true, {}, _data, data);
    }

    function setData(data)
    {
        _data = data;
        _state.filtered = data;
    }

    function getData()
    {
        return _data;
    }

    function getState()
    {
        return _state;
    }

    // TODO do not fire an event in case the state remains identical after an add/remove/update function call!

    function update(state, mutations, event)
    {
        // update the corresponding set with the given mutations
        // this overrides all the previous content!
        _state[state] = mutations;

        // trigger a custom event
        $(_dispatcher).trigger(event, _self);
    }

    function add(state, mutations, event)
    {
        // add given mutations to the corresponding set
        _state[state] = _.union(_state[state], mutations);

        // trigger a custom event
        $(_dispatcher).trigger(event, _self);
    }

    function remove(state, mutations, event)
    {
        if (mutations == null)
        {
            // reset all
            _state[state] = [];
        }
        else
        {
            // remove given mutations from the corresponding set
            _state[state] = _.difference(_state[state], mutations);
        }

        // trigger a custom event
        $(_dispatcher).trigger(event, _self);
    }

    function updateHighlightedMutations(mutations)
    {
        update("highlighted", mutations, MutationDetailsEvents.MUTATION_HIGHLIGHT);
    }

    function highlightMutations(mutations)
    {
        // add given mutations to the set of highlighted mutations
        add("highlighted", mutations, MutationDetailsEvents.MUTATION_HIGHLIGHT);
    }

    function unHighlightMutations(mutations)
    {
        // remove given mutations from the set of highlighted mutations
        remove("highlighted", mutations, MutationDetailsEvents.MUTATION_HIGHLIGHT);
    }

    function updateFilteredMutations(mutations)
    {
        update("filtered", mutations, MutationDetailsEvents.MUTATION_FILTER);
    }

    function filterMutations(mutations)
    {
        // add given mutations to the set of filtered mutations
        add("filtered", mutations, MutationDetailsEvents.MUTATION_FILTER);
    }

    function unfilterMutations(mutations)
    {
        if (mutations == null) {
            _state.filtered = _data;
            $(_dispatcher).trigger(MutationDetailsEvents.MUTATION_FILTER, _self);
        }
        else {
            // remove given mutations from the set of filtered mutations
            remove("filtered", mutations, MutationDetailsEvents.MUTATION_FILTER);
        }
    }

    function updateSelectedMutations(mutations)
    {
        update("selected", mutations, MutationDetailsEvents.MUTATION_SELECT);
    }

    function selectMutations(mutations)
    {
        // add given mutations to the set of selected mutations
        add("selected", mutations, MutationDetailsEvents.MUTATION_SELECT);
    }

    function unSelectMutations(mutations)
    {
        // remove given mutations from the set of selected mutations
        remove("selected", mutations, MutationDetailsEvents.MUTATION_SELECT);
    }

    this.updateData = updateData;
    this.setData = setData;
    this.getData = getData;
    this.getState = getState;
    this.updateHighlightedMutations = updateHighlightedMutations;
    this.highlightMutations = highlightMutations;
    this.unHighlightMutations = unHighlightMutations;
    this.updateFilteredMutations = updateFilteredMutations;
    this.filterMutations = filterMutations;
    this.unfilterMutations = unfilterMutations;
    this.updateSelectedMutations = updateSelectedMutations;
    this.selectMutations = selectMutations;
    this.unSelectMutations = unSelectMutations;
    this.dispatcher = _dispatcher;
}
