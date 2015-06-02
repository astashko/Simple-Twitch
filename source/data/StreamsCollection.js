/* global enyo */

enyo.kind({
    name: "simpletwitch.StreamsCollection",
    kind: "simpletwitch.TwitchRemoteCollection",
    model: "simpletwitch.StreamModel",
    url: "streams",
    parse: function(data) {
        return data && data.streams;
    },
    fetch: function(opts) {
        if (this.get("game")) {
            opts.params.game = this.get("game");
        }
        this.inherited(arguments);
    }
});