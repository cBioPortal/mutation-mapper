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

/**
 * Controller class for the Main Mutation view.
 * Listens to the various events and make necessary changes
 * on the view wrt each event type.
 *
 * @param mainMutationView  a MainMutationView instance
 *
 * @author Selcuk Onur Sumer
 */
function MainMutationController(mainMutationView)
{
	var _mutationDiagram = null;

	function init()
	{
		// init reset link call back
		mainMutationView.addResetCallback(handleReset);

		var mutationDataDispatcher = $(mainMutationView.model.mutationData.dispatcher);

		mutationDataDispatcher.on(
			MutationDetailsEvents.MUTATION_FILTER,
			mutationFilterHandler
		);

		mutationDataDispatcher.on(
			MutationDetailsEvents.MUTATION_HIGHLIGHT,
			mutationHighlightHandler
		);

		mutationDataDispatcher.on(
			MutationDetailsEvents.MUTATION_SELECT,
			mutationSelectHandler
		);
	}

	function mutationSelectHandler(event, mutationData)
	{
		// get all selected elements
		var selected = mutationData.getState().selected;
		var filtered = mutationData.getState().filtered;
		var data = mutationData.getData();

		// if there are selected or filtered out mutations then show filter info
		if (!_.isEmpty(selected) ||
		    _.size(data) !== _.size(filtered))
		{
			mainMutationView.showFilterInfo();
		}
		// nothing selected, nothing filtered out, hide filter info
		else
		{
			mainMutationView.hideFilterInfo();
		}
	}

	function mutationHighlightHandler(event, mutationData)
	{
		// no need to handle for now, update if necessary
	}

	function mutationFilterHandler(event, mutationData)
	{
		mutationSelectHandler(event, mutationData);
	}

	function handleReset(event)
	{
		// TODO it might be better to call one function instead of three!
		mainMutationView.model.mutationData.unHighlightMutations();
		mainMutationView.model.mutationData.unSelectMutations();
		mainMutationView.model.mutationData.unfilterMutations();
	}

	init();
}
