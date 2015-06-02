enyo.kind({
	name: "simpletwitch.MainView",
	classes: "moon enyo-fit enyo-unselectable main-view",
	handlers: {
		onChannelSelected: "channelSelected"
	},
	components: [
	    { name: "player", kind: "simpletwitch.Player", showing: false },
        { name: "navigation", kind: "simpletwitch.Navigation" }
	],
	channelSelected: function (inSender, inEvent) {
		this.$.player.selectChannel(inEvent.channel);
	}
});