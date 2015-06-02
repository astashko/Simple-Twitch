/* global enyo */

enyo.kind({
	name: "simpletwitch.StreamModel",
	kind: "enyo.Model",
	readOnly: true,
    attributes: {
        viewersOnChannelText: function() {
            return this.get("viewers").toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " viewers on " + this.get("displayName");
        }
    },
    computed: {
         viewersOnChannelText: ["viewers", "displayName"]
    },
    parse: function(data) {
        return {
            preview: data.preview.medium,
            name: data.channel.name,
            displayName: data.channel.display_name,
            status: data.channel.status,
            viewers: data.viewers
        };
    }
});