/* global enyo */

enyo.kind({
	name: "simpletwitch.MainView",
	classes: "moon enyo-fit enyo-unselectable main-view",
	handlers: {
		onStreamSelected: "streamSelected"
	},
	components: [
	    { name: "player", kind: "simpletwitch.Player", showing: false },
        { name: "navigation", kind: "simpletwitch.Navigation" }
	],
	streamSelected: function (inSender, inEvent) {
		this.showPlayer(inEvent.stream);
	},
    create: function() {
        this.inherited(arguments);
        window.history.replaceState({view: "navigation"});
        window.addEventListener('popstate', enyo.bindSafely(this, "onPopState"));
    },
    onPopState: function(inEvent) {
        if (inEvent.state && (inEvent.state.view === "navigation")) {
            this.hidePlayer();
        }
    },
    showPlayer: function(channel) {
        window.history.pushState({view: "player"});
        this.$.player.selectChannel(channel);
        this.$.navigation.hide();
        this.$.player.show();
    },
    hidePlayer: function() {
        this.$.player.hide();
        this.$.navigation.show();
        this.$.player.model.clear();
    }
});