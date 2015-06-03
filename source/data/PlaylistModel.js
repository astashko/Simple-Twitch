/* global enyo */

enyo.kind({
    name: "simpletwitch.PlaylistModel",
    kind: "enyo.Model",
    readOnly: true,
    published: {
        active: false
    },
    attributes: {
		streamUrl: function() {
            if (this.get("active")) {
                return "http://simpletwitch.esy.es/stream.m3u8?channel=" + this.channelName;
            } else {
                return "";
            }
		}
	},
    computed: {
		streamUrl: ["active"]
	},
    loadForChannel: function(channel) {
		this.channelName = channel.get("name");
        this.set("active", true);
	},
    clear: function() {
        this.set("active", false);
    }
});