/* global enyo, simpletwitch */

enyo.kind({
	name: "simpletwitch.Navigation",
	kind: "moon.Panels",
	pattern: "alwaysviewing",
	classes: "enyo-fit",
	events: {
		onChannelSelected: ""
	},
	components: [
        {title: "Dota 2 top streams", collapsingHeader: true, classes: "moon-7h", components: [
            {name: "resultList", kind: "simpletwitch.DataGridList"}
        ],
    	headerComponents: [
    	    {kind: "moon.Spinner", content: "Loading...", name: "spinner"}
    	]}
	],
	bindings: [
		{from: ".$.resultList.collection.isFetching", to: ".$.spinner.showing"}
	],
	imageOnTap: function(inSender, inEvent) {
		if (inEvent.model && inEvent.model.get("channel")) {
			this.doChannelSelected({channel: inEvent.model.get("channel")});
		}
	}
});

enyo.kind({
    name: "simpletwitch.DataGridList",
    kind: "simpletwitch.AutoFetchingDataGridList",
    minWidth: 320,
    minHeight: 230,
    collectionKind: "simpletwitch.TopDota2StreamsCollection"
});