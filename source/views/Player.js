/* global simpletwitch, enyo */

enyo.kind({
	name: "simpletwitch.Player",
	kind: "moon.VideoPlayer",
    poster: "assets/video-poster.png",
    autoplay: true,
    showJumpControls: false,
    showProgressBar: false,
    showPlaybackControls: false,
	bindings: [
	    {from: ".model.streamUrl", to: ".src"}
	],
	selectChannel: function (channel) {
		this.model.loadForChannel(channel);
	},
	create: function() {
		this.inherited(arguments);
		this.set("model", new simpletwitch.PlaylistModel());
	}
});