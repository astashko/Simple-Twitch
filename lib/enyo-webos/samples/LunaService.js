enyo.kind({
	name: "enyo.webos.sample.LunaService",
	classes: "onyx enyo-fit",
	kind:"enyo.Scroller",
	components: [
		{classes: "webos-sample", components:[
			{name:"networkStatus", kind:"enyo.LunaService", service:"luna://com.palm.connectionmanager", method: "getstatus", onResponse:"serviceResponse", onError:"serviceError"},
			{kind:"enyo.Signals", ondeviceready:"deviceready"},
			{classes: "webos-sample-divider", content: "Device API"},
			{kind: "onyx.Groupbox", classes:"webos-sample-result-box", components: [
				{kind: "onyx.GroupboxHeader", content: "enyo.LunaService"},
				{name:"result", classes:"webos-sample-result", content:"LunaService API not supported on this platform.", allowHtml:true}
			]}
		]}
	],
	deviceready: function(inSender, inEvent) {
		if(enyo.platform.webos) {
			this.request = this.$.networkStatus.send({}); //no parameters needed for this service call
			//in this example, can cancel the request from this.request.cancel()
		}
	},
	serviceResponse: function(inSender, inEvent) {
		//Note: inEvent.originator will point to the request object (the same one set to this.request above)
		this.$.result.setContent("isInternetConnectionAvailable: " + inEvent.isInternetConnectionAvailable + "<br><br>"
				+ "Wired: " + enyo.json.stringify(inEvent.wired, null, "\t") + "<br><br>"
				+ "WiFi: " + enyo.json.stringify(inEvent.wifi, null, "\t") + "<br><br>"
				+ "WAN: " + enyo.json.stringify(inEvent.wan, null, "\t"));
	},
	serviceError: function(inSender, inEvent) {
		this.$.result.setContent("Error: " + inEvent.errorText);
	}
});