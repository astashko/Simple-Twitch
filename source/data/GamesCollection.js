/* global enyo */

enyo.kind({
    name: "simpletwitch.GamesCollection",
    kind: "simpletwitch.TwitchRemoteCollection",
    model: "simpletwitch.GameModel",
    url: "games/top",
    parse: function(data) {
        return data && data.top;
    }
});