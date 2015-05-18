enyo.kind({
	name: "enyo.cordova.sample.Device",
	classes: "onyx cordova-sample",
	components: [
		{kind:"enyo.Signals", ondeviceready:"deviceready"},
		{classes: "cordova-sample-divider", content: "Device API"},
		{kind: "onyx.Groupbox", classes:"cordova-sample-result-box", components: [
			{kind: "onyx.GroupboxHeader", content: "window.device"},
			{name:"result", classes:"cordova-sample-result", content:"Device API not supported on this platform."}
		]}
	],
	deviceready: function(inSender, inEvent) {
		if(window.device) {
			this.$.result.setContent(enyo.json.stringify(window.device, null, "\t"));
		}
	}
});