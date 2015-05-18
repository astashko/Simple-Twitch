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
            {
            	kind: "moon.DataGridList",
        		fit: true,
        		name: "resultList",
        		minWidth: 320,
        		minHeight: 230,
            	components: [{
        			kind: "moon.GridListImageItem",
        			useSubCaption: true,
        			centered: false,
        			bindings: [
        			    {from: ".model.channel", to: ".caption", transform: function(val) { return val.display_name; }},
        			    {from: ".model.channel", to: ".subCaption", transform: function(val) { return val.status; }},
        			    {from: ".model.preview", to: ".source", transform: function(val) { return val.medium; }}
        			],
        			ontap: "imageOnTap"
        		}]
            }
        ],
    	headerComponents: [
    	    {kind: "moon.Spinner", content: "Loading...", name: "spinner"}
    	]}
	],
	create: function() {
		this.inherited(arguments);
		this.set("streams", new simpletwitch.TopDota2StreamsCollection());
		this.get("streams").loadStreams();
	},
	bindings: [
		{from: ".streams", to: ".$.resultList.collection"},
		{from: ".streams.isFetching", to: ".$.spinner.showing"}
	],
	imageOnTap: function(inSender, inEvent) {
		if (inEvent.model && inEvent.model.get("channel")) {
			this.doChannelSelected({channel: inEvent.model.get("channel")});
		}
	}
});