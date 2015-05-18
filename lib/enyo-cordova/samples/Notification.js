enyo.kind({
	name: "enyo.cordova.sample.Notification",
	classes: "onyx cordova-sample",
	components: [
		{kind:"enyo.Signals", ondeviceready:"deviceready"},
		{classes: "cordova-sample-divider", content: "Basic Notification API"},
		{classes: "cordova-sample-tools", components: [
			{kind:"onyx.Button", content: "Beep", ontap:"beepButton"},
			{kind:"onyx.Button", content: "Vibrate", ontap:"vibrateButton"}
		]},
		{tag:"br"},
		{classes: "cordova-sample-divider", content: "Interactive Notification API"},
		{classes: "cordova-sample-tools", components: [
			{kind:"onyx.Button", content: "Alert", ontap:"alertButton"},
			{kind:"onyx.Button", content: "Confirm", ontap:"confirmButton"},
			{kind:"onyx.Button", content: "Prompt", ontap:"promptButton"}
		]},
		{tag:"br"},
		{kind: "onyx.Groupbox", classes:"cordova-sample-result-box", components: [
			{kind: "onyx.GroupboxHeader", content: "Result"},
			{name:"result", classes:"cordova-sample-result", allowHtml:true, content:"Notification API not supported on this platform."}
		]}
	],
	deviceready: function(inSender, inEvent) {
		this.$.result.setContent("No button tapped yet.");
	},
	beepButton: function(inSender, inEvent) {
		if(navigator.notification && navigator.notification.beep) {
			navigator.notification.beep(1);
			this.$.result.setContent("Beep executed");
		}
		return true;
	},
	vibrateButton: function(inSender, inEvent) {
		if(navigator.notification && navigator.notification.vibrate) {
			navigator.notification.vibrate(1000);
			this.$.result.setContent("Vibrate executed");
		}
		return true;
	},
	alertButton: function(inResponse) {
		if(navigator.notification && navigator.notification.alert) {
			navigator.notification.alert("This is an alert notification.", enyo.bind(this, "alertCallback"));
		}
		return true;
	},
	alertCallback: function() {
		this.$.result.setContent("Alert executed");
	},
	confirmButton: function(inError) {
		if(enyo.platform.webos && enyo.platform.webos<=3) { //legacy webOS devices
			this.$.result.setContent("Confirm not supported on this version of webOS");
		} else if(navigator.notification && navigator.notification.alert) {
			navigator.notification.alert("This is a confirmation notification, which has multiple button options.",
					this.bindSafely("confirmCallback"));
		}
		return true;
	},
	confirmCallback: function(inButtonIndex) {
		this.$.result.setContent("Confirm executed; button with index " + inButtonIndex + " was selected");
	},
	promptButton: function(inError) {
		if(enyo.platform.webos && enyo.platform.webos<=3) { //legacy webOS devices
			this.$.result.setContent("Prompt not supported on this version of webOS");
		} else if(navigator.notification && navigator.notification.alert) {
			navigator.notification.alert("This is a prompt notification with a text input and button options.",
					enyo.bind(this, "promptCallback"));
		}
		return true;
	},
	promptCallback: function(inResponse) {
		this.$.result.setContent("Prompt executed; button with index " + inResponse.buttonIndex + " was selected, " +
				"returning the inputted text \"" + inResponse.input1 + "\"");
	}
});