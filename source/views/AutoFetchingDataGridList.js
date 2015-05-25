/* global enyo, simpletwitch */

enyo.kind({
    name: "simpletwitch.AutoFetchingDataGridList",
    kind: "moon.DataGridList",
    fit: true,
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
	}],
	/*bindings: [
		{from: ".$.collection", to: ".collection"}
	]*/
    create: function() {
        this.inherited(arguments);
        this.addListener("paging", "onPaging", this);
        this.createComponent({
            name: "collection",
			kind: this.collectionKind
		}, { owner: this });
		this.set("collection", this.$.collection);
		this.get("collection").fetchNextItems();
        enyo.job("populateSource", enyo.bind(this, "loadFirstThreePages"), 3000);
    },
    loadFirstThreePages: function() {
        var requestedItemsCount = this.controlsPerPage * 3 - this.get("collection").length;
        if (requestedItemsCount > 0) {
            this.get("collection").fetchNextItems(requestedItemsCount);
        }
    },
    onPaging: function(list, event, opts) {
        if (opts.end >= this.get("collection").length - 1) {
            this.get("collection").fetchNextItems(this.controlsPerPage);
        }
    },
    modelsAdded: function() {
        this.inherited(arguments);
    }
});