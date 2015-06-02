/* global enyo, simpletwitch */

enyo.kind({
    name: "simpletwitch.AutoFetchingDataGridList",
    kind: "moon.DataGridList",
    fit: true,
    classes: "navigation-grid",
    bindings: [
        {from: ".$.collection", to: ".collection"}
    ], 
    create: function() {
        this.inherited(arguments);
        this.addListener("paging", "onPaging", this);
        this.createComponent({
            name: "collection",
			kind: this.collectionKind
		}, { owner: this });
    },
    initData: function() {
        this.loadInitialData();
    },
    loadInitialData: function() {
        this.get("collection").fetchNextItems();
        enyo.job("populateSource", enyo.bind(this, "loadFirstThreePages"), 3000);
    },
    clearData: function() {
        this.get("collection").destroyAll();
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

enyo.kind({
    name: "simpletwitch.AutoFetchingDataGridListImageItem",
    kind: "moon.GridListImageItem",
    centered: false,
    ontap: "itemSelected"
});