enyo.kind({
	name: "simpletwitch.MainView",
	classes: "moon enyo-fit enyo-unselectable",
	handlers: {
		onChannelSelected: "channelSelected"
	},
	components: [
	    { name: "player", kind: "simpletwitch.Player" },
        { name: "navigation", kind: "simpletwitch.Navigation" }
	],
	channelSelected: function (inSender, inEvent) {
		this.$.player.selectChannel(inEvent.channel);
	}
});