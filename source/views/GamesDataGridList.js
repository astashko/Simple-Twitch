/* global enyo */

enyo.kind({
    name: "simpletwitch.GamesDataGridList",
    kind: "simpletwitch.AutoFetchingDataGridList",
    minWidth: 294,
    minHeight: 488,
    collectionKind: "simpletwitch.GamesCollection",
    components: [{
        kind: "simpletwitch.GamesDataGridListImageItem"
    }]
});

enyo.kind({
    name: "simpletwitch.GamesDataGridListImageItem",
    kind: "simpletwitch.AutoFetchingDataGridListImageItem",
    bindings: [
        {from: ".model.name", to: ".caption"},
        {from: ".model.viewersOnGameText", to: ".subCaption"},
        {from: ".model.preview", to: ".source"}
    ]
});