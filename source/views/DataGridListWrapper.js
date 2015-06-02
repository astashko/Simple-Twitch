/* global enyo */

enyo.kind({
    name: "simpletwitch.DataGridListWrapper",
    kind: "enyo.Control",
    classes: "navigation-grid-wrapper",
    clearData: function() {
        this.$.grid.clearData();
    },
    initData: function(data) {
        this.$.grid.initData(data);
    }
});

enyo.kind({
    name: "simpletwitch.GamesDataGridListWrapper",
    kind: "simpletwitch.DataGridListWrapper",
    events: {
        onGameSelected: ""
    },
    components: [
        {name: "grid", kind: "simpletwitch.GamesDataGridList"}
    ],
    itemSelected: function(inSender, inEvent) {
        this.doGameSelected({ game: inEvent.model });
        console.log(inEvent.model);
    }
});
enyo.kind({
    name: "simpletwitch.StreamsDataGridListWrapper",
    kind: "simpletwitch.DataGridListWrapper",
    events: {
        onStreamSelected: ""
    },
    components: [
        {name: "grid", kind: "simpletwitch.StreamsDataGridList"}
    ],
    itemSelected: function(inSender, inEvent) {
        this.doStreamSelected({ stream: inEvent.model });
        console.log(inEvent.model);
    }
});