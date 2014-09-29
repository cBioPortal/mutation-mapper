/**
* This view will add new columns to the mutation stats table
* model: { cancerType: "", count: 0 }
*/
var LollipopTipStatsView = Backbone.View.extend({
	initialize: function()
	{

	},
    render: function()
    {
        var templateFn = BackboneTemplateCache.getTemplateFn("mutation_details_lollipop_tip_stats_template");
        var thatEl = this.$el.find("table tbody");
        _.each(this.model, function(statItem) {
            thatEl.append(templateFn(statItem));
        });
        return this;
    }
});
