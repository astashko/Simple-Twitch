/**
Listens for webOS specific events

Events are exposed through the [Signals](#enyo.Signals) kind by adding callback handlers.

Example:

enyo.kind({
	name: "App",
	components: [
		{kind: "Signals", onwebOSRelaunch: "relaunch"},
		...
		],
	relaunch: function(inSender, inEvent) {
		// Launch parameters json can be found within inEvent.detail
	}
});
*/

//* @protected
(function() {
	if (enyo.platform.webos || window.PalmSystem) {
		var wev = [
			"webOSLaunch",
			"webOSRelaunch",
			"webOSLocaleChange"
		];
		for (var i=0, e; (e=wev[i]); i++) {
			document.addEventListener(e, enyo.bind(enyo.Signals, "send", "on" + e), false);
		}
	}
})();
