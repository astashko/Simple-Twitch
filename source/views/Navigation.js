/* global enyo, simpletwitch */

enyo.kind({
    name: "simpletwitch.Navigation",
    kind: "moon.Panel",
    classes: "enyo-fit",
    title: "Simple Twitch",
    autoNumber: false,
    smallHeader: true,
    handlers: {
        onShowStreams: "showStreams",
        onShowGames: "showGames",
        onGameSelected: "gameSelected"
    },
    components: [
        {kind: "enyo.FittableColumns", fit: true, components: [
            {name: "menu", kind: "simpletwitch.MainMenu"},
            {name: "streams", kind: "simpletwitch.StreamsDataGridListWrapper", fit: true, showing: false},
            {name: "games", kind: "simpletwitch.GamesDataGridListWrapper", fit: true, showing: false}
        ]}
    ],
    clearUI: function() {
        this.$.streams.hide();
        this.$.games.hide();
        this.$.streams.clearData();
        this.$.games.clearData();
    },
    showStreams: function() {
        this.clearUI();
        this.$.streams.initData();
        this.$.streams.show();
    },
    showGames: function() {
        this.clearUI();
        this.$.games.initData();
        this.$.games.show();
    },
    gameSelected: function(inSender, inEvent) {
        this.clearUI();
        this.$.menu.set("active", null);
        this.$.streams.initData(inEvent.game);
        this.$.streams.show();
    }
});