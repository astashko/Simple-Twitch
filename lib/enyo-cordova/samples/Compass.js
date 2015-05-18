enyo.kind({
	name: "enyo.cordova.sample.Compass",
	classes: "onyx cordova-sample",
	components: [
		{classes: "cordova-sample-divider", content: "Compass API"},
		{classes: "cordova-sample-tools", components: [
			{kind:"onyx.Button", content: "getCurrentHeading", ontap:"getCurrentHeading"},
			{name:"watchToggle", kind:"onyx.Button", content: "watchHeading", ontap:"toggleWatch"}
		]},
		{kind: "onyx.Groupbox", classes:"cordova-sample-result-box", components: [
			{kind: "onyx.GroupboxHeader", content: "Result"},
			{name:"result", classes:"cordova-sample-result", allowHtml:true, content:"No button tapped yet."}
		]}
	],
	getCurrentHeading: function(inSender, inEvent) {
		if(navigator.compass && navigator.compass.getCurrentHeading) {
			navigator.compass.getCurrentHeading(this.bindSafely("compassSuccess"),
					this.bindSafely("compassFailure"));
		} else {
			this.$.result.setContent("Compass API not supported on this platform.");
		}
		return true;
	},
	toggleWatch: function(inSender, inEvent) {
		if(navigator.compass && navigator.compass.watchHeading) {
			if(this.watchID) {
				navigator.compass.clearWatch(this.watchID);
				this.$.result.setContent("Stopped compass heading watching.");
				this.watchID = undefined;
				this.$.watchToggle.setContent("watchHeading");
			} else {
				this.watchID = navigator.compass.watchHeading(this.bindSafely("compassSuccess"),
						this.bindSafely("compassFailure"), {frequency: 500});
				if(this.watchID) {
					this.$.watchToggle.setContent("clearWatch");
				}
			}
		} else {
			this.$.result.setContent("Compass API not supported on this platform.");
		}
		return true;
	},
	compassSuccess: function(inResponse) {
		this.$.result.setContent("Magnetic Heading: " + inResponse.magneticHeading + "<br />" +
				"True Heading: " + inResponse.trueHeading + "<br />" +
				"Heading Accuracy: " + inResponse.headingAccuracy + "<br />" +
				"Timestamp: " + inResponse.timestamp);
	},
	compassFailure: function(inError) {
		var details = "";
		if(inError.code==20) {
			details += "<br><br>Compass not supported";
		} else if(inError.code===0) {
			details += "<br><br>Internal compass error";
		}
		this.$.result.setContent("Unable to retrieve compass data." + details); 
	},
	destroy: function() {
		if(this.watchID) {
			navigator.compass.clearWatch(this.watchID);
		}
		this.inherited(arguments);
	}
});
