enyo.kind({
	name: "enyo.cordova.sample.Geolocation",
	classes: "onyx cordova-sample",
	components: [
		{classes: "cordova-sample-divider", content: "Geolocation API"},
		{classes: "cordova-sample-tools", components: [
			{kind:"onyx.Button", content: "getCurrentPosition", ontap:"getCurrentPosition"},
			{name:"watchToggle", kind:"onyx.Button", content: "watchPosition", ontap:"toggleWatch"}
		]},
		{tag:"br"},
		{kind: "onyx.Groupbox", classes:"cordova-sample-result-box", components: [
			{kind: "onyx.GroupboxHeader", content: "Result"},
			{name:"result", classes:"cordova-sample-result", allowHtml:true, content:"No button tapped yet."}
		]}
	],
	getCurrentPosition: function(inSender, inEvent) {
		if(navigator.geolocation && navigator.geolocation.getCurrentPosition) {
			navigator.geolocation.getCurrentPosition(this.bindSafely("geoSuccess"),
					this.bindSafely("geoFailure"),
					{maximumAge:3000, timeout:15000, enableHighAccuracy:true});
		} else {
			this.$.result.setContent("Geolocation API not supported on this platform.");
		}
		return true;
	},
	toggleWatch: function(inSender, inEvent) {
		if(navigator.geolocation && navigator.geolocation.watchPosition) {
			if(this.watchID) {
				navigator.geolocation.clearWatch(this.watchID);
				this.$.result.setContent("Stopped geolocation watching.");
				this.watchID = undefined;
				this.$.watchToggle.setContent("watchPosition");
			} else {
				this.watchID = navigator.geolocation.watchPosition(this.bindSafely("geoSuccess"),
						this.bindSafely("geoFailure"),
						{maximumAge:3000, timeout:5000, enableHighAccuracy:true});
				if(this.watchID) {
					this.$.watchToggle.setContent("clearWatch");
				}
			}
		} else {
			this.$.result.setContent("Geolocation API not supported on this platform.");
		}
		return true;
	},
	geoSuccess: function(inResponse) {
		this.$.result.setContent("Latitude: " + inResponse.coords.latitude + "<br/>" +
                            "Longitude: " + inResponse.coords.longitude + "<br/>" +
                            "Altitude: " + inResponse.coords.altitude + "<br/>" +
                            "Accuracy: " + inResponse.coords.accuracy + "<br/>" +
                            "Altitude Accuracy: " + inResponse.coords.altitudeAccuracy + "<br/>" +
                            "Heading: " + inResponse.coords.heading + "<br/>" +
                            "Speed: " + inResponse.coords.speed + "<br/>" +
                            "Timestamp: " + inResponse.timestamp);
	},
	geoFailure: function(inError) {
		this.$.result.setContent("Unable to retrieve geolocation data.<br/>" + inError.code + ": " + inError.message);
	},
	destroy: function() {
		if(this.watchID) {
			navigator.geolocation.clearWatch(this.watchID);
		}
		this.inherited(arguments);
	}
});