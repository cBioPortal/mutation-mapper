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
 * Controller class for the Mutation Diagram.
 * Listens to the various events and make necessary changes
 * on the view wrt each event type.
 *
 * @author Selcuk Onur Sumer
 */
function MutationDiagramController(mainMutationView)
{
	function init()
	{
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

	function mutationSelectHandler(event, params)
	{
		var mutationData = params.mutationData;

		if (mainMutationView.diagramView)
		{
			var diagram = mainMutationView.diagramView.mutationDiagram;
			var selected = mutationData.getState().selected;
			var highlighted = mutationData.getState().highlighted;

			// TODO do not clear highlights, just update the diff of current and prev selections!
			// We need the previous state of the mutation data to have a seamless visual transition
			diagram.clearHighlights();

			_.each(_.union(selected, highlighted), function(mutation) {
				diagram.highlightMutation(
					mutation.get("mutationSid"));
			});
		}
	}

	function mutationHighlightHandler(event, params)
	{
		mutationSelectHandler(event, params);
	}

	function mutationFilterHandler(event, params)
	{
		var mutationData = params.mutationData;

		if (mainMutationView.diagramView)
		{
			var filtered = mutationData.getState().filtered;

			mainMutationView.diagramView.mutationDiagram.updatePlot(
				MutationDataConverter.convertToCollection(filtered));
		}
	}

	init();
}
