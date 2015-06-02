/* global enyo */

enyo.kind({
    name: "simpletwitch.StreamsDataGridList",
    kind: "simpletwitch.AutoFetchingDataGridList",
    events: {
        onChannelSelected: ""
    },
    minWidth: 487,
    minHeight: 364,
    collectionKind: "simpletwitch.StreamsCollection",
    components: [{
        kind: "simpletwitch.StreamsDataGridListImageItem"
    }],
    initData: function(data) {
        this.get("collection").set("game", data && data.get("name"));
        this.inherited(arguments);
    }
});

enyo.kind({
    name: "simpletwitch.StreamsDataGridListImageItem",
    kind: "simpletwitch.AutoFetchingDataGridListImageItem",
    bindings: [
        {from: ".model.status", to: ".caption"},
        {from: ".model.viewersOnChannelText", to: ".subCaption"},
        {from: ".model.preview", to: ".source"}
    ]
});