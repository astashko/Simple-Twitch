/* global enyo */

enyo.kind({
    name: "simpletwitch.MainMenu",
    kind: "enyo.Group",
    events: {
        onShowStreams: "",
        onShowGames: ""
    },
    classes: 'moon-4h',
    allowHighlanderDeactivate: true,
    components: [
        {kind: "moon.SelectableItem", content: "Streams", page: "streams", selected: true},
        {kind: "moon.SelectableItem", content: "Games", page: "games"}
    ],
    activeChanged : function() {
        this.inherited(arguments);
        if (this.active) {
            if (this.active.page === "streams") {
                this.doShowStreams({});
            } else if (this.active.page === "games") {
                this.doShowGames({});
            }
        }
    }
});