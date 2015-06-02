/* global enyo */

enyo.kind({
    name: "simpletwitch.GameModel",
    kind: "enyo.Model",
    readOnly: true,
    attributes: {
        viewersOnGameText: function() {
            return this.get("viewers").toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " viewers";
        }
    },
    computed: {
        viewersOnGameText: ["viewers"]
    },
    parse: function(data) {
        return {
            preview: data.game.box.large,
            name: data.game.name,
            viewers: data.viewers
        };
    }
});